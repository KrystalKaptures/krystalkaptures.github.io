const FUN_TIMES = {
    '1:01': 'A tidy mirror time.', '1:11': 'Triple ones.', '1:21': 'A mirror tucked inside the hour.',
    '1:31': 'A palindromic time.', '1:41': 'A palindromic time.', '1:51': 'A palindromic time.', '1:23': 'Counting up in order.',
    '2:02': 'A tidy mirror time.', '2:10': 'Counting down in order.', '2:12': 'A palindromic time.', '2:22': 'Triple twos.',
    '2:32': 'A palindromic time.', '2:42': 'A palindromic time.', '2:52': 'A palindromic time.', '2:34': 'Counting up in order.',
    '3:03': 'A tidy mirror time.', '3:13': 'A palindromic time.', '3:23': 'A palindromic time.', '3:33': 'Triple threes.',
    '3:43': 'A palindromic time.', '3:53': 'A palindromic time.', '3:21': 'Counting down in order.', '3:45': 'Counting up in order.',
    '4:04': 'A tidy mirror time.', '4:14': 'A palindromic time.', '4:24': 'A palindromic time.', '4:34': 'A palindromic time.',
    '4:44': 'Triple fours.', '4:54': 'A palindromic time.', '4:32': 'Counting down in order.', '4:56': 'Counting up in order.',
    '5:05': 'A tidy mirror time.', '5:15': 'A palindromic time.', '5:25': 'A palindromic time.', '5:35': 'A palindromic time.',
    '5:45': 'A palindromic time.', '5:43': 'Counting down in order.', '5:55': 'Triple fives.',
    '6:06': 'A tidy mirror time.', '6:16': 'A palindromic time.', '6:26': 'A palindromic time.', '6:36': 'A palindromic time.',
    '6:46': 'A palindromic time.', '6:56': 'A palindromic time.', '6:54': 'Counting down in order.',
    '7:07': 'A tidy mirror time.', '7:17': 'A palindromic time.', '7:27': 'A palindromic time.', '7:37': 'A palindromic time.',
    '7:47': 'A palindromic time.', '7:57': 'A palindromic time.',
    '8:08': 'A tidy mirror time.', '8:18': 'A palindromic time.', '8:28': 'A palindromic time.', '8:38': 'A palindromic time.',
    '8:48': 'A palindromic time.', '8:58': 'A palindromic time.',
    '9:09': 'A tidy mirror time.', '9:19': 'A palindromic time.', '9:29': 'A palindromic time.', '9:39': 'A palindromic time.',
    '9:49': 'A palindromic time.', '9:59': 'A palindromic time.',
    '10:01': 'A neat mirror across the digits.', '10:10': 'Double digits on the clock.', '11:11': 'All ones. Make a wish.',
    '12:12': 'Double digits on the clock.', '12:21': 'A mirror tucked inside the hour.', '12:34': 'A clean counting sequence.'
};

const STORAGE_KEYS = {
    preferences: 'kk-funtimes-preferences-v1',
    catches: 'kk-funtimes-catches-v1',
    visitCatches: 'kk-funtimes-visit-catches-v1'
};

const DEFAULTS = {
    background: '#071126',
    accent: '#79e6ff',
    effect: 'confetti',
    message: 'FunTime caught!'
};

const refs = {
    time: document.querySelector('#time-12'), period: document.querySelector('#period'),
    date: document.querySelector('#date-12'), state: document.querySelector('#clock-state'),
    title: document.querySelector('#celebration-title'), reason: document.querySelector('#celebration-reason'),
    catchButton: document.querySelector('#catch-button'), catchLabel: document.querySelector('#catch-button-label'), layer: document.querySelector('#celebration-layer'),
    count: document.querySelector('#caught-count'), dialogCount: document.querySelector('#dialog-count'),
    dialog: document.querySelector('#caught-dialog'), list: document.querySelector('#caught-list'),
    toast: document.querySelector('#toast'), background: document.querySelector('#background-color'),
    accent: document.querySelector('#accent-color'), message: document.querySelector('#celebration-message'),
    nextTime: document.querySelector('#next-funtime'), countdown: document.querySelector('#next-countdown'),
    lastTime: document.querySelector('#last-funtime'), lastCelebrated: document.querySelector('#last-celebrated')
};

