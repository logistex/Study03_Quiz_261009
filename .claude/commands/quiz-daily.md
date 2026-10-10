---
description: 카테고리마다 새 문항 1개를 더하고(quiz-add, n=1), 성공하면 전체 문항을 점검함(quiz-validate)
disable-model-invocation: true
allowed-tools: Read Grep WebSearch WebFetch
---
<!-- 2026-10-10 17:02 KST -->

문항 추가와 점검을 이어서 한다. 두 명령어의 절차는 이 파일에 다시 적지 않는다. 각 단계에서 해당 파일을 읽고 그 절차를 그대로 따른다.

## 1단계: 문항 추가

- `.claude/commands/quiz-add.md`를 읽고 그 절차를 따른다
- 그 파일의 `$ARGUMENTS`(n)는 1로 읽는다. 이 명령어에 인수를 붙여도 n은 1이다
- 그 파일의 절차대로, 만든 문항을 보여 준 뒤 승인을 기다리며 차례를 끝낸다. 승인을 받으면 그 파일의 3단계를 이어서 한다

## 2단계: 점검

- 1단계가 성공했을 때만 `.claude/commands/quiz-validate.md`를 읽고 그 절차를 따른다. 인수는 없다
- 「성공」은 승인받은 문항을 questions.js에 모두 넣었고, quiz-add.md 3단계의 검사 2개를 모두 통과한 경우이다
- 다음 경우에는 2단계를 실행하지 않고, 실행하지 않은 이유를 알린 뒤 멈춘다
  - quiz-add.md 1단계에서 문항을 채우지 못해 멈춘 경우
  - quiz-add.md 3단계의 검사가 실패해 넣은 문항을 되돌린 경우
  - 문항을 넣지 말라는 답을 받은 경우
