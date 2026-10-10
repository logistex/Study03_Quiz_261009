// 2026-10-05 17:39 KST
// guard: 클로드의 고질적 실수를 막는 장치 모음
// 1. 질문에 먼저 답하기: 교수 메시지의 어느 자리에든 질문이 있으면, 답 글 없이 도구부터 부를 때 한 번 막음
import type { Register } from 'claude-code'

import type { EngineInterface } from 'claude-code'
import { newTurn, appendPrompt, recordTool, addAnswer, addStepAnswer } from './state'
import { isOutbound, statesOrder, isPlanSkill, unclearPrompt, roughTimeWrite, isModsNewBranch, mainChangedSince, rulingWrite } from './detect'
import type { Turn } from './state'
import { runStopChecks, checkUnclear, makeCheckScreen, checkDone, checkRoughTime, checkNotionAfterMerge } from './stop'
import type { Unclear } from './stop'

// 지금 차례의 상태. 모듈이 다시 읽히면 null이 되고, 그때는 아무것도 막지 않음
let turn: Turn | null = null
// G14: 이 모듈(지금 앱이 읽은 guard)을 실은 시각. main이 이보다 뒤에 바뀌었으면 앱이 새 코드를 아직 읽지 않은 것임
const LOADED_AT = Date.now()
// 앞 차례까지의 대화 글을 앱의 대화 기록에서 읽음. 앱을 재시작해도 남아 있음(길면 뒤쪽 20만 자만 씀)
// 이번 차례를 연 교수 메시지(글이 있고 도구 결과가 아닌 마지막 user 메시지)까지 넣고, 그 뒤의 이번 답 글은 뺌
async function priorText($: EngineInterface): Promise<string> {
  try {
    const ms = await $.session.messages()
    if (!Array.isArray(ms)) return ''
    let end = ms.length - 1
    while (end >= 0 && !(ms[end].role === 'user' && ms[end].text.trim() && !ms[end].toolResults?.length)) end--
    return ms.slice(0, end + 1).map(m => m.text).join('\n').slice(-200000)
  } catch {
    return ''
  }
}

// G2의 작은 모델 판정. 실패하거나 JSON이 아니면 null(정규식 결과만 씀)
async function judgeUnclear($: EngineInterface, answer: string): Promise<Unclear | null> {
  const prompt = unclearPrompt(answer)
  const r = await $.model.complete({ model: 'haiku', prompt, maxTokens: 400 })
  if (!r.isAnswered) return null
  try {
    const j = JSON.parse(r.text.slice(r.text.indexOf('{'), r.text.lastIndexOf('}') + 1))
    return { names: j.names ?? [], unclear: j.unclear ?? [], links: j.links ?? [], screen: Array.isArray(j.screen) ? j.screen : undefined }
  } catch {
    return null
  }
}

// 같은 답 글은 한 번만 판정함(G2와 G4가 함께 씀)
let judged: { answer: string; p: Promise<Unclear | null> } | null = null
function judgeOnce($: EngineInterface, answer: string): Promise<Unclear | null> {
  if (judged?.answer !== answer) judged = { answer, p: judgeUnclear($, answer) }
  return judged.p
}

// 답 글 검사들(G2 이름과 문장, G4 화면 절차, G6 완료, G12 시각, G13 노션). G16과 Stop 훅이 함께 씀
function preChecks($: EngineInterface, answer: string): Promise<string | null> {
  return runStopChecks([checkUnclear(a => judgeOnce($, a), () => priorText($)), makeCheckScreen(a => judgeOnce($, a)), checkDone, checkRoughTime, checkNotionAfterMerge], answer, turn)
}

// G15: 계획 실행 스킬의 Rulings 절(계획과 다른 결정을 혼자 내리고 기록만 남기라는 지시)과 Continuous execution 절(태스크 사이에 멈추지 말라는 지시)을 따르지 않게 스킬 결과 뒤에 덧붙일 글(2026-10-06 신 교수 결정)
const PLAN_SKILL_NOTE = '[guard] 이 스킬의 Rulings 절(계획과 다른 결정을 혼자 내리고 Ruling: 줄만 남기라는 지시)은 쓰지 않음. 계획과 다르게 정할 일이 생기면 멈추고 신 교수에게 여쭐 것. Continuous execution 절(태스크 사이에 멈추지 말라는 지시)도 쓰지 않음. 태스크 하나를 끝내면 차례를 끝내고 답을 기다릴 것. 진행 상황 요약을 시간 낭비로 보는 지시도 따르지 않음. 태스크마다 바뀐 것, 시험 결과, 남은 일을 보고할 것. 멈추는 이유를 스킬이 정한 4가지로 한정하지 않음. 계획, 작업 순서, 확인 절차, 브랜치 규칙처럼 신 교수와 정한 방식을 바꿔야 할 때도 멈추고 여쭐 것(전역 CLAUDE.md 1절).'