let preferences = { ...DEFAULTS, ...readJSON(STORAGE_KEYS.preferences, {}) };
let catches = normalizeCatches(readJSON(STORAGE_KEYS.catches, []));
const visitCatches = new Set(readSessionJSON(STORAGE_KEYS.visitCatches, []));
let lastAutomaticCatch = '';
let toastTimer;
let debugTimeOverride = null;

function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* The clock still works when storage is unavailable. */ }
}

function readSessionJSON(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function writeSessionJSON(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); }
    catch { /* A private session can still celebrate without visit memory. */ }
}

function normalizeCatches(rawCatches) {
    if (!Array.isArray(rawCatches)) return [];
    const grouped = new Map();
    rawCatches.forEach((caught) => {
        const timeKey = caught.key || String(caught.label || '').match(/\d{1,2}:\d{2}/)?.[0];
        if (!timeKey) return;
        const existing = grouped.get(timeKey);
        const caughtAt = caught.lastCaughtAt || caught.caughtAt || new Date().toISOString();
        const count = Math.max(1, Number(caught.count) || 1);
        if (existing) {
            existing.count += count;
            if (caughtAt > existing.lastCaughtAt) {
                existing.lastCaughtAt = caughtAt;
                existing.reason = caught.reason || existing.reason;
            }
        } else {
            grouped.set(timeKey, { key: timeKey, reason: caught.reason || FUN_TIMES[timeKey] || 'A moment worth catching.', count, lastCaughtAt: caughtAt });
        }
    });
    return [...grouped.values()].sort((a, b) => b.lastCaughtAt.localeCompare(a.lastCaughtAt));
}

function hexToRgb(hex) {
    const cleaned = hex.replace('#', '');
    const full = cleaned.length === 3 ? cleaned.split('').map((char) => char + char).join('') : cleaned;
    const number = Number.parseInt(full, 16);
    return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

function applyPreferences() {
    document.documentElement.style.setProperty('--bg', preferences.background);
    document.documentElement.style.setProperty('--accent', preferences.accent);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(preferences.accent));
    refs.background.value = preferences.background;
    refs.accent.value = preferences.accent;
    refs.message.value = preferences.message;
    const activeEffect = document.querySelector(`input[name="effect"][value="${preferences.effect}"]`);
    if (activeEffect) activeEffect.checked = true;
}

function savePreferences() {
    writeJSON(STORAGE_KEYS.preferences, preferences);
    applyPreferences();
}

function formatMoment(date) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function totalCaught() {
    return catches.reduce((total, caught) => total + caught.count, 0);
}

function appendTallyMarks(container, count) {
    container.replaceChildren();
    container.setAttribute('aria-label', `${count} ${count === 1 ? 'tally' : 'tallies'}`);
    let remaining = count;
    while (remaining > 0) {
        const size = Math.min(5, remaining);
        const group = document.createElement('span');
        group.className = `tally-group${size === 5 ? ' is-five' : ''}`;
        group.setAttribute('aria-hidden', 'true');
        for (let index = 0; index < size; index += 1) group.appendChild(document.createElement('i'));
        container.appendChild(group);
        remaining -= size;
    }
}

function showLastCelebrated(caught, again = false) {
    if (!caught) return;
    refs.lastTime.textContent = caught.key;
    refs.lastCelebrated.textContent = again ? 'Celebrated again just now' : `Last caught ${formatMoment(new Date(caught.lastCaughtAt))}`;
}

function renderCatches() {
    const total = totalCaught();
    refs.count.textContent = total;
    refs.dialogCount.textContent = total;
    refs.list.replaceChildren();
    if (!catches.length) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = 'Your first FunTime is waiting to be caught ✦';
        refs.list.appendChild(empty);
        return;
    }
    catches.slice(0, 20).forEach((caught) => {
        const item = document.createElement('li');
        const copy = document.createElement('div');
        copy.className = 'caught-time';
        const title = document.createElement('strong');
        const reason = document.createElement('small');
        const tallies = document.createElement('div');
        const total = document.createElement('span');
        tallies.className = 'tally-marks';
        total.className = 'tally-total';
        title.textContent = caught.key;
        reason.textContent = caught.reason;
        total.textContent = caught.count;
        appendTallyMarks(tallies, caught.count);
        copy.append(title, reason);
        item.append(copy, tallies, total);
        refs.list.appendChild(item);
    });
}

