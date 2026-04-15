// ===== 日付ユーティリティ =====
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function getTodayStr() {
    return formatDate(new Date());
}
function getWeekAgoStr() {
    const d = new Date();
    return formatDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
}

// ===== コマンド定義 =====
// template の {key} がパラメータ入力値に置換される
// {userId}   → 登録済みユーザーID
// {until}    → 入力値 +1日 (X の until: は指定日を含まないため自動補正)
// {kw}       → キーワード入力（空なら空文字、入力あれば末尾にスペースを付けて展開）
const COMMAND_GROUPS = [
    // ===== 実用テンプレ =====
    {
        title: 'よく使うおすすめ（返信・リポスト除く）',
        items: [
            {
                label: '選択IDのリポストを除いた投稿だけ',
                template: 'from:{userId} exclude:nativeretweets exclude:replies'
            },
            {
                label: '選択IDの投稿を期間検索',
                template: 'from:{userId} since:{since} until:{until} exclude:nativeretweets exclude:replies',
                params: [
                    { key: 'since', type: 'date', unit: 'から', default: () => getWeekAgoStr() },
                    { key: 'until', type: 'date', unit: 'まで', default: () => getTodayStr() }
                ]
            },
            {
                label: '選択IDで"いいね"された投稿',
                template: 'from:{userId} min_faves:{faves} exclude:nativeretweets exclude:replies',
                params: [
                    { key: 'faves', type: 'number', unit: 'いいね以上', default: () => 100, min: 1 }
                ]
            },
            {
                label: '選択IDの投稿をキーワードで検索',
                template: 'from:{userId} {keyword} exclude:nativeretweets exclude:replies',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' }
                ]
            },
            {
                label: 'キーワードで人気投稿を探す',
                template: '{keyword} min_faves:{faves} -filter:replies',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' },
                    { key: 'faves',   type: 'number', unit: 'いいね以上', default: () => 100, min: 1 }
                ]
            },
            {
                label: '画像付きの投稿を探す',
                template: '{keyword} filter:images -filter:replies',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' }
                ]
            },
            {
                label: '障害・エラー報告を探す',
                template: '{keyword} (障害 OR エラー OR 落ちた) -filter:replies',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'サービス名', default: () => '' }
                ]
            }
        ]
    },

    // ===== 自分のポスト =====
    {
        title: '選択IDのポスト',
        items: [
            {
                label: '投稿を期間で検索（返信・リポスト含む）',
                template: 'from:{userId} since:{since} until:{until}',
                params: [
                    { key: 'since', type: 'date', unit: 'から', default: () => getWeekAgoStr() },
                    { key: 'until', type: 'date', unit: 'まで', default: () => getTodayStr() }
                ]
            },
            {
                label: '返信を除いた投稿だけ',
                template: 'from:{userId} exclude:replies'
            },

            {
                label: '返信・リポストを除いた投稿だけ',
                template: 'from:{userId} exclude:nativeretweets exclude:replies'
            },
            {
                label: 'いいね数で検索（返信・リポスト含む）',
                template: 'from:{userId} min_faves:{faves}',
                params: [
                    { key: 'faves', type: 'number', unit: 'いいね以上', default: () => 100, min: 1 }
                ]
            },
            {
                label: '期間といいね数で検索（返信・リポスト含む）',
                template: 'from:{userId} since:{since} until:{until} min_faves:{faves}',
                params: [
                    { key: 'since', type: 'date', unit: 'から', default: () => getWeekAgoStr() },
                    { key: 'until', type: 'date', unit: 'まで', default: () => getTodayStr() },
                    { key: 'faves', type: 'number', unit: 'いいね以上', default: () => 100, min: 1 }
                ]
            }
        ]
    },

    // ===== キーワード検索 =====
    {
        title: 'キーワード検索',
        items: [
            {
                label: '選択IDの投稿からキーワード検索',
                template: 'from:{userId} {keyword}',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' }
                ]
            },
            {
                label: 'キーワードを期間で絞り込む',
                template: '{keyword} since:{since} until:{until}',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' },
                    { key: 'since',   type: 'date', unit: 'から', default: () => getWeekAgoStr() },
                    { key: 'until',   type: 'date', unit: 'まで', default: () => getTodayStr() }
                ]
            },
            {
                label: 'キーワードをいいね数で絞り込む',
                template: '{keyword} min_faves:{faves}',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' },
                    { key: 'faves',   type: 'number', unit: 'いいね以上', default: () => 100, min: 1 }
                ]
            },
            {
                label: '求人・PR系のノイズを除いて検索',
                template: '{keyword} -求人 -採用 -PR',
                params: [
                    { key: 'keyword', type: 'text', placeholder: 'キーワード', default: () => '' }
                ]
            },
            {
                label: 'いずれかのキーワードを含む（OR検索）',
                template: '{orWords}',
                params: [
                    { key: 'orWords', type: 'text', placeholder: 'AI Gemini Claude（スペース区切り）', default: () => '', orSearch: true, wide: true }
                ]
            },
            {
                label: 'キーワード検索の結果からノイズを除く',
                template: '{keyword} {excludeWords}',
                params: [
                    { key: 'keyword',      type: 'text', placeholder: 'キーワード',                  default: () => '', preLabel: '検索:' },
                    { key: 'excludeWords', type: 'text', placeholder: '除外ワード（スペース区切り）', default: () => '', excludeSearch: true, wide: true, preLabel: '除外:' }
                ]
            }
        ]
    },

    // ===== フィルター =====
    // {kw} はキーワード省略可プレフィックス: 入力あり → "キーワード "、空 → ""
    {
        title: 'フィルター',
        items: [
            { label: 'フォロー中の人の投稿だけ', template: '{kw}filter:follows',       params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] },
            { label: '返信投稿だけ',             template: '{kw}filter:replies',        params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] },
            { label: '返信を除いて検索',         template: '{kw}-filter:replies',       params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] },
            { label: 'リポストを除いて検索',     template: '{kw}-filter:retweets',      params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] },
            { label: '画像付きの投稿だけ',       template: '{kw}filter:images',         params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] },
            { label: '動画付きの投稿だけ',       template: '{kw}filter:videos',         params: [{ key: 'kw', type: 'text', placeholder: 'キーワード（必須）', default: () => '', prefix: true }] }
        ]
    },

];

