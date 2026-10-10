// 2026-10-05 19:21 KST
// 답을 끝내기 전에(classic.Stop) 고칠 것을 찾는 검사들
import { findInternalNames, COMMIT_WORDS, countScreenWords, isScreenCall, hasDoneWords, roughTimes } from './detect'
import type { Turn } from './state'

// G12: 답 글에 어림한 시각(11:4x 꼴)이 있으면 고칠 것
export const checkRoughTime = async (answer: string, _turn: Turn | null): Promise<string | null> => {
  const found = roughTimes(answer)
  return found.length ? '어림한 시각: ' + [...new Set(found)].map(t => '「' + t + '」').join(', ') + '. date, git reflog, 세션 기록, 화면 등 출처에서 읽은 시각으로 고치거나, 시각을 빼고 날짜만 적을 것' : null
}

// G13: 이번 차례에 mod 저장소를 병합했는데 노션에 반영하지도, 노션 반영 초안을 내지도 않았으면 고칠 것
export const checkNotionAfterMerge = async (answer: string, turn: Turn | null): Promise<string | null> => {
  if (!turn?.modsMerged || turn.notionApplied) return null
  const text = (turn.answerText || '') + '\n' + answer
  if (/노션/.test(text) && /(초안|반영)/.test(text)) return null
  return 'mod 저장소에 병합했는데 노션 기록이 없음. 노션 반영 초안(노트 위치와 넣을 문장)을 이 답에 함께 낼 것(인수인계 문서 3절)'
}

// 고칠 것이 있으면 이유 한 줄, 없으면 null
export type StopCheck = (answer: string, turn: Turn | null) => Promise<string | null>

// screen: 화면 조작 절차 문장(G4가 씀)
export type Unclear = { names: string[]; unclear: string[]; links: string[]; screen?: string[] }
export type Judge = (answer: string) => Promise<Unclear | null>

// 검사를 모두 돌려 이유를 모음. 없으면 null
export async function runStopChecks(checks: StopCheck[], answer: string, turn: Turn | null): Promise<string | null> {
  const reasons: string[] = []
  for (const c of checks) {
    const r = await c(answer, turn)
    if (r) reasons.push(r)
  }
  return reasons.length ? '[guard] 답을 끝내기 전에 고칠 것이 있음.\n' + reasons.map(r => '- ' + r).join('\n') : null
}

// 답 글 안에서 이미 풀이가 붙은 이름인지: 같은 문장에 커밋, 깃허브, 푸시, 병합이 있거나, 바로 뒤에 풀이 괄호가 있음
function explainedHere(answer: string, name: string): boolean {
  for (const s of answer.split(/\n|(?<=[.!?])\s+/)) {
    const i = s.indexOf(name)
    if (i < 0) continue
    if (COMMIT_WORDS.test(s)) return true
    if (/^[`'"」』]?\s?\(/.test(s.slice(i + name.length, i + name.length + 3))) return true
  }
  return false
}

// G2: 설명 없는 이름, 뜻이 안 읽히는 문장, 근거 없는 연결
// prior: 앞 차례까지의 대화 글(앱의 대화 기록에서 읽음). 거기 나온 이름은 이미 설명된 것으로 봄
export function checkUnclear(judge: Judge, prior: () => Promise<string> = async () => ''): StopCheck {
  return async (answer, turn) => {
    const names = findInternalNames(answer)
    const j = answer.length >= 300 ? await judge(answer) : null
    const known = (await prior()) + '\n' + (turn?.known ?? '') + '\n' + (turn?.prompt ?? '')
    const all = [...new Set([...names, ...(j?.names ?? [])])].filter(n => !known.includes(n) && !explainedHere(answer, n))
    const parts: string[] = []
    if (all.length) parts.push('설명 없이 쓴 이름: ' + all.map(n => '「' + n + '」').join(', ') + '. 무엇을 가리키는지 풀어 적을 것')
    if (j?.unclear.length) parts.push('뜻이 안 읽히는 문장: ' + j.unclear.map(n => '「' + n + '」').join(', ') + '. 빠진 목적어나 주어를 채울 것')
    if (j?.links.length) parts.push('근거 없이 잇는 말: ' + j.links.map(n => '「' + n + '」').join(', ') + '. 근거를 대거나 두 일을 따로 적을 것')
    return parts.length ? parts.join(' / ') : null
  }
}

// G4: 화면 조작 절차를 썼는데 이번 차례에 화면을 보지 않았으면 고칠 것
// 절차인지는 작은 모델이 판정함. 판정이 없으면 화면 낱말 수(2개 이상)로 봄. 교수 메시지에 붙은 그림도 본 화면으로 침
export type ScreenJudge = (answer: string) => Promise<{ screen?: string[] } | null>
// 모델이 골라도 화면 조작 절차가 아닌 꼴: 키보드 단축키, 답장 문구 안내, 동작 낱말 없는 명령 이름(2026-10-06 신 교수 결정, 판정 문장을 고친 뒤에도 4 번 잡음)
export function notScreenStep(s: string): boolean {
  if (/(Cmd|Command|Ctrl|Control|Option|Alt|Shift|⌘)\s*\+\s*\S/i.test(s)) return true
  if (/[」』"'`]\s*(이)?라고(만)?\s*(답|보내|적어|말씀)/.test(s)) return true
  return /`[^`]+`/.test(s) && !/누르|누른|눌러|클릭|고르|고른|골라|선택/.test(s)
}
export function makeCheckScreen(judge?: ScreenJudge): StopCheck {
  return async (answer, turn) => {
    if (turn?.sawImage || (turn?.tools ?? []).some(t => t.summary === 'screen' || isScreenCall(t.name, {}))) return null
    const n = countScreenWords(answer)
    const j = judge && (answer.length >= 300 || n >= 2) ? await judge(answer) : null
    if (j && Array.isArray(j.screen)) {
      const steps = j.screen.filter(s => !notScreenStep(s))
      return steps.length ? '화면을 보지 않고 쓴 화면 조작 절차: ' + steps.map(s => '「' + s.slice(0, 80) + '」').join(', ') + '. 본 화면이나 문서 출처를 대거나, 확인하지 않았다고 적을 것' : null
    }
    return n < 2 ? null : '화면 낱말 ' + n + ' 개를 썼으나 이번 차례에 화면을 보지 않았음. 본 화면이나 문서 출처를 대거나, 확인하지 않았다고 적을 것'
  }
}
export const checkScreen = makeCheckScreen()

// G6: 완료 낱말이 있는데 마지막으로 고친 뒤 다시 읽지 않은 대상이 있으면 고칠 것
export const checkDone: StopCheck = async (answer, turn) => {
  if (!turn || !hasDoneWords(answer)) return null
  const unread = [...turn.edits].filter(([, v]) => !v.reread).map(([k]) => k)
  return unread.length ? '고쳤다고 했으나 고친 뒤 다시 읽지 않은 것: ' + unread.join(', ') + '. 다시 읽어 확인하거나, 확인하지 않았다고 적을 것' : null
}
