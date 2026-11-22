(() => {
  const main = document.querySelector('main.app-shell');
  const header = main.querySelector('.topbar');
  const dashboard = [...main.children].filter(node => node !== header);
  const tabs = document.createElement('nav');
  tabs.className = 'updates-tabs';
  tabs.setAttribute('aria-label', '화면 선택');
  tabs.innerHTML = '<button type="button" aria-pressed="true">대시보드</button><button type="button" aria-pressed="false">업데이트 내역</button>';
  const panel = document.createElement('section');
  panel.className = 'panel updates-panel';
  panel.hidden = true;
  const title = document.createElement('h2');
  title.textContent = '업데이트 내역';
  const content = document.createElement('div');
  content.setAttribute('aria-live', 'polite');
  panel.append(title, content);
  header.after(tabs);
  main.append(panel);
  let loaded = false;
  let visibility = [];
  async function load() {
    if (loaded) return;
    content.textContent = '업데이트 내역을 불러오는 중입니다.';
    try {
      const response = await fetch('changelog.md', {cache: 'no-store'});
      if (!response.ok) throw new Error('load');
      const markdown = await response.text();
      const entries = markdown.split(/\r?\n/).filter(line => /^\|\s*TASK-\d{8}-\d+\s*\|/.test(line)).map(line => line.split('|').slice(1, -1).map(cell => cell.trim().replaceAll('`', ''))).filter(cells => cells.length >= 4 && cells[2]);
      if (!entries.length) throw new Error('empty');
      content.replaceChildren();
      entries.sort((a, b) => b[0].localeCompare(a[0]));
      for (const [task, status, description, verification] of entries) {
        const article = document.createElement('article');
        const meta = document.createElement('small');
        meta.textContent = `${task} · ${status}`;
        const text = document.createElement('p');
        text.textContent = description;
        const details = document.createElement('small');
        details.textContent = verification;
        article.append(meta, text, details);
        content.append(article);
      }
      loaded = true;
    } catch {
      content.replaceChildren(document.createTextNode('내역을 불러오지 못했습니다. '));
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '다시 시도';
      retry.onclick = load;
      const link = document.createElement('a');
      link.href = 'changelog.md';
      link.textContent = '변경 이력 원문 보기';
      content.append(retry, document.createTextNode(' '), link);
    }
  }
  tabs.querySelectorAll('button').forEach((button, index) => button.onclick = () => {
    const show = index === 1;
    if (show && panel.hidden) {
      visibility = dashboard.map(node => node.hidden);
      dashboard.forEach(node => node.hidden = true);
    } else if (!show && !panel.hidden) dashboard.forEach((node, i) => node.hidden = visibility[i]);
    panel.hidden = !show;
    tabs.querySelectorAll('button').forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    if (show) load();
  });
})();
