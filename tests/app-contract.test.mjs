import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const style = await readFile(new URL('../style.css', import.meta.url), 'utf8');

test('app.js has valid JavaScript syntax', () => {
  execFileSync(process.execPath, ['--check', 'app.js'], { stdio: 'pipe' });
});

test('program lifecycle controls are present', () => {
  assert.match(html, /id="newProgram"/);
  assert.match(html, /id="undoNewProgram"/);
  assert.match(html, /id="programSelect"/);
  assert.match(html, /id="viewProgram"/);
  assert.match(app, /function archiveCurrentProgram/);
  assert.match(app, /function undoNewProgram/);
});

test('stage decisions require confirmation and support undo', () => {
  assert.match(html, /id="undoStageDecision"/);
  assert.match(app, /function undoStageDecision/);
  assert.match(app, /if\(!confirm\(message\)\)return/);
  assert.match(app, /lastStageTransition/);
});

test('maintenance and end-date rules are present', () => {
  assert.match(app, /stage>6\?'유지기'/);
  assert.match(app, /state\.endDate/);
  assert.match(app, /recordGapNotice/);
});

test('weekly progress chart is present', () => {
  assert.match(html, /id="weeklyHistoryChart"/);
  assert.match(html, /data-weekly-metric="fatPercent"/);
  assert.match(app, /function renderWeeklyHistoryChart/);
  assert.match(app, /1주차 1단계/);
  assert.match(app, /1주차 2단계/);
  assert.match(app, /data-trend-line/);
});

test('BMI chart metric is available', () => {
  assert.match(html, /data-chart="bmi"/);
  assert.match(app, /function bmiValue/);
  assert.match(app, /key==='bmi'/);
  assert.match(html, /data-weekly-metric="bmi"/);
  assert.match(app, /weeklyHistoryMetric!=='bmi'/);
});

test('first week history is split into two phases', () => {
  assert.match(app, /1주차 1단계/);
  assert.match(app, /1주차 2단계/);
  assert.match(app, /splitFirstWeek/);
});

test('body-fat percentage and reference mass remain distinct', () => {
  assert.match(app, /function fatPercent/);
  assert.match(app, /function fatReference/);
  assert.match(html, /name="fatReference"/);
  assert.match(app, /Number\(last\.muscle\)-getMuscleBaseline/);
});

test('BIA raw and adjusted values are preserved and require approval', () => {
  assert.match(app, /function processBiaRecords/);
  assert.match(app, /weightRaw/);
  assert.match(app, /muscleAdj/);
  assert.match(app, /fatMassAdj/);
  assert.match(app, /biaStatus/);
  assert.match(app, /function boneMass/);
  assert.match(app, /function compositionError/);
  assert.match(app, /data-bia-date/);
  assert.match(app, /biaAdjustmentApproved/);
  assert.match(html, /보정 적용/);
  assert.match(html, /name="bone"/);
});

