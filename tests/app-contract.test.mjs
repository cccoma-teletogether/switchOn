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
