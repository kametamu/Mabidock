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
    daily: false,
    weekly: false,
    monthly: false,
  },
  hiddenItems: new Set(),
};
const trainingTags = ['メイン', 'サブ', 'アルカナ', 'スキル', 'ペット'];
const trainingTagClassMap = {
  メイン: 'training-main',
  サブ: 'training-sub',
  アルカナ: 'training-arcana',
  スキル: 'training-skill',
  ペット: 'training-pet',
};
const trainingState = {
  tagActive: Object.fromEntries(trainingTags.map((tag) => [tag, false])),
  openItems: new Set(),
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
              <p class="${item.description === 'Do you know HamPachino ?' ? 'rainbow-blink' : ''}">${escapeHtml(item.description)}</p>
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

function renderTrainingSections(entry) {
  if (!Array.isArray(entry.sections)) {
    return `<p class="section-content">${escapeHtml(entry.content ?? '')}</p>`;
  }

  return entry.sections
    .map((section) => {
      const tableMarkup = section.table
        ? `
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  ${section.table.columns
                    .map((column) => `<th>${escapeHtml(column)}</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${section.table.rows
                  .map(
                    (row) => `
                    <tr>
                      ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
                    </tr>
                  `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        : '';

      const contentMarkup = section.content
        ? `<p class="section-content">${escapeHtml(section.content)}</p>`
        : '';

      const noteMarkup = section.note
        ? `<p class="section-note">${escapeHtml(section.note)}</p>`
        : '';

      return `
        <div class="section-stack">
          <h4 class="section-title">${escapeHtml(section.title)}</h4>
          ${tableMarkup}
          ${contentMarkup}
          ${noteMarkup}
        </div>
      `;
    })
    .join('');
}

function buildTrainingTagControls() {
  return `
    <section class="card dailies-controls">
      <h3 class="section-title">タグで絞り込み</h3>
      <div class="toggle-row">
        ${trainingTags
          .map(
            (tag) => `
            <button
              class="toggle-chip ${trainingState.tagActive[tag] ? 'on' : 'off'}"
              type="button"
              data-training-tag-toggle="${escapeHtml(tag)}"
            >
              ${escapeHtml(tag)}
            </button>
          `,
          )
          .join('')}
      </div>
      <p class="section-content">未選択時は全表示、1つ以上選択時は選択タグに一致する項目のみ表示します。</p>
    </section>
  `;
}

function bindTrainingControls() {
  appRoot.querySelectorAll('[data-training-tag-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const tag = button.getAttribute('data-training-tag-toggle');
      trainingState.tagActive[tag] = !trainingState.tagActive[tag];
      renderTraining();
    });
  });

  appRoot.querySelectorAll('[data-training-id]').forEach((details) => {
    details.addEventListener('toggle', () => {
      const itemId = details.getAttribute('data-training-id');
      if (details.open) {
        trainingState.openItems.add(itemId);
      } else {
        trainingState.openItems.delete(itemId);
      }
    });
  });
}

async function renderTraining() {
  const data = await loadJson('./data/training.json');
  const withIds = data.map((item, index) => ({
    ...item,
    itemId: `${index}:${item.title}`,
  }));
  const activeTags = trainingTags.filter((tag) => trainingState.tagActive[tag]);
  const visible = withIds.filter((item) => {
    if (activeTags.length === 0) return true;
    if (!Array.isArray(item.tags) || item.tags.length === 0) return false;
    return item.tags.some((tag) => activeTags.includes(tag));
  });

  appRoot.innerHTML = `
    ${pageHeader('育成', '育成関連メモの置き場です。')}
    ${buildTrainingTagControls()}
    <section class="toolbar-row">
      <p class="section-content">表示中: ${visible.length} / 全体: ${data.length}</p>
    </section>
    <section class="section-stack">
      ${visible
        .map(
          (entry) => `
          <article class="card">
            <details class="training-details" data-training-id="${escapeHtml(entry.itemId)}" ${
              trainingState.openItems.has(entry.itemId) ? 'open' : ''
            }>
              <summary>
                <h3>${escapeHtml(entry.title)}</h3>
                <div class="item-tags">
                  ${(Array.isArray(entry.tags) ? entry.tags : [])
                    .map(
                      (tag) =>
                        `<span class="tag ${escapeHtml(trainingTagClassMap[tag] ?? 'training-main')}">${escapeHtml(tag)}</span>`,
                    )
                    .join('')}
                </div>
              </summary>
              <div class="section-stack training-body">${renderTrainingSections(entry)}</div>
            </details>
          </article>
        `,
        )
        .join('')}
    </section>
  `;

  bindTrainingControls();
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
      <h3 class="section-title">タグで絞り込み</h3>
      <div class="toggle-row">
        ${types
          .map(
            (type) => `
            <button
              class="toggle-chip ${dailiesState.typeActive[type] ? 'on' : 'off'}"
              type="button"
              data-type-toggle="${type}"
            >
              ${escapeHtml(type)}
            </button>
          `,
          )
          .join('')}
      </div>
      <p class="section-content">未選択時は全表示、1つ以上選択時は選択タグに一致する項目のみ表示します。</p>
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

  const activeTypes = Object.entries(dailiesState.typeActive)
    .filter(([, isActive]) => isActive)
    .map(([type]) => type);

  const visible = withIds.filter((item) => {
    const passesTagFilter = activeTypes.length === 0 || activeTypes.includes(item.type);
    return passesTagFilter && !dailiesState.hiddenItems.has(item.itemId);
  });

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