// ===== アカウント管理 =====
let currentUserId = '';
let userAccounts  = [];   // { id, label }[]

function loadAccounts() {
    chrome.storage.local.get(['userId', 'userAccounts'], (data) => {
        userAccounts  = data.userAccounts || [];
        currentUserId = data.userId       || '';

        // マイグレーション: 旧 userId のみ存在する場合はリストに移行
        if (currentUserId && !userAccounts.find(a => a.id === currentUserId)) {
            userAccounts.push({ id: currentUserId, label: currentUserId });
            persistAccounts();
        } else {
            refreshAccountUI();
        }
    });
}

function persistAccounts(callback) {
    chrome.storage.local.set({ userId: currentUserId, userAccounts }, () => {
        refreshAccountUI();
        if (callback) callback();
    });
}

function refreshAccountUI() {
    renderUserBar();
    renderAccountList();
}

function renderUserBar() {
    const el = document.getElementById('activeDisplay');
    if (currentUserId) {
        const acc = userAccounts.find(a => a.id === currentUserId);
        const label = acc ? acc.label : currentUserId;
        el.textContent = `${label}  @${currentUserId}`;
        el.classList.remove('unset');
    } else {
        el.textContent = '未設定（クリックして登録）';
        el.classList.add('unset');
    }
}

function renderAccountList() {
    const container = document.getElementById('panelAccounts');
    container.innerHTML = '';

    if (userAccounts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'panel-empty';
        empty.textContent = 'まだ登録されていません';
        container.appendChild(empty);
        return;
    }

    userAccounts.forEach(acc => {
        const row = document.createElement('div');
        row.className = 'panel-acc-row' + (acc.id === currentUserId ? ' active-row' : '');

        const radio = document.createElement('input');
        radio.type      = 'radio';
        radio.name      = 'activeAcc';
        radio.className = 'panel-acc-radio';
        radio.checked   = acc.id === currentUserId;
        radio.addEventListener('change', (e) => { e.stopPropagation(); setActiveAccount(acc.id); });

        const name = document.createElement('span');
        name.className   = 'panel-acc-name';
        name.textContent = acc.label;

        const idEl = document.createElement('span');
        idEl.className   = 'panel-acc-id';
        idEl.textContent = '@' + acc.id;

        const delBtn = document.createElement('button');
        delBtn.className   = 'panel-del-btn';
        delBtn.textContent = '×';
        delBtn.title       = '削除';
        delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteAccount(acc.id); });

        row.append(radio, name, idEl, delBtn);
        container.appendChild(row);
    });
}

