// 2026-10-05 19:18 KST
// guard의 판정 함수 모음. 이벤트 없이 시험할 수 있게 순수 함수로 둠

// G2, G4 작은 모델에 넘길 판정 문장
// ④ 화면 조작 절차에서 뺄 것: 화면 낱말 인용, 검사 방법 설명, 실행한 명령 이름, 키보드 단축키, 교수에게 답장으로 보낼 문구 안내(2026-10-06 실제 세션 헛경보 3 건)
export function unclearPrompt(answer: string): string {
  return '다음 글에서 ①설명 없이 쓴 이름(글쓴이가 작업 중에 붙인 이름, 번호, 약칭), ②목적어나 주어가 빠져 뜻이 안 읽히는 문장, ③근거 없이 두 일을 잇는 말, ④읽는 사람에게 앱이나 웹 화면에서 무엇을 누르거나 고르라고 안내하는 조작 절차 문장을 찾아라. ④에서 다음은 조작 절차가 아니므로 빼라: 화면 낱말을 인용하거나 검사 방법을 설명한 문장, 실행한 명령이나 도구의 이름(예: `claude plugin test`), 키보드 단축키(예: Cmd+Q), 대화창에 답장으로 보낼 문구를 알려 주는 문장(예: 「푸시해」라고 답해 주십시오). 없으면 빈 배열. 다른 말 없이 JSON {"names":[],"unclear":[],"links":[],"screen":[]}로만 답하라.\n\n' + answer.slice(0, 6000)
}

// 문장 끝의 질문 꼴. 물음표, 또는 「~나」「~냐」「~인가」「~는지」「~까」 같은 의문 종결
const QUESTION_END = /([?？]|(나|냐|니|까|가|는지|은지|던가|는가|나요|까요|가요|죠)\s*[.…]?)\s*$/

// 코드 블록과 붙여 넣은 글은 판정에서 뺌
export function stripQuoted(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<pasted_content[\s\S]*?<\/pasted_content[^>]*>/g, '')
}

// 줄바꿈과 문장 부호 뒤에서 문장을 나눔
export function splitSentences(text: string): string[] {
  return text
    .split(/\n|(?<=[.!?？])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 1)
}

// 질문으로 보이는 문장을 돌려줌(없으면 빈 배열)
export function findQuestions(text: string): string[] {
  return splitSentences(stripQuoted(text)).filter(s => QUESTION_END.test(s))
}