test('demo reset includes a previous program sample', () => {
  assert.match(app, /demoPreviousRecords/);
  assert.match(app, /function fillDemoDailyRecords/);
  assert.match(app, /id:'demo-previous-program'/);
  assert.match(app, /programs:\[\{id:'demo-previous-program'/);
  assert.match(app, /state\.demoVersion===2/);
});

test('program comparison chart can be enlarged', () => {
  assert.match(html, /id="comparisonChartDialog"/);
  assert.match(app, /comparison-chart-expand/);
  assert.match(app, /comparisonChartDialog/);
});

test('program comparison charts use metric tabs', () => {
  assert.match(app, /comparison-chart-tabs/);
  assert.match(app, /data-comparison-tab/);
  assert.match(app, /data-comparison-chart/);
});

test('two programs can be selected for comparison', () => {
  assert.match(html, /id="comparePrograms"/);
  assert.match(html, /id="programPairA"/);
  assert.match(html, /id="programPairB"/);
  assert.match(app, /programPairComparison/);
  assert.match(app, /demoOlderRecords/);
  assert.match(app, /id:'demo-older-program'/);
});

test('diet guide uses a structured table instead of an image', () => {
  assert.match(app, /class="diet-table-wrap"/);
  assert.match(app, /class="diet-table"/);
  assert.match(app, /주차별 간단 식단표/);
  assert.doesNotMatch(app, /diet-table-image/);
});

test('diet guide highlights the selected week', () => {
  assert.match(app, /week===1\?'active':''/);
  assert.match(app, /week===4\?'active':''/);
  assert.match(style, /diet-table tbody tr\.active/);
});

test('app provides a blank initialization flow and clears demo data on new start', () => {
  assert.match(html, /id="clearData"/);
  assert.match(app, /localStorage\.removeItem\(KEY\)/);
  assert.match(app, /state\.programId!==\'demo-program\'/);
  assert.match(app, /state\.programs=\[\]/);
});

test('calendar selection resets to today when the app opens or returns to the foreground', () => {
  assert.match(app, /function syncTodaySelection/);
  assert.match(app, /state\.selected=today/);
  assert.match(app, /window\.addEventListener\('pageshow'/);
  assert.match(app, /visibilitychange/);
});

test('archived programs can be viewed in the full dashboard read-only', () => {
  assert.match(html, /id="programViewBanner"/);
  assert.match(html, /id="returnCurrentProgram"/);
  assert.match(app, /function enterArchivedProgramView/);
  assert.match(app, /function leaveArchivedProgramView/);
  assert.match(app, /state\.viewOnly/);
});

test('demo muscle trend drops in week one before recovering', () => {
  assert.match(app, /2026-10-26'.*muscle:27\.5.*2026-11-02'.*muscle:27\.1.*2026-11-09'.*muscle:27\.8/);
  assert.match(app, /state\.demoVersion===4/);
});

test('diet guide includes failure patterns and recovery tips', () => {
  assert.match(app, /주차별 주요 실패 패턴/);
  assert.match(app, /주의해야 할 실패 케이스와 원인/);
  assert.match(app, /실패 시 재도전 및 관리 팁/);
  assert.match(app, /baseRenderDietGuideWithFailures/);
});

test('diet guide includes weekly food rules', () => {
  assert.match(app, /주차별 허용 식품과 금지 식품/);
  assert.match(app, /1주차 허용 식품과 금지 식품/);
  assert.match(app, /2주차 허용 식품과 추가 규칙/);
  assert.match(app, /3주차와 4주차 식품 확장 및 안정화/);
  assert.match(app, /baseRenderDietGuideWithFoodRules/);
});

test('diet guide includes maintenance guidance', () => {
  assert.match(app, /유지기 관리지침/);
  assert.match(app, /유지기 핵심 관리 원칙/);
  assert.match(app, /단식과 운동 전략/);
  assert.match(app, /수면과 생활 습관/);
  assert.match(app, /baseRenderDietGuideWithMaintenance/);
});

test('maintenance guidance has a separate guide tab', () => {
  assert.match(app, /data-guide-week="maintenance"/);
  assert.match(app, /renderDietGuide\('maintenance'\)/);
  assert.match(style, /grid-template-columns:repeat\(5,1fr\)/);
});

test('maintenance table detail cells are left aligned', () => {
  assert.match(style, /maintenance-guide \.guide-table td\{text-align:left\}/);
});

test('maintenance table keeps the management column compact', () => {
  assert.match(style, /maintenance-guide \.guide-table tbody th\{width:28%;padding-left:2px;padding-right:2px/);
});

test('maintenance table overrides global column widths', () => {
  assert.match(style, /maintenance-guide \.guide-table th:first-child,.maintenance-guide \.guide-table td:first-child\{width:28%/);
  assert.match(style, /maintenance-guide \.guide-table th:nth-child\(2\).*width:36%/);
});

test('allowed food guide uses a compact table instead of an image', () => {
  assert.match(app, /food-guide-table/);
  assert.match(app, /허용 식품 가이드/);
  assert.match(app, /공통 금지/);
  assert.match(app, /baseRenderDietGuideWithFoodTable/);
});

test('allowed food guide keeps the common food list', () => {
  assert.match(app, /기본 허용/);
  assert.match(app, /물 하루 8컵 이상/);
  assert.match(app, /두부·연두부/);
});

test('allowed food guide headers are centered', () => {
  assert.match(style, /food-guide-table thead th:nth-child\(2\),.food-guide-table thead th:nth-child\(3\)\{text-align:center\}/);
});

test('failure pattern table detail cells are left aligned', () => {
  assert.match(style, /failure-guide \.guide-table td\{text-align:left\}/);
});

test('failure pattern category column is compact', () => {
  assert.match(style, /failure-guide \.guide-table th:first-child,.failure-guide \.guide-table td:first-child\{width:15%/);
});

test('caution failure table has an independent category width', () => {
  assert.match(app, /caution-failure-guide/);
  assert.match(style, /caution-failure-guide \.guide-table th:first-child,.caution-failure-guide \.guide-table td:first-child\{width:25%/);
});

test('weekly food rules category column is reduced independently', () => {
  assert.match(style, /food-rules-guide \.guide-table th:first-child,.food-rules-guide \.guide-table td:first-child\{width:16%/);
  assert.match(style, /food-rules-guide \.guide-table th:nth-child\(2\).*width:42%/);
});

test('weekly food rule detail cells are left aligned', () => {
  assert.match(style, /food-rules-guide \.guide-table td:nth-child\(2\),.food-rules-guide \.guide-table td:nth-child\(3\)\{text-align:left\}/);
});

test('normal progression enters maintenance after week four', () => {
  assert.match(app, /nextProgressionStage=stage=>stage===4\?7:stage\+1/);
  assert.match(app, /const nextStage=nextProgressionStage\(state\.stage\)/);
});

test('maintenance guide explains week four extension criteria', () => {
  assert.match(app, /4주차 종료 후 반복 판단/);
  assert.match(app, /4주차 반복·연장을 고려할 수 있는 경우/);
  assert.match(app, /유지기 또는 상담을 우선할 경우/);
  assert.match(app, /baseRenderDietGuideWithExtension/);
});

test('diet guide includes real-world failure patterns', () => {
  assert.match(app, /실제 사례에서 반복된 실패 유형/);
  assert.match(app, /프로그램 미준수와 치팅데이 확대/);
  assert.match(app, /주말과 사회적 상황에서의 간식 유혹/);
  assert.match(app, /운동 부족·정체기·생활 환경 요인/);
  assert.match(app, /baseRenderDietGuideWithLivedFailures/);
});

test('diet guide includes snack alternatives and cautions', () => {
  assert.match(app, /허기 보완용 보조 간식 가이드/);
  assert.match(app, /곤약 젤리/);
  assert.match(app, /무가당 그릭 요거트/);
  assert.match(app, /낫또 간식/);
  assert.match(app, /baseRenderDietGuideWithSnackGuide/);
});

test('diet guide includes extended failure and restart strategies', () => {
  assert.match(app, /주요 실패 유형 및 원인 분석/);
  assert.match(app, /유지기 관리 원칙과 재시작 전략/);
  assert.match(app, /최소 3~4주 유지 후 검토/);
  assert.match(app, /baseRenderDietGuideWithRestart/);
});

test('diet guide supports a mobile full-screen view', () => {
  assert.match(app, /guide-fullscreen-toggle/);
  assert.match(app, /guide-fullscreen/);
  assert.match(style, /\.guide-fullscreen\{width:100vw/);
});

test('graphs and measurement table support full-screen viewing', () => {
  assert.match(html, /data-fullscreen-target="mainChartWrap"/);
  assert.match(html, /data-fullscreen-target="weeklyChartWrap"/);
  assert.match(html, /data-fullscreen-target="recordsTableWrap"/);
  assert.match(html, /id="fullscreenViewer"/);
  assert.match(app, /fullscreenViewerBody/);
  assert.match(style, /\.fullscreen-viewer/);
});

test('raw and adjusted values are overlaid in one chart', () => {
  assert.match(html, /id="chart"/);
  assert.doesNotMatch(html, /id="adjustedChart"/);
  assert.match(html, /원본 측정값/);
  assert.match(html, /보정값 적용/);
  assert.match(app, /renderMetricSvg/);
  assert.match(app, /secondaryPts/);
});
