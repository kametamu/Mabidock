const appRoot = document.getElementById('app');
const routeLinks = Array.from(document.querySelectorAll('[data-route]'));

const routes = {
  '/home': renderHome,
  '/training': renderTraining,
  '/money': renderMoney,
  '/dailies': renderDailies,
};

const cache = new Map();
const dailiesState = {
  typeActive: {
    daily: true,
    weekly: true,
    monthly: true,
  },
  hiddenItems: new Set(),
};

async function loadJson(path) {
  if (cache.has(path)) return cache.get(path);
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path} の読み込みに失敗しました。`);
  const data = await response.json();
  cache.set(path, data);
  return data;
}

function getHashPath() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw || '/home';
}

function setActiveLink(path) {
  routeLinks.forEach((link) => {
    const isActive = link.getAttribute('data-route') === path;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function pageHeader(title, description) {
  return `
    <h2 class="page-title">${escapeHtml(title)}</h2>
    <p class="page-description">${escapeHtml(description)}</p>
  `;
}

async function renderHome() {
  const links = await loadJson('./data/links.json');

  const shortcuts = [
    { title: '育成', href: '#/training' },
    { title: '稼ぎ', href: '#/money' },
    { title: '日課', href: '#/dailies' },
    { title: '装備', href: '#/home', note: '準備中' },
  ];

  appRoot.innerHTML = `
    ${pageHeader('Home', '便利リンクとカテゴリ移動のハブです。')}
    <section class="card section-stack">
      <h3 class="section-title">カテゴリショートカット</h3>
      <div class="inline-links">
        ${shortcuts
          .map(
            (item) => `<a href="${item.href}">${escapeHtml(item.title)}${
              item.note ? ` (${escapeHtml(item.note)})` : ''
            }</a>`,
          )
          .join('')}
      </div>
    </section>

    <section>
      <h3 class="section-title">便利リンク</h3>
      <div class="card-grid">
        ${links
          .map(
            (item) => `
            <article class="card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
              <a
                class="card-link"
                href="${escapeHtml(item.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                開く ↗
              </a>
            </article>
          `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderArticleSections(entries) {
  return entries
    .map((entry) => {
      const sections = Array.isArray(entry.sections)
        ? entry.sections
            .map(
              (section) => `
              <div>
                <h4 class="section-title">${escapeHtml(section.title)}</h4>
                <p class="section-content">${escapeHtml(section.content ?? '')}</p>
              </div>
            `,
            )
            .join('')
        : `<p class="section-content">${escapeHtml(entry.content ?? '')}</p>`;

      return `
        <article class="card section-stack">
          <h3>${escapeHtml(entry.title)}</h3>
          ${sections}
        </article>
      `;
    })
    .join('');
}

async function renderTraining() {
  const data = await loadJson('./data/training.json');
  appRoot.innerHTML = `
    ${pageHeader('育成', '育成関連メモの置き場です。')}
    <section class="section-stack">${renderArticleSections(data)}</section>
  `;
}

async function renderMoney() {
  const data = await loadJson('./data/money.json');
  appRoot.innerHTML = `
    ${pageHeader('稼ぎ', '金策・稼ぎ情報のまとめです。')}
    <section class="section-stack">${renderArticleSections(data)}</section>
  `;
}

function buildDailiesFilterControls() {
  const types = ['daily', 'weekly', 'monthly'];
  return `
    <section class="card dailies-controls">
      <h3 class="section-title">表示フィルター（アクティブ / 非アクティブ）</h3>
      <div class="toggle-row">
        ${types
          .map(
            (type) => `
            <button
              class="toggle-chip ${dailiesState.typeActive[type] ? 'on' : 'off'}"
              type="button"
              data-type-toggle="${type}"
            >
              ${escapeHtml(type)}: ${dailiesState.typeActive[type] ? 'アクティブ' : '非アクティブ'}
            </button>
          `,
          )
          .join('')}
      </div>
      <p class="section-content">「完了して非表示」を押した項目は、このページを開いている間だけ非表示になります。再読込すると元に戻ります。</p>
    </section>
  `;
}

function bindDailiesControls() {
  appRoot.querySelectorAll('[data-type-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-type-toggle');
      dailiesState.typeActive[type] = !dailiesState.typeActive[type];
      renderDailies();
    });
  });

  appRoot.querySelectorAll('[data-hide-item]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-hide-item');
      dailiesState.hiddenItems.add(itemId);
      renderDailies();
    });
  });

  const resetButton = appRoot.querySelector('[data-reset-hidden]');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      dailiesState.hiddenItems.clear();
      renderDailies();
    });
  }
}

async function renderDailies() {
  const data = await loadJson('./data/dailies.json');
  const withIds = data.map((item, index) => ({
    ...item,
    itemId: `${item.type}:${index}:${item.title}`,
  }));

  const visible = withIds.filter((item) => dailiesState.typeActive[item.type] && !dailiesState.hiddenItems.has(item.itemId));

  appRoot.innerHTML = `
    ${pageHeader('日課', 'daily / weekly / monthly を見やすく表示します。')}
    ${buildDailiesFilterControls()}
    <section class="toolbar-row">
      <button type="button" class="reset-button" data-reset-hidden>非表示を全て戻す</button>
      <p class="section-content">表示中: ${visible.length} / 全体: ${data.length}</p>
    </section>
    <section class="card-grid">
      ${visible
        .map((item) => {
          return `
          <article class="card">
            <span class="tag ${escapeHtml(item.type)}">${escapeHtml(item.type)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}
            ${item.cooldownDays ? `<p class="section-content">cooldown: ${item.cooldownDays}日</p>` : ''}
            <button type="button" class="hide-button" data-hide-item="${escapeHtml(item.itemId)}">完了して非表示</button>
          </article>
        `;
        })
        .join('')}
    </section>
  `;

  bindDailiesControls();
}

async function renderRoute() {
  const path = getHashPath();

  if (!routes[path]) {
    window.location.hash = '#/home';
    return;
  }

  setActiveLink(path);

  try {
    await routes[path]();
  } catch (error) {
    appRoot.innerHTML = `
      ${pageHeader('表示エラー', 'データの読み込みに失敗しました。')}
      <article class="card"><p>${escapeHtml(error.message)}</p></article>
    `;
  }
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);