// 답 글에서 풀이 없이 쓴 이름을 찾음: 커밋 해시, 문서 이름 없는 절 번호, 작업 중에 붙인 이름
// 커밋 해시는 같은 문장에 커밋, 깃허브, 푸시, 병합이 있거나 앞..뒤 범위 꼴이면 풀이가 있는 것으로 봄(2026-10-06 신 교수 결정 ③안)
export const COMMIT_WORDS = /커밋|깃허브|푸시|병합/
const DOC_NAME = /(PRD|노트|계획|규격|기획|보고|문서|CLAUDE\.md|STYLE\.md|`[^`]+`)/
export function findInternalNames(answer: string): string[] {
  const found: string[] = []
  for (const s of splitSentences(stripQuoted(answer))) {
    if (!COMMIT_WORDS.test(s)) {
      for (const m of s.matchAll(/(?<![0-9a-zA-Z.])([0-9a-f]{7,40})(?![0-9a-zA-Z]|\.\.)/g)) {
        if (/[0-9]/.test(m[1]) && /[a-f]/.test(m[1])) found.push(m[1])
      }
    }
    // 범위(2.9~2.11항)는 한 덩어리로 보고, 같은 문장 앞쪽 어디든 문서 이름이 있으면 뺌
    for (const m of s.matchAll(/(\d+(?:\.\d+)+)(?:\s*~\s*\d+(?:\.\d+)+)?(장|절|항|목)/g)) {
      if (!DOC_NAME.test(s.slice(0, m.index))) found.push(m[0])
    }
    for (const m of s.matchAll(/(?<![가-힣])([가나다라마바사] ?안|\d안)(?=(으로|로|을|를|이|가|은|는|에|의|과|와|도|만)?(?![가-힣(]))|(미결|권고|후보|묶음) ?\d+번?(?!\s*\()/g)) {
      found.push(m[0].trim())
    }
  }
  return found
}

// 승인 낱말이 있고, 같은 문장에 부정 꼴이 없는 문장이 하나라도 있으면 승인
// 할 일을 잇는 꼴(-고)과 권하는 꼴(-자)도 승인으로 봄(2026-10-06 신 교수 결정, 「올리고 …설명해줘」를 막은 일)
const APPROVE = /(올려|올리고|올리자|푸시해|푸시하고|푸시하자|진행해|진행하고|진행하자|그대로)/
const NEGATE = /(둬|두어|(?<![가-힣])마[.!]?$|마라|말고|하지|않)/
export function isApproved(text: string): boolean {
  return splitSentences(stripQuoted(text)).some(s => APPROVE.test(s) && !NEGATE.test(s))
}

// 도구 인자: 실제 앱은 e.command처럼 맨 위에 둠(2026-10-05 실제 세션에서 확인). input 안에 둔 꼴도 받음
function argsOf(input: unknown): Record<string, unknown> {
  const o = (input ?? {}) as Record<string, unknown>
  return o.input && typeof o.input === 'object' ? (o.input as Record<string, unknown>) : o
}

// G9 혼자 내린 결정: 작업 기록에 Ruling: 줄을 쓰는 호출인지
// 작업 기록 파일(progress.md, .superpowers/ 아래)에 쓸 때만 봄. 다른 문서의 예문에 든 Ruling:은 막지 않음(2026-10-06 헛경보)
// Write의 글, Edit의 새 글(원래 글보다 Ruling:이 늘어날 때), 작업 기록 파일로 보내는 Bash 명령(>, >>, tee)을 봄
// 오류 출력 표시(2>, 2>&1)와 버리기(>/dev/null)는 쓰기가 아님(2026-10-06 헛경보)
const LEDGER = /progress\.md|\.superpowers\//
export function rulingWrite(tool: string, input: unknown): boolean {
  const i = argsOf(input)
  const n = (s: unknown) => (typeof s === 'string' ? (s.match(/Ruling:/g) ?? []).length : 0)
  const ledger = (p: unknown) => typeof p === 'string' && LEDGER.test(p)
  if (tool === 'Write') return ledger(i.file_path) && n(i.content) > 0
  if (tool === 'Edit') return ledger(i.file_path) && n(i.new_string) > n(i.old_string)
  if (tool === 'Bash') {
    // 변수를 풀어 넣은 뒤 세 조건을 모두 갖추면 막음: Ruling: 글자, 파일에 쓰는 표시, 작업 기록 파일 경로(2026-10-06 변수 경로를 놓친 일)
    // 쓰기 표시와 경로는 heredoc 본문을 뺀 명령 글에서 찾고, Ruling:은 본문까지 봄(2026-10-06 헛경보: 파이썬 heredoc 본문의 <…>를 쓰기로 봄)
    const c = expandShell(String(i.command ?? ''))
    const outer = noHeredoc(c).replace(/\d>&\d|2>>?\s*\S+|&?>>?\s*\/dev\/null/g, ' ')
    return n(c) > 0 && /(>>?|\btee\b)/.test(outer) && LEDGER.test(outer)
  }
  return false
}

// 명령 글 안에서 변수에 담은 값(이름=값)을 $이름, ${이름} 자리에 풀어 넣음. home을 알면 ~/도 집 폴더로 바꿈
// 앞선 다른 명령에서 담은 변수와 명령 실행 결과를 담은 변수($(…))는 풀지 못함
export function expandShell(cmd: string, home = ''): string {
  const vars: Record<string, string> = {}
  for (const m of cmd.matchAll(/(?:^|[;&|\s])(?:export\s+)?([A-Za-z_]\w*)=(?:"([^"$]*)"|'([^']*)'|([^\s;&|"'$]+))/g)) vars[m[1]] = m[2] ?? m[3] ?? m[4] ?? ''
  let out = cmd
  for (const k of Object.keys(vars)) out = out.replace(new RegExp('\\$\\{' + k + '\\}|\\$' + k + '(?![A-Za-z0-9_])', 'g'), () => vars[k])
  if (home) out = out.replace(/(^|[\s"'=:;])~\//g, (_m, p) => p + home + '/')
  return out
}
// 고친 파일 경로에서 집 폴더(/Users/이름, /home/이름)를 읽어 냄
function homeOf(paths: string[]): string {
  for (const p of paths) { const m = p.match(/^(\/Users\/[^/]+|\/home\/[^/]+)\//); if (m) return m[1] }
  return ''
}

// G12 어림한 시각: 분 자리를 x로 쓴 시각(11:4x, 22:xx). 백틱으로 감싼 인용은 뺌
const ROUGH_TIME = /(?<![\d:])\d{1,2}:(?:[0-5]x|xx)(?![A-Za-z0-9])/gi
export function roughTimes(text: string): string[] {
  return text.replace(/`[^`\n]*`/g, '').match(ROUGH_TIME) ?? []
}
export function hasRoughTime(text: string): boolean {
  return roughTimes(text).length > 0
}
// 파일에 쓰는 호출(Write의 글, Edit의 새 글, Bash 명령)에 어림한 시각이 있는지. Edit의 원래 글은 보지 않음(고치는 편집이므로)
export function roughTimeWrite(tool: string, input: unknown): boolean {
  const i = argsOf(input)
  const t = tool === 'Write' ? i.content : tool === 'Edit' ? i.new_string : tool === 'Bash' ? i.command : null
  return typeof t === 'string' && hasRoughTime(t)
}