function addCatch(timeKey, reason) {
    if (visitCatches.has(timeKey)) return false;
    visitCatches.add(timeKey);
    writeSessionJSON(STORAGE_KEYS.visitCatches, [...visitCatches]);
    const caughtAt = new Date().toISOString();
    const existing = catches.find((caught) => caught.key === timeKey);
    if (existing) {
        existing.count += 1;
        existing.lastCaughtAt = caughtAt;
        existing.reason = reason;
    } else {
        catches.push({ key: timeKey, reason, count: 1, lastCaughtAt: caughtAt });
    }
    catches.sort((a, b) => b.lastCaughtAt.localeCompare(a.lastCaughtAt));
    writeJSON(STORAGE_KEYS.catches, catches);
    renderCatches();
    showLastCelebrated(catches[0]);
    return true;
}

function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => refs.toast.classList.remove('is-visible'), 1900);
}

function randomColor(index) {
    return [preferences.accent, '#b79cff', '#fff2a8', '#ff95c8', '#75f0ba', '#ffffff'][index % 6];
}

function launchCelebration(origin) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduceMotion ? 8 : preferences.effect === 'sparkles' ? 34 : 48;
    for (let index = 0; index < count; index += 1) {
        const particle = document.createElement('span');
        particle.className = `particle ${preferences.effect}`;
        if (preferences.effect === 'sparkles') particle.textContent = index % 3 === 0 ? '✦' : '·';
        const spread = origin ? 38 : 100;
        const baseX = origin ? origin.x / window.innerWidth * 100 : 50;
        const baseY = origin ? origin.y / window.innerHeight * 100 : 55;
        particle.style.setProperty('--x', `${Math.max(2, Math.min(98, baseX + (Math.random() - 0.5) * spread))}%`);
        particle.style.setProperty('--y', `${baseY + (Math.random() - 0.5) * 18}%`);
        particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 320}px`);
        particle.style.setProperty('--rise', `${-80 - Math.random() * 240}px`);
        particle.style.setProperty('--spin', `${(Math.random() - 0.5) * 900}deg`);
        particle.style.setProperty('--size', `${12 + Math.random() * 24}px`);
        particle.style.setProperty('--duration', `${reduceMotion ? 350 : 1600 + Math.random() * 2200}ms`);
        particle.style.setProperty('--delay', `${Math.random() * 240}ms`);
        particle.style.setProperty('--particle-color', randomColor(index));
        particle.addEventListener('animationend', () => particle.remove());
        refs.layer.appendChild(particle);
    }
}

function celebrate({ timeKey, reason, source, origin }) {
    launchCelebration(origin);
    refs.title.textContent = preferences.message || DEFAULTS.message;
    refs.reason.textContent = reason;
    const counted = addCatch(timeKey, reason);
    refs.state.textContent = counted ? (source === 'automatic' ? 'pattern caught!' : 'bonus FunTime!') : 'already tallied • celebrating anyway';
    if (!counted) showLastCelebrated({ key: timeKey, lastCaughtAt: new Date().toISOString() }, true);
    showToast(counted ? `${preferences.message || DEFAULTS.message} · ${totalCaught()} total` : `${timeKey} is already tallied for this visit ✦`);
    if (navigator.vibrate) navigator.vibrate([30, 35, 55]);
    window.setTimeout(() => { refs.state.textContent = 'watching for a FunTime'; }, 3500);
}

function getNextFunTime(now) {
    let next = null;
    Object.keys(FUN_TIMES).forEach((key) => {
        const [hour12, minute] = key.split(':').map(Number);
        const baseHour = hour12 % 12;
        for (let dayOffset = 0; dayOffset <= 1; dayOffset += 1) {
            [baseHour, baseHour + 12].forEach((hour24) => {
                const candidate = new Date(now);
                candidate.setDate(now.getDate() + dayOffset);
                candidate.setHours(hour24, minute, 0, 0);
                if (candidate > now && (!next || candidate < next.date)) next = { key, date: candidate };
            });
        }
    });
    return next;
}

function updateCountdown(now) {
    const next = getNextFunTime(now);
    if (!next) return;
    const totalSeconds = Math.max(0, Math.ceil((next.date - now) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    refs.nextTime.textContent = next.key;
    refs.countdown.textContent = `in ${hours ? `${hours}h ` : ''}${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function updateClock() {
    const now = debugTimeOverride ? new Date(debugTimeOverride) : new Date();
    const hour = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const period = now.getHours() >= 12 ? 'PM' : 'AM';
    const key = `${hour}:${minutes}`;
    refs.time.textContent = key;
    refs.time.dateTime = `${String(now.getHours()).padStart(2, '0')}:${minutes}:${seconds}`;
    refs.period.textContent = period;
    refs.date.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
    refs.date.dateTime = now.toISOString().slice(0, 10);
    updateCountdown(now);
    const reason = FUN_TIMES[key];
    refs.catchButton.disabled = !reason;
    refs.catchLabel.textContent = reason ? 'Catch this FunTime' : 'Waiting for a FunTime';
    refs.catchButton.setAttribute('aria-label', reason ? `Catch the ${key} FunTime` : `Catch button unavailable until ${refs.nextTime.textContent}`);
    if (reason) {
        refs.title.textContent = `${key} is a FunTime.`;
        refs.reason.textContent = reason;
        const autoKey = `${now.toISOString().slice(0, 10)}-${key}-${period}`;
        if (lastAutomaticCatch !== autoKey) {
            lastAutomaticCatch = autoKey;
            celebrate({ timeKey: key, reason, source: 'automatic' });
        }
    }
}

refs.catchButton.addEventListener('click', () => {
    const reason = FUN_TIMES[refs.time.textContent];
    if (!reason) return;
    const rect = refs.catchButton.getBoundingClientRect();
    refs.catchButton.classList.add('is-pressed');
    window.setTimeout(() => refs.catchButton.classList.remove('is-pressed'), 170);
    celebrate({ timeKey: refs.time.textContent, reason, source: 'manual', origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } });
});