function setActiveAccount(id) {
    currentUserId = id;
    persistAccounts();
}

function addAccount() {
    const nameInput = document.getElementById('panelNameInput');
    const idInput   = document.getElementById('panelIdInput');
    const label     = nameInput.value.trim();
    const id        = idInput.value.trim().replace(/^@/, '');

    nameInput.classList.remove('error');
    idInput.classList.remove('error');

    if (!id)    { idInput.classList.add('error');   idInput.focus();   return; }
    if (!label) { nameInput.classList.add('error'); nameInput.focus(); return; }
    if (userAccounts.find(a => a.id === id)) { idInput.classList.add('error'); idInput.focus(); return; }

    userAccounts.push({ id, label });
    if (userAccounts.length === 1) currentUserId = id;
    nameInput.value = '';
    idInput.value   = '';
    persistAccounts();
}

function deleteAccount(id) {
    userAccounts = userAccounts.filter(a => a.id !== id);
    if (currentUserId === id) {
        currentUserId = userAccounts.length > 0 ? userAccounts[0].id : '';
    }
    persistAccounts();
}

// 折りたたみトグル
document.getElementById('userSection').addEventListener('click', () => {
    document.getElementById('userPanel').classList.toggle('open');
    document.getElementById('toggleArrow').classList.toggle('open');
});

// 追加ボタン・Enter キー
document.getElementById('panelAddBtn').addEventListener('click', (e) => { e.stopPropagation(); addAccount(); });
['panelNameInput', 'panelIdInput'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('click',   (e) => e.stopPropagation());
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.stopPropagation(); addAccount(); } });
});

// ===== until を +1日補正（X の until: は指定日を含まないため） =====
function addOneDay(dateStr) {
    if (!dateStr) return dateStr;
    const [y, m, d] = dateStr.split('-').map(Number);
    return formatDate(new Date(y, m - 1, d + 1));
}

// ===== since を -1日補正（X の since: は指定日を含まないため） =====
function subOneDay(dateStr) {
    if (!dateStr) return dateStr;
    const [y, m, d] = dateStr.split('-').map(Number);
    return formatDate(new Date(y, m - 1, d - 1));
}

// ===== コマンド文字列生成 =====
function buildCommand(template, params, rowEl) {
    let cmd = template;

    // {userId} をユーザーIDに置換
    cmd = cmd.replace(/{userId}/g, currentUserId || 'ユーザーID');

    // パラメータ置換
    if (params && params.length > 0) {
        params.forEach(p => {
            const input = rowEl.querySelector(`[data-key="${p.key}"]`);
            let val = input ? input.value.trim() : String(p.default());

            if (p.prefix) {
                // キーワードプレフィックス: 入力があれば "値 "、なければ ""
                val = val ? val + ' ' : '';
            } else if (p.key === 'until' && val) {
                // until は +1日補正
                val = addOneDay(val);
            } else if (p.orSearch && val) {
                // OR検索: スペース区切りの単語を (word1 OR word2) に変換
                const words = val.trim().split(/\s+/).filter(w => w);
                val = words.length > 1 ? `(${words.join(' OR ')})` : words[0] || '';
            } else if (p.excludeSearch && val) {
                // 除外ワード: スペース区切りの単語を -word1 -word2 に変換
                const words = val.trim().split(/\s+/).filter(w => w);
                val = words.map(w => `-${w}`).join(' ');
            }

            cmd = cmd.replace(new RegExp(`\\{${p.key}\\}`, 'g'), val);
        });
    }

    // 余分なスペースを整理
    return cmd.replace(/\s+/g, ' ').trim();
}

