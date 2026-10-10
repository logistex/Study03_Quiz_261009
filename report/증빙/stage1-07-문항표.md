<!-- 2026-10-09 17:22 KST -->

# 구현 1단계 확인 항목 1-7: 40문항 목록과 출처 접속 결과

- 대상: 커밋 `dd5fe4d`(stage-1 브랜치)의 `questions.js` 40문항
- 신 학생의 확인: 2026-10-09 신 학생이 40문항을 최종 확인했다고 알림. 무엇을 어떻게 보았는지는 이 표에 적지 않았음
- 클로드(기록자)의 보조 확인(2026-10-09 17:22): 출처 주소마다 `curl`로 접속해 응답 코드를 받고, 응답 본문에 정답 낱말이 있는지 찾았음
  - 정답 낱말은 한글이므로, 영어 페이지에서 찾지 못해도 틀렸다는 뜻이 아님
  - 브리태니커는 `curl`에 403을 줌. 다섯 번째 세션도 같은 이유로 검색 요약만 봤다고 밝힘. 브라우저에서 열리는지는 확인하지 않았음

| 번호 | 문제 | 정답 | 출처 | 접속 | 본문에 정답 낱말 |
|---|---|---|---|---|---|
| kh-01 | 1443년에 훈민정음을 창제한 조선의 왕은? | 세종 | 한국민족문화대백과사전 「훈민정음」, https://encykorea.aks.ac.kr/Article/E0065806, 2026-10-09 | 200 | 있음 |
| kh-02 | 918년에 고려를 세운 인물은? | 왕건 | 한국민족문화대백과사전 「고려」, https://encykorea.aks.ac.kr/Article/E0003424, 2026-10-09 | 200 | 있음 |
| kh-03 | 1592년 학익진으로 한산도 대첩을 승리로 이끈 전라좌수사는? | 이순신 | 한국민족문화대백과사전 「한산도대첩」, https://encykorea.aks.ac.kr/Article/E0061676, 2026-10-09 | 200 | 있음 |
| kh-04 | 3·1 운동이 일어난 해는? | 1919년 | 한국민족문화대백과사전 「3·1운동」, https://encykorea.aks.ac.kr/Article/E0026772, 2026-10-09 | 200 | 있음 |
| kh-05 | 676년 기벌포 전투로 당군을 몰아내 삼국 통일을 완수한 신라의 왕은? | 문무왕 | 한국민족문화대백과사전 「문무왕」, https://encykorea.aks.ac.kr/Article/E0019473, 2026-10-09 | 200 | 있음 |
| kh-06 | 1919년 4월 11일 대한민국 임시정부가 수립된 도시는? | 상하이 | 한국민족문화대백과사전 「대한민국임시정부수립기념일」, https://encykorea.aks.ac.kr/Article/E0080590, 2026-10-09 | 200 | 있음 |
| kh-07 | 538년 성왕이 도읍을 옮긴 뒤 멸망 때까지 이어진 백제의 마지막 도읍은? | 사비 | 한국민족문화대백과사전 「사비천도」, https://encykorea.aks.ac.kr/Article/E0071959, 2026-10-09 | 200 | 있음 |
| kh-08 | 동학 농민 운동을 이끌었으며 '녹두장군'이라 불린 인물은? | 전봉준 | 한국민족문화대백과사전 「전봉준」, https://encykorea.aks.ac.kr/Article/E0049437, 2026-10-09 | 200 | 있음 |
| kh-09 | 1884년 우정국 개국 축하연을 계기로 갑신정변을 주도한 인물은? | 김옥균 | 한국민족문화대백과사전 「갑신정변」, https://encykorea.aks.ac.kr/Article/E0000922, 2026-10-09 | 200 | 있음 |
| kh-10 | 수원 화성을 쌓을 때 쓴 거중기를 『기중도설』에서 설계한 실학자는? | 정약용 | 한국민족문화대백과사전 「거중기」, https://encykorea.aks.ac.kr/Article/E0001891, 2026-10-09 | 200 | 있음 |
| wg-01 | 오스트레일리아의 수도는? | 캔버라 | Britannica "What is the capital of Australia?", https://www.britannica.com/question/What-is-the-capital-of-Australia, 2026-10-09 | 403 | 찾지 못함 |
| wg-02 | 캐나다의 수도는? | 오타와 | Britannica "Ottawa", https://www.britannica.com/place/Ottawa, 2026-10-09 | 403 | 찾지 못함 |
| wg-03 | 해발 고도 기준(2020년 중국과 네팔의 공동 측량 8,848.86m), 세계에서 가장 높은 산은? | 에베레스트산 | Britannica "Mount Everest", https://www.britannica.com/place/Mount-Everest, 2026-10-09 | 403 | 찾지 못함 |
| wg-04 | 국토 총면적 기준(2026년 현재), 세계에서 가장 넓은 나라는? | 러시아 | Britannica "List of the world's largest countries and dependencies by area", https://www.britannica.com/topic/list-of-the-total-areas-of-the-worlds-countries-dependencies-and-territories-2130540, 2026-10-09 | 403 | 찾지 못함 |
| wg-05 | 사하라 사막이 있는 대륙은? | 아프리카 | Britannica "Sahara summary", https://www.britannica.com/summary/Sahara-desert-Africa, 2026-10-09 | 403 | 찾지 못함 |
| wg-06 | 안데스산맥이 서쪽 해안을 따라 뻗어 있는 대륙은? | 남아메리카 | Britannica "Andes Mountains", https://www.britannica.com/place/Andes-Mountains, 2026-10-09 | 403 | 찾지 못함 |
| wg-07 | 나일강이 흘러드는 바다는? | 지중해 | Britannica "Nile River", https://www.britannica.com/place/Nile-River, 2026-10-09 | 403 | 찾지 못함 |
| wg-08 | 브라질의 공용어는? | 포르투갈어 | Britannica "Brazil", https://www.britannica.com/place/Brazil, 2026-10-09 | 403 | 찾지 못함 |
| wg-09 | 1884년 국제 자오선 회의에서 경도 0도의 기준으로 정한 자오선이 지나는 영국의 천문대가 있는 곳은? | 그리니치 | Royal Museums Greenwich "Stand on the Prime Meridian", https://www.rmg.co.uk/royal-observatory/attractions/stand-on-prime-meridian-line, 2026-10-09 | 200 | 찾지 못함 |
| wg-10 | 튀르키예의 수도는? | 앙카라 | Britannica "Ankara, capital of Turkey", https://www.britannica.com/summary/Ankara, 2026-10-09 | 403 | 찾지 못함 |
| sc-01 | 물의 화학식은? | H2O | Britannica "Water - Physical properties", https://www.britannica.com/science/water/Physical-properties, 2026-10-09 | 403 | 찾지 못함 |
| sc-02 | 태양으로부터의 평균 거리 기준(2026년 현재 태양계 행성 8개 중), 태양에 가장 가까운 행성은? | 수성 | NASA Science "Mercury: Facts", https://science.nasa.gov/mercury/facts/, 2026-10-09 | 200 | 찾지 못함 |
| sc-03 | 원소 기호가 Fe인 원소는? | 철 | Britannica "Iron", https://www.britannica.com/science/iron-chemical-element, 2026-10-09 | 403 | 찾지 못함 |
| sc-04 | 식물 세포에서 광합성이 일어나는 세포 소기관은? | 엽록체 | Britannica "What is a chloroplast?", https://www.britannica.com/question/What-is-a-chloroplast, 2026-10-09 | 403 | 찾지 못함 |
| sc-05 | 진공에서 빛의 속력은? | 약 30만 km/s | NIST "SI Units - Length", https://www.nist.gov/pml/owm/si-units-length, 2026-10-09 | 200 | 찾지 못함 |
| sc-06 | 사람의 혈액에서 산소를 운반하는 혈구는? | 적혈구 | Britannica "Blood - Red blood cells (erythrocytes)", https://www.britannica.com/science/blood-biochemistry/Red-blood-cells-erythrocytes, 2026-10-09 | 403 | 찾지 못함 |
| sc-07 | 1687년 『프린키피아』에서 만유인력 법칙을 발표한 과학자는? | 아이작 뉴턴 | Britannica "Principia", https://www.britannica.com/topic/Principia, 2026-10-09 | 403 | 찾지 못함 |
| sc-08 | 원자 번호가 1인 원소는? | 수소 | Britannica "Hydrogen", https://www.britannica.com/science/hydrogen, 2026-10-09 | 403 | 찾지 못함 |
| sc-09 | 1기압에서 순수한 물이 끓는 온도는? | 약 100℃ | Britannica "When does water boil?", https://www.britannica.com/question/When-does-water-boil, 2026-10-09 | 403 | 찾지 못함 |
| sc-10 | 1953년 DNA의 이중 나선 구조 모형을 발표한 두 과학자는? | 왓슨과 크릭 | Britannica "Double helix", https://www.britannica.com/science/double-helix, 2026-10-09 | 403 | 찾지 못함 |
| ac-01 | 루브르 박물관에 있는 〈모나리자〉를 그린 화가는? | 레오나르도 다빈치 | Louvre "From the Mona Lisa to The Wedding Feast at Cana", https://www.louvre.fr/en/explore/the-palace/from-the-mona-lisa-to-the-wedding-feast-at-cana, 2026-10-09 | 200 | 찾지 못함 |
| ac-02 | 1889년에 그린 〈별이 빛나는 밤〉(뉴욕 현대미술관 소장)의 화가는? | 빈센트 반 고흐 | MoMA, Richard Thomson "Vincent van Gogh: The Starry Night", https://www.moma.org/momaorg/shared/pdfs/docs/learn/courses/Thomson_Van_Gogh_The_Starry_Night.pdf, 2026-10-09 | 200 | 찾지 못함 |
| ac-03 | 실러의 시 「환희의 송가」를 마지막 악장에 합창으로 넣은 교향곡 9번의 작곡가는? | 베토벤 | Britannica "Symphony No. 9 in D Minor, Op. 125", https://www.britannica.com/topic/Symphony-No-9-in-D-Minor, 2026-10-09 | 403 | 찾지 못함 |
| ac-04 | 희곡 「로미오와 줄리엣」을 쓴 작가는? | 윌리엄 셰익스피어 | Britannica "William Shakespeare - Romeo and Juliet", https://www.britannica.com/biography/William-Shakespeare/Romeo-and-Juliet, 2026-10-09 | 403 | 찾지 못함 |
| ac-05 | 성진이 양소유로 태어나는 꿈을 그린 조선 숙종 때의 소설 『구운몽』의 작가는? | 김만중 | 한국민족문화대백과사전 「구운몽」, https://encykorea.aks.ac.kr/Article/E0005948, 2026-10-09 | 200 | 있음 |
| ac-06 | 1943년에 출판된 『어린 왕자』의 작가는? | 앙투안 드 생텍쥐페리 | Britannica "Antoine de Saint-Exupéry", https://www.britannica.com/biography/Antoine-de-Saint-Exupery, 2026-10-09 | 403 | 찾지 못함 |
| ac-07 | 1853년 베네치아에서 초연된 오페라 〈라 트라비아타〉의 작곡가는? | 주세페 베르디 | Britannica "La traviata", https://www.britannica.com/topic/La-traviata, 2026-10-09 | 403 | 찾지 못함 |
| ac-08 | 1751년 비 갠 뒤의 인왕산을 그린 〈인왕제색도〉의 화가는? | 정선 | 한국민족문화대백과사전 「정선 필 인왕제색도」, https://encykorea.aks.ac.kr/Article/E0046984, 2026-10-09 | 200 | 있음 |
| ac-09 | 〈씨름〉, 〈서당〉, 〈무동〉이 실린 조선 후기 풍속도 화첩(보물)을 그린 화가는? | 김홍도 | 한국민족문화대백과사전 「김홍도 필 풍속도 화첩」, https://encykorea.aks.ac.kr/Article/E0013639, 2026-10-09 | 200 | 있음 |
| ac-10 | 1937년 게르니카 폭격을 주제로 그린 〈게르니카〉의 화가는? | 파블로 피카소 | Museo Reina Sofía "Guernica", https://www.museoreinasofia.es/en/collections/artwork/guernica-0/, 2026-10-09 | 200 | 찾지 못함 |

- 집계: 접속 200 19개, 403 21개. 본문에서 정답 낱말을 찾은 것 13개(모두 한국민족문화대백과사전)