// 셸 명령에서 실제로 실행되는 부분만 보기 위한 손질: <<EOF 본문(파일에 쓸 글)을 지우고, 따옴표 안의 글은 Q 한 글자로 바꿈
function noHeredoc(cmd: string): string {
  return cmd.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2[ \t]*(?=\n|$)/g, '<<HEREDOC')
}
function unquoted(cmd: string): string {
  return cmd.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, 'Q')
}

// G13: mod 저장소(~/.claude/mods)에서 git merge를 실행하는 호출인지. 파일에 쓸 글 안의 명령은 뺌
export function isModsMerge(tool: string, input: unknown): boolean {
  if (tool !== 'Bash') return false
  const body = noHeredoc(String(argsOf(input).command ?? ''))
  return /\bgit\s+(?:(?:-C|-c)\s+\S+\s+|--[\w-]+(?:=\S+)?\s+)*merge\b/.test(unquoted(body)) && /\.claude\/mods\b/.test(body)
}
// G14: mod 저장소에 새 브랜치를 만드는 호출인지(worktree add -b, checkout -b, switch -c)
export function isModsNewBranch(tool: string, input: unknown): boolean {
  if (tool !== 'Bash') return false
  const body = noHeredoc(String(argsOf(input).command ?? ''))
  return /\bgit\s+(?:(?:-C|-c)\s+\S+\s+)*(?:worktree\s+add\b[^;&|]*\s-b\b|checkout\s+-b\b|switch\s+-c\b)/.test(unquoted(body)) && /\.claude\/mods\b/.test(body)
}
// G14: main의 reflog 마지막 줄 시각이 loadedAt(밀리초)보다 뒤인지. reflog 줄 꼴: <옛> <새> 이름 <메일> <초> <+0900>\t<내용>
export function mainChangedSince(reflog: string, loadedAt: number): boolean {
  const lines = reflog.trim().split('\n').filter(Boolean)
  const m = lines.length ? lines[lines.length - 1].match(/>\s+(\d{9,})\s+[+-]\d{4}\t/) : null
  return m ? Number(m[1]) * 1000 > loadedAt : false
}