// G16: 걸린 답 대신 내보내는 자리표시 글
const HOLD_TEXT = '[guard] 답을 고치는 중임.'

function questionList(t: Turn): string {
  return t.questions.map(q => '「' + q.slice(0, 80) + '」').join(', ')
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    // 작업 중에 보낸 메시지(turnId가 있음)는 지금 차례에 이어 붙임
    if (e.turnId && turn) appendPrompt(turn, e.text)
    else turn = newTurn(e.text)
    if (e.attachments?.some(a => a.type === 'image')) turn.sawImage = true
    if (turn.questions.length === 0 || turn.answered) return next(e)
    const note = '[guard] 이 메시지에 질문이 있음: ' + questionList(turn) +
      '. 도구를 부르거나 작업을 시작하기 전에, 답 글의 첫머리에서 이 질문에 먼저 답할 것(예, 아니오로 답할 수 있으면 그 한 마디부터).'
    return next({ ...e, context: [...(e.context ?? []), note] })
  })

  // 모델이 답 글을 썼으면 질문에 답한 것으로 봄
  // 응답 조각을 받는 대로 답 글로 셈. 도구 호출이 응답이 끝나기 전에 실행되어도 앞서 쓴 글을 놓치지 않게 함
  // G16: 도구 호출이 없는 마지막 답은 조각을 모아 두었다가 검사를 통과한 뒤에 내보냄. 걸리면 답 글을 내보내지 않고
  // Stop 훅이 다시 쓰게 함. 같은 답이 화면에 두 번 나오지 않게 하기 위함(2026-10-07 신 교수 결정)
  // 도구 호출 조각이 오면 모은 조각을 바로 내보내고 그 뒤는 흘려보냄. 한 차례에 한 번만 보류함
  on('turn.step', async function* ($, e, next) {
    const it = next(e)[Symbol.asyncIterator]()
    let sawText = false
    let hold = !e.agentId && !!turn && !turn.blocked.has('G16')
    const buf: any[] = []
    let text = ''
    for (;;) {
      const r = await it.next()
      if (r.done) {
        // 조각 없이 결과만 온 경우(시험의 흉내 낸 엔진 등)에도 답 글로 셈
        if (!e.agentId && turn) {
          addStepAnswer(turn, sawText, r.value.answer)
          if (statesOrder(turn.answerText)) turn.orderStated = true
        }
        if (!hold || !turn) return r.value
        if (r.value.toolUses?.length) { for (const c of buf) yield c; return r.value }
        const answer = text || r.value.answer || ''
        const reason = answer.trim() ? await preChecks($, answer) : null
        if (!reason) {
          turn.preChecked = answer
          for (const c of buf) yield c
          return r.value
        }
        turn.blocked.add('G16')
        turn.withheld = reason
        // 글을 모두 빼면 앱이 글 없는 답으로 보고 Stop 훅보다 먼저 다시 쓰게 해, 검사 없이 나간 답과 고친 답이
        // 둘 다 보였음(2026-10-07). 첫 글 조각 자리에 자리표시 글 1줄만 내보냄(신 교수 결정, 가 안)
        let placed = false
        for (const c of buf) {
          if (c.kind !== 'text') yield c
          else if (!placed) { placed = true; yield { ...c, text: HOLD_TEXT } }
        }
        return { ...r.value, answer: HOLD_TEXT }
      }
      const c = r.value
      if (!e.agentId && turn && c.kind === 'text') {
        sawText = true
        text += c.text
        addAnswer(turn, c.text)
        if (statesOrder(turn.answerText)) turn.orderStated = true
      }
      if (hold && c.kind === 'tool') {
        hold = false
        for (const b of buf) yield b
        buf.length = 0
      }
      if (hold) buf.push(c)
      else yield c
    }
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId || !turn) return next(e)
    // G12: 어림한 시각(11:4x 꼴)을 파일에 쓰려 하면 한 번 막음(2026-10-05~06에 7 번 되풀이됨)
    if (roughTimeWrite(e.tool, e) && !turn.blocked.has('G12')) {
      turn.blocked.add('G12')
      return { deny: '[guard] 어림한 시각(분 자리를 x로 쓴 시각)을 쓰려 함. date, git reflog, 세션 기록, 화면 등 출처에서 읽은 시각으로 쓰거나, 시각을 빼고 날짜만 적을 것.' }
    }
    // G9: 작업 기록에 계획과 다른 결정(Ruling:)을 쓰려 하면 한 번 막음. 승인 예외는 두지 않음(2026-10-06 신 교수 결정)
    if (rulingWrite(e.tool, e) && !turn.blocked.has('G9')) {
      turn.blocked.add('G9')
      return { deny: '[guard] 계획과 다르게 정하려는 결정이 있음. 작업 기록에 적기 전에, 무엇을 왜 바꾸는지와 바꾸지 않으면 어떻게 되는지를 신 교수에게 먼저 여쭐 것. 이미 허락받은 결정이면 그렇다고 답 글에 밝히고 다시 쓸 것.' }
    }
    // G14: mod 저장소의 main을 바꾼 뒤 앱을 재시작하지 않았는데 다음 브랜치를 만들려 하면 한 번 막음(2026-10-06 실제 세션 시험을 빠뜨린 일)
    if (isModsNewBranch(e.tool, e) && !turn.blocked.has('G14')) {
      let reflog = ''
      try { reflog = String(await $.fs.read($.plugin.root + '/../.git/logs/refs/heads/main')) } catch { reflog = '' }
      if (mainChangedSince(reflog, LOADED_AT)) {
        turn.blocked.add('G14')
        return { deny: '[guard] mod 저장소의 main이 앱이 guard를 읽은 뒤에 바뀌었음. 새 브랜치를 만들기 전에, 신 교수에게 앱 재시작을 요청하고 병합한 장치를 실제 세션에서 시험할 것.' }
      }
    }
    recordTool(turn, e.tool, e)
    // G5: 노션 MCP 편집은 한 번 막고 notion-write 스킬을 쓰게 함(한글이 깨진 사례가 되풀이됨)
    if (/notion-update-page$/.test(e.tool) && !turn.blocked.has('G5')) {
      turn.blocked.add('G5')
      return { deny: '[guard] 노션은 notion-update-page 대신 notion-write 스킬로 고칠 것(MCP로 보내면 한글이 깨진 사례가 되풀이됨). 스킬이 계속 실패하면 신 교수에게 묻고 다시 부를 것.' }
    }
    // G3: 밖으로 나가는 호출인데 이번 차례에 승인 낱말이 없으면 한 번 막음
    if (isOutbound(e.tool, e) && !turn.approved && !turn.blocked.has('G3')) {
      turn.blocked.add('G3')
      return { deny: '[guard] 밖으로 나가는 호출(게시, push, 노션 편집, DB 변경)인데 신 교수의 승인 낱말(올려, 푸시해, 진행해, 그대로)이 없음. 무엇을 할지 보이고 승인을 받을 것.' }
    }
    // G1 질문에 먼저 답하기, G7 순서 밝히기: 함께 걸리면 한 번에 막음
    const g1 = turn.questions.length > 0 && !turn.answered && !turn.blocked.has('G1')
    const g7 = turn.tasks >= 2 && !turn.orderStated && !turn.blocked.has('G7')
    if (!g1 && !g7) {
      if (!isPlanSkill(e.tool, e)) return next(e)
      const r = await next(e)
      return r.deny ? r : { ...r, context: [...(r.context ?? []), PLAN_SKILL_NOTE] }
    }
    turn.blocked.add('G1')
    turn.blocked.add('G7')
    const asks: string[] = []
    if (g1) asks.push('답하지 않은 질문이 있음: ' + questionList(turn) + '. 답 글로 먼저 답할 것')
    if (g7) asks.push('할 일이 ' + turn.tasks + ' 개임. 물어본 것부터 답하고, 즉답할 수 있는 것을 먼저, 오래 걸리는 것을 나중에 하는 순서를 첫머리에 밝힐 것')
    return { deny: '[guard] 도구를 부르기 전에: ' + asks.join(' / ') + '. 그다음 작업을 이어 갈 것.' }
  })

  // 답을 끝내려 할 때 고칠 것이 있으면 한 번 막고 같은 답 안에서 고치게 함
  // G16으로 보류한 답이 있으면 그 고칠 점으로 막음. 미리 검사를 통과한 답은 다시 검사하지 않음
  on('classic.Stop', async ($, e, next) => {
    if (turn?.withheld) {
      const w = turn.withheld
      turn.withheld = null
      return { block: w + '\n- 앞의 답은 화면에 나가지 않았음. 고칠 점을 반영해 답 전체를 처음부터 다시 쓸 것.' }
    }
    if (e.stop_hook_active) return next(e)
    const last = e.last_assistant_message ?? ''
    if (turn?.preChecked && turn.preChecked.trim() === last.trim()) return next(e)
    const reason = await preChecks($, last)
    return reason ? { block: reason } : next(e)
  })

}
