// 2026-10-05 19:18 KST
// 한 차례(교수 메시지 1개부터 답이 끝날 때까지) 동안 장치들이 함께 쓰는 값
import { findQuestions, countTasks, isApproved, isScreenCall, editTarget, rereadPaths, isModsMerge, isNotionApply } from './detect'

export type Turn = {
  prompt: string
  questions: string[]
  approved: boolean
  tasks: number
  orderStated: boolean
  answerText: string
  known: string
  answered: boolean
  sawImage: boolean
  modsMerged: boolean
  notionApplied: boolean
  blocked: Set<string>
  tools: { name: string; summary: string }[]
  edits: Map<string, { order: number; reread: boolean }>
  // G16: 화면에 내보내기 전에 검사해 보류한 답의 고칠 점(Stop 훅이 다시 쓰게 함), 미리 검사를 통과한 답 글
  withheld: string | null
  preChecked: string | null
}

// known: 앞 차례까지의 대화(교수 메시지와 클로드의 답). 거기 나온 이름은 이미 설명된 것으로 봄
export function newTurn(prompt: string, known = ''): Turn {
  return { prompt, questions: findQuestions(prompt), approved: isApproved(prompt), tasks: countTasks(prompt), orderStated: false, answerText: '', known, answered: false, sawImage: false, modsMerged: false, notionApplied: false, blocked: new Set(), tools: [], edits: new Map(), withheld: null, preChecked: null }
}

// 작업 중에 보낸 메시지를 지금 차례에 이어 붙이고, 새 질문이 있으면 답하지 않은 것으로 되돌림
export function appendPrompt(t: Turn, text: string): void {
  t.prompt += '\n' + text
  if (isApproved(text)) t.approved = true
  t.tasks = countTasks(t.prompt)
  const qs = findQuestions(text)
  if (qs.length > 0) {
    t.questions.push(...qs)
    t.answered = false
  }
}

// 도구 호출을 차례 상태에 적음: 화면을 봤는지, 무엇을 고쳤고 다시 읽었는지
export function recordTool(t: Turn, tool: string, input: unknown): void {
  t.tools.push({ name: tool, summary: isScreenCall(tool, input) ? 'screen' : '' })
  const order = t.tools.length
  const ed = editTarget(tool, input)
  if (ed) t.edits.set(ed, { order, reread: false })
  if (isModsMerge(tool, input)) t.modsMerged = true
  if (isNotionApply(tool, input)) t.notionApplied = true
  for (const rr of rereadPaths(tool, input, [...t.edits.keys()])) {
    if (t.edits.has(rr)) t.edits.set(rr, { order: t.edits.get(rr)!.order, reread: true })
  }
}

// 이번 차례에 클로드가 쓴 답 글을 모음. 공백이 아닌 글이 오면 답한 것으로 침
export function addAnswer(t: Turn, text: string): void {
  t.answerText += text
  if (text.trim().length > 0) t.answered = true
}

// 응답 하나가 끝났을 때: 조각으로 글을 받지 못했으면 결과의 답 글을 더함
export function addStepAnswer(t: Turn, sawText: boolean, answer: string): void {
  if (!sawText && answer) addAnswer(t, (t.answerText ? '\n' : '') + answer)
}