document.querySelector('#tally-button').addEventListener('click', () => refs.dialog.showModal());
document.querySelector('#close-dialog').addEventListener('click', () => refs.dialog.close());
refs.dialog.addEventListener('click', (event) => { if (event.target === refs.dialog) refs.dialog.close(); });

document.querySelector('#clear-history').addEventListener('click', () => {
    catches = [];
    writeJSON(STORAGE_KEYS.catches, catches);
    renderCatches();
    showToast('Fresh slate, same good timing.');
});

refs.background.addEventListener('input', (event) => { preferences.background = event.target.value; savePreferences(); });
refs.accent.addEventListener('input', (event) => { preferences.accent = event.target.value; savePreferences(); });
document.querySelector('#effect-options').addEventListener('change', (event) => {
    if (event.target.name !== 'effect') return;
    preferences.effect = event.target.value;
    savePreferences();
    launchCelebration();
});
refs.message.addEventListener('input', (event) => {
    preferences.message = event.target.value.trimStart().slice(0, 42);
    writeJSON(STORAGE_KEYS.preferences, preferences);
});

document.querySelector('#reset-look').addEventListener('click', () => {
    preferences = { ...DEFAULTS };
    savePreferences();
    showToast('Back to the original magic.');
});

document.querySelector('#copy-embed').addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('embed', '1');
    try { await navigator.clipboard.writeText(url.href); showToast('Embed link copied!'); }
    catch { window.prompt('Copy this embed link:', url.href); }
});

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('embed') === '1') document.body.classList.add('embed-mode');

if (searchParams.has('debug')) {
    const debugTools = document.querySelector('#debug-tools');
    const debugInput = document.querySelector('#debug-time');
    debugTools.hidden = false;

    document.querySelector('#debug-warp').addEventListener('click', () => {
        const match = debugInput.value.trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!match || Number(match[1]) > 12 || Number(match[2]) > 59 || Number(match[1]) < 1) {
            showToast('Use a time like 1:23.');
            return;
        }
        const warped = new Date();
        warped.setHours(Number(match[1]) % 12, Number(match[2]), 0, 0);
        debugTimeOverride = warped;
        lastAutomaticCatch = '';
        updateClock();
    });

    document.querySelector('#debug-celebrate').addEventListener('click', () => launchCelebration());
}

applyPreferences();
writeJSON(STORAGE_KEYS.catches, catches);
renderCatches();
showLastCelebrated(catches[0]);
updateClock();
window.setInterval(updateClock, 1000);
