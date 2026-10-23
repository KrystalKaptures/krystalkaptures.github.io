const STORAGE_KEY = 'kk-alliteration-mood-v1';
const MOOD_COLORS = {
  bright: ['#ffe985', '255, 233, 133'],
  blue: ['#83b7ff', '131, 183, 255'],
  bold: ['#ff8d78', '255, 141, 120'],
  gentle: ['#8de5c2', '141, 229, 194'],
  weird: ['#c89cff', '200, 156, 255'],
  daily: ['#bb9cff', '187, 156, 255']
};

const refs = {
  date: document.querySelector('#date-label'),
  source: document.querySelector('#source-label'),
  word: document.querySelector('#word-label'),
  day: document.querySelector('#day-label'),
  definition: document.querySelector('#definition-label'),
  emoji: document.querySelector('#mood-emoji'),
  options: document.querySelector('#mood-options'),
  card: document.querySelector('#word-card'),
  toast: document.querySelector('#word-toast'),
  headerClock: document.querySelector('#header-funtime-clock'),
  headerWidget: document.querySelector('.header-funtime'),
  headerIndicator: document.querySelector('.header-clock-label i')
};

const today = new Date();
let selectedMood = readMood();
let toastTimer;

function updateHeaderClock() {
  const now = new Date();
  const timeKey = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isFunTime = isHeaderFunTime(timeKey);
  refs.headerClock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  refs.headerClock.dateTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  refs.headerWidget.classList.toggle('is-funtime', isFunTime);
  refs.headerIndicator.textContent = isFunTime ? '✦' : '';
  refs.headerWidget.setAttribute('aria-label', isFunTime ? `Open FunTimes — ${timeKey} is a FunTime` : 'Open FunTimes');
}

function isHeaderFunTime(timeKey) {
  const [hour, minute] = timeKey.split(':');
  const digits = `${hour}${minute}`;
  const values = [...digits].map(Number);
  const palindrome = digits === [...digits].reverse().join('');
  const repeatedPair = hour === minute;
  const countingUp = values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  const countingDown = values.every((value, index) => index === 0 || value === values[index - 1] - 1);
  return palindrome || repeatedPair || countingUp || countingDown;
}

function readMood() {
  try { return localStorage.getItem(STORAGE_KEY) || '';
  } catch { return ''; }
}

function saveMood(mood) {
  selectedMood = mood;
  try {
    if (mood) localStorage.setItem(STORAGE_KEY, mood);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* The daily pick still works without storage. */ }
}

function setTheme(mood) {
  const color = MOOD_COLORS[mood] || MOOD_COLORS.daily;
  document.documentElement.style.setProperty('--mood', color[0]);
  document.documentElement.style.setProperty('--mood-rgb', color[1]);
}

function showWord(dailyWord, mood) {
  refs.card.classList.add('is-changing');
  window.setTimeout(() => refs.card.classList.remove('is-changing'), 230);
  refs.word.textContent = dailyWord.word;
  refs.day.textContent = dailyWord.dayName;
  refs.definition.textContent = dailyWord.definition;
  refs.emoji.textContent = dailyWord.emoji || '✦';
  refs.source.textContent = dailyWord.moodLabel ? `${dailyWord.moodLabel} · ${dailyWord.index + 1} of ${dailyWord.total}` : 'daily pick';
  setTheme(mood || 'daily');
  document.querySelectorAll('.mood-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mood === mood));
  });
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => refs.toast.classList.remove('is-visible'), 1600);
}

function chooseMood(mood) {
  const word = window.KRYSTAL_DAILY_WORDS.getMoodWord(mood, today, true);
  if (!word) return;
  saveMood(mood);
  showWord(word, mood);
  showToast(`${word.emoji} ${word.word} ${word.dayName}`);
}

function loadDailyPick() {
  saveMood('');
  refs.source.textContent = 'gathering a daily pick…';
  window.KRYSTAL_DAILY_WORDS.loadDailyWord(today).then((word) => showWord(word, ''));
}

window.KRYSTAL_DAILY_WORDS.getMoodOptions().forEach((mood) => {
  const button = document.createElement('button');
  button.className = 'mood-button';
  button.type = 'button';
  button.dataset.mood = mood.id;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `${mood.label} feeling`);
  const emoji = document.createElement('span');
  const label = document.createElement('span');
  emoji.className = 'emoji';
  label.className = 'label';
  emoji.textContent = mood.emoji;
  label.textContent = mood.label;
  button.append(emoji, label);
  button.addEventListener('click', () => chooseMood(mood.id));
  refs.options.appendChild(button);
});

refs.date.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(today);
refs.date.dateTime = today.toISOString().slice(0, 10);
document.querySelector('#daily-pick').addEventListener('click', loadDailyPick);
updateHeaderClock();
window.setInterval(updateHeaderClock, 1000);

const savedMoodWord = window.KRYSTAL_DAILY_WORDS.getMoodWord(selectedMood, today, false);
if (savedMoodWord) {
  saveMood(selectedMood);
  showWord(savedMoodWord, selectedMood);
} else loadDailyPick();