// G13: 노션 노트에 반영하는 호출인지
export function isNotionApply(tool: string, input: unknown): boolean {
  return tool === 'Bash' && /notion_edit\.py['"]?\s+apply/.test(noHeredoc(String(argsOf(input).command ?? '')))
}

// 밖으로 나가는 호출(학생 게시판, 원격 저장소, 노션, DB)인지
export function isOutbound(tool: string, input: unknown): boolean {
  const i = argsOf(input)
  const str = (k: string) => (typeof i[k] === 'string' ? (i[k] as string) : '')
  if (tool === 'Bash') {
    const body = noHeredoc(str('command'))
    if (/notion_edit\.py['"]?\s+apply/.test(body)) return true
    return /\bgit\s+(?:(?:-C|-c)\s+\S+\s+|--[\w-]+(?:=\S+)?\s+)*push\b|gh repo create|gh pr create|supabase db push/.test(unquoted(body))
  }
  if (tool === 'mcp__aside__repl') {
    const code = str('code')
    return /ubboard\/write\.php|ubmessage/.test(code) && /click|submit/.test(code)
  }
  if (/notion-update-page$|notion-create-pages$|apply_migration$/.test(tool)) return true
  if (/execute_sql$/.test(tool)) return !/^\s*select\b/i.test(str('query'))
  return false
}

// 답 글의 화면 낱말 수
const SCREEN_WORDS = /버튼|단추|메뉴|클릭|누르|탭(?=을|에서)|창(?=을|에서|이)|화면에서/g
export function countScreenWords(answer: string): number {
  return (stripQuoted(answer).match(SCREEN_WORDS) ?? []).length
}

// 화면을 본 호출인지(스크린숏, 확대, 이미지 파일 읽기, aside의 화면 찍기)
export function isScreenCall(tool: string, input: unknown): boolean {
  const i = argsOf(input)
  if (/screenshot|zoom/i.test(tool)) return true
  if (tool === 'Read') return /\.(png|jpe?g|gif|webp)$/i.test(String(i.file_path ?? ''))
  if (tool === 'mcp__aside__repl') return /screenshot|display\(/.test(String(i.code ?? ''))
  return false
}

// 고친 대상(파일 경로, 노션 페이지). 없으면 null
export function editTarget(tool: string, input: unknown): string | null {
  const i = argsOf(input)
  if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') return typeof i.file_path === 'string' ? i.file_path : null
  const m = tool === 'Bash' ? String(i.command ?? '').match(/notion_edit\.py\s+apply\s+(\S+)/) : null
  return m ? 'notion:' + m[1] : null
}

// 다시 읽은 대상. notion_edit.py apply는 보낸 뒤 되받아 대조하므로 다시 읽은 것으로 침
export function rereadTarget(tool: string, input: unknown): string | null {
  const i = argsOf(input)
  if (tool === 'Read') return typeof i.file_path === 'string' ? i.file_path : null
  if (tool !== 'Bash') return null
  const cmd = String(i.command ?? '')
  const n = cmd.match(/notion_edit\.py\s+(?:fetch|apply)\s+(\S+)/)
  if (n) return 'notion:' + n[1]
  const f = cmd.match(/(?:^|[;&|]\s*)(?:cat|head|tail|sed -n \S+|grep [^|;&]*?)\s+['"]?([^'"\s|;&]+)['"]?\s*$/)
  return f ? f[1] : null
}

// 이번 차례에 고친 파일 가운데 이 호출이 다시 읽은 것들
// 읽기 명령이 있는 Bash 명령이면, 고친 파일의 경로가 명령 글에 있거나, cd로 옮긴 폴더에서 그 파일 이름을 썼으면 다시 읽은 것으로 침
const READ_VERB = /(?:^|[;&|(]\s*)(?:cat|head|tail|sed\s+-n|grep|wc|diff|cmp|less|awk)\b/
export function rereadPaths(tool: string, input: unknown, edited: string[]): string[] {
  const one = rereadTarget(tool, input)
  const out = one ? [one] : []
  if (tool !== 'Bash') return out
  const cmd = expandShell(String(argsOf(input).command ?? ''), homeOf(edited))
  if (!READ_VERB.test(unquoted(noHeredoc(cmd)))) return out
  const cds = [...cmd.matchAll(/(?:^|[;&]\s*)cd\s+(?:"([^"]+)"|'([^']+)'|([^\s;&|]+))/g)].map(m => (m[1] ?? m[2] ?? m[3]).replace(/\/$/, ''))
  // 경로 중간에 따옴표를 넣은 꼴(docs/"3_mod … .md")도 맞추려고 따옴표를 뺀 글에서 찾음(2026-10-06 헛경보)
  const flat = cmd.replace(/["']/g, '')
  for (const p of edited) {
    if (p.startsWith('notion:')) continue
    if (flat.includes(p)) { out.push(p); continue }
    // cd로 옮긴 폴더 아래의 상대 경로(하위 폴더 포함)로 읽었는지(2026-10-06 헛경보: cd 뒤 hooks/detect.ts)
    const rel = (d: string) => (p.startsWith(d + '/') ? p.slice(d.length + 1) : d.startsWith('~/') && p.includes(d.slice(1) + '/') ? p.slice(p.indexOf(d.slice(1) + '/') + d.length) : '')
    if (cds.some(d => { const r = rel(d); return r !== '' && flat.includes(r) })) out.push(p)
  }
  return out
}

// 답 글에 완료 낱말이 있는지
export function hasDoneWords(answer: string): boolean {
  return /반영했|고쳤|완료|넣었|바꿨/.test(stripQuoted(answer))
}

// 지시 문장: 명령, 청유, 허락 꼴로 끝나는 문장
// 명령형 「~라」(고쳐라, 올려라)는 「더라, 이라, 다라」를 뺀 모든 「~라」로 봄
const DIRECTIVE_END = /((?<!더|이|다)[가-힣]라|해|줘|[가-힣](?<=[어아여])|[가-힣]자|줄래|봐|할 것|바람|해도 좋다|해도 된다)\s*[.!…]?\s*$/
export function findDirectives(text: string): string[] {
  return splitSentences(stripQuoted(text)).filter(s => DIRECTIVE_END.test(s))
}

// 할 일 수: 질문이거나 지시인 문장의 수(한 문장은 한 번만 셈)
export function countTasks(text: string): number {
  const qs = new Set(findQuestions(text))
  const ds = findDirectives(text)
  return new Set([...qs, ...ds]).size
}

// G15: superpowers의 계획 실행 스킬(executing-plans, subagent-driven-development)을 부르는 호출인지
export function isPlanSkill(tool: string, input: unknown): boolean {
  return tool === 'Skill' && /(^|:)(executing-plans|subagent-driven-development)$/.test(String(argsOf(input).skill ?? ''))
}

// 답 글이 순서를 밝혔는지
export function statesOrder(answer: string): boolean {
  return /먼저|부터|그다음|이어서|나중에|순서/.test(stripQuoted(answer))
}