// ===== 入力バリデーション（共通） =====
// 戻り値: true = OK、false = エラーあり（btn にフィードバック済み）
function validateInputs(template, params, rowEl, btn, resetText) {
    // ユーザーID未入力チェック
    if (template.includes('{userId}') && !currentUserId) {
        btn.textContent = '!';
        btn.classList.add('no-id');
        // パネルを開いて登録を促す
        document.getElementById('userPanel').classList.add('open');
        document.getElementById('toggleArrow').classList.add('open');
        document.getElementById('panelIdInput').focus();
        setTimeout(() => {
            btn.textContent = resetText;
            btn.classList.remove('no-id');
        }, 1500);
        return false;
    }

    // フィルター系：{kw} が prefix かつ空の場合はキーワード必須
    if (params) {
        const kwParam = params.find(p => p.prefix && p.key === 'kw');
        if (kwParam) {
            const kwInput = rowEl.querySelector('[data-key="kw"]');
            if (!kwInput || !kwInput.value.trim()) {
                btn.textContent = '!';
                btn.classList.add('no-id');
                if (kwInput) {
                    kwInput.classList.add('error');
                    kwInput.focus();
                }
                setTimeout(() => {
                    btn.textContent = resetText;
                    btn.classList.remove('no-id');
                    if (kwInput) kwInput.classList.remove('error');
                }, 1500);
                return false;
            }
        }
    }

    return true;
}

// ===== X検索を直接開く =====
function openSearch(template, params, rowEl, btn) {
    if (!validateInputs(template, params, rowEl, btn, '開く')) return;

    const cmd = buildCommand(template, params, rowEl);
    const url = `https://x.com/search?q=${encodeURIComponent(cmd)}&src=typed_query`;
    chrome.tabs.create({ url });
}

// ===== コピー処理 =====
function copyCommand(template, params, rowEl, btn) {
    if (!validateInputs(template, params, rowEl, btn, '📋')) return;

    const cmd = buildCommand(template, params, rowEl);

    navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋';
            btn.classList.remove('copied');
        }, 1500);
    }).catch(() => {
        // clipboard API が使えない場合のフォールバック
        const ta = document.createElement('textarea');
        ta.value = cmd;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋';
            btn.classList.remove('copied');
        }, 1500);
    });
}

// ===== コマンド一覧レンダリング =====
function renderCommands() {
    const container = document.getElementById('commandList');

    COMMAND_GROUPS.forEach(group => {
        const catEl = document.createElement('div');
        catEl.className = 'category';

        const titleEl = document.createElement('div');
        titleEl.className = 'category-title';
        titleEl.textContent = group.title;
        catEl.appendChild(titleEl);

        group.items.forEach(item => {
            const rowEl = document.createElement('div');
            rowEl.className = 'cmd-row';

            // ===== 上段：ラベル＋コピーボタン =====
            const topEl = document.createElement('div');
            topEl.className = 'cmd-row-top';

            const labelEl = document.createElement('span');
            labelEl.className = 'cmd-label';
            labelEl.textContent = item.label;
            topEl.appendChild(labelEl);

            const openBtn = document.createElement('button');
            openBtn.className = 'open-btn';
            openBtn.textContent = '開く';
            openBtn.onclick = () => openSearch(item.template, item.params, rowEl, openBtn);
            topEl.appendChild(openBtn);

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '📋';
            copyBtn.onclick = () => copyCommand(item.template, item.params, rowEl, copyBtn);
            topEl.appendChild(copyBtn);

            rowEl.appendChild(topEl);

            // ===== 下段：パラメータ入力（パラメータがある行のみ） =====
            if (item.params && item.params.length > 0) {
                const paramsEl = document.createElement('div');
                paramsEl.className = 'cmd-params';

                item.params.forEach(p => {
                    const wrap = document.createElement('div');
                    wrap.className = 'param-wrap';

                    if (p.preLabel) {
                        const pre = document.createElement('span');
                        pre.className = 'param-unit';
                        pre.textContent = p.preLabel;
                        wrap.appendChild(pre);
                    }

                    const input = document.createElement('input');
                    input.type = p.type;
                    input.className = 'param-input';
                    input.value = p.default();
                    input.dataset.key = p.key;
                    if (p.placeholder) input.placeholder = p.placeholder;
                    if (p.min !== undefined) input.min = p.min;
                    if (p.wide) input.classList.add('wide');
                    wrap.appendChild(input);

                    if (p.unit) {
                        const unitEl = document.createElement('span');
                        unitEl.className = 'param-unit';
                        unitEl.textContent = p.unit;
                        wrap.appendChild(unitEl);
                    }

                    paramsEl.appendChild(wrap);
                });

                rowEl.appendChild(paramsEl);
            }

            catEl.appendChild(rowEl);
        });

        container.appendChild(catEl);
    });
}

// ===== 初期化 =====
loadAccounts();
renderCommands();
