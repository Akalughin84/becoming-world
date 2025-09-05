// app.js
// 🌱 Becoming — создано Алексей Калугин, 2025
// Не для продуктивности. Для присутствия.
// Ты здесь. Это уже победа.

// === Константы ===
const DONATE = {
  boosty: "https://boosty.to/becoming",
  kofi: "https://ko-fi.com/becoming5036"
};

const NATURE_SOUNDS = {
  rain: "🌧️ Дождь",
  fire: "🔥 Огонь",
  ocean: "🌊 Океан"
};

const DAILY_WORDS = ["Дыши", "здесь", "достаточно", "иди", "верь", "будь"];

const GROWTH_AXES = [
  { neg: "не знаю", pos: "здесь", label: "Глубина" },
  { neg: "один", pos: "связь", label: "Связь" },
  { neg: "устал", pos: "покой", label: "Энергия" },
  { neg: "страх", pos: "вера", label: "Смелость" }
];

// === Глобальные данные ===
const userData = {
  version: 1,
  wordCounts: {},
  dailyWords: [],
  letters: [],
  dreams: [],
  forgiveness: [],
  silenceMoments: [],
  dailyPresence: [], // даты, когда отметил "здесь"
  journal: [], // дневник
  rituals: {
    morning: [],
    evening: []
  }
};

// === Загрузка/сохранение ===
function loadData() {
  try {
    const saved = localStorage.getItem('becoming_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(userData, parsed);
      userData.dailyWords = userData.dailyWords.filter(w =>
        w.date && !isNaN(new Date(w.date).getTime())
      );
    }
  } catch (e) {
    console.error("Ошибка загрузки данных:", e);
  }
}

function saveData() {
  try {
    localStorage.setItem('becoming_data', JSON.stringify(userData));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showModal("⚠️ Слишком много данных. Очисти старые записи.");
    } else {
      console.error("Ошибка сохранения:", e);
    }
  }
}

loadData();

// === Определение времени суток ===
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return { emoji: "🌅", name: "Утро", key: "morning" };
  if (hour >= 10 && hour < 18) return { emoji: "🌤️", name: "День", key: "day" };
  if (hour >= 18 && hour < 23) return { emoji: "🌙", name: "Вечер", key: "evening" };
  return { emoji: "🌌", name: "Ночь", key: "night" };
}

// === Авто-тема по времени суток ===
function applyTimeTheme() {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 6;
  document.body.classList.toggle('dark', isNight);
  localStorage.setItem('theme', isNight ? 'dark' : 'light');
}

// === Голос: Web Speech API ===
function speak(text, emotion = "calm") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.8;

  if (emotion === "soft") {
    utterance.rate = 0.7;
    utterance.pitch = 0.7;
  } else if (emotion === "urgent") {
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
  } else if (emotion === "calm") {
    utterance.rate = 0.8;
    utterance.pitch = 0.75;
  }

  window.speechSynthesis.speak(utterance);
}

// === Слово дня ===
function getDailyWord() {
  const today = new Date().toDateString();
  const usedToday = userData.dailyWords.filter(w =>
    new Date(w.date).toDateString() === today
  );
  if (usedToday.length > 0) return usedToday[0].word;

  const word = DAILY_WORDS[Math.floor(Math.random() * DAILY_WORDS.length)];
  userData.dailyWords.push({ word, date: new Date().toISOString() });
  saveData();
  return word;
}

// === Письмо себе ===
function writeLetter() {
  const text = prompt("Напиши письмо себе через год:");
  if (text?.trim()) {
    userData.letters.push({
      content: text.trim(),
      timestamp: new Date().toISOString()
    });
    logWord("связь");
    saveData();
    showModal("✉️ Письмо отправлено.");
    speak("Письмо отправлено.", "soft");
  }
}

// === Письмо прощению ===
function showForgiveness() {
  const recipient = prompt("Кому ты хочешь простить? (например: себе, маме)") || "тому, кто ждал";
  const content = prompt("Напиши своё письмо:");
  if (content?.trim()) {
    userData.forgiveness.push({
      recipient: recipient.trim(),
      text: content.trim(),
      date: new Date().toISOString()
    });
    logWord("покой");
    saveData();
    showModal("✅ Ты сказал. Это важно.");
    speak("Ты сказал. Это важно.", "calm");
  }
}

// === Запись сна ===
function saveDream() {
  const dream = prompt("Расскажи сон:");
  if (dream?.trim()) {
    userData.dreams.push({
      text: dream.trim(),
      timestamp: new Date().toISOString()
    });
    logWord("глубина");
    saveData();
    showModal("🌌 Сон сохранён.");
    speak("Сон сохранён. Я помню.", "soft");
  }
}

// === Просто быть ===
function logSilence() {
  userData.silenceMoments.push(new Date().toISOString());
  logWord("покой");
  saveData();
  showModal("🧘 Ты был. Это уже присутствие.");
  speak("Ты был. Это уже присутствие.", "soft");
}

// === Природа ===
let currentAudio = null;
let currentSound = null;

function playNature(sound) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (!NATURE_SOUNDS[sound]) return;

  try {
    const audio = new Audio(`sounds/${sound}.mp3`);
    audio.loop = true;
    audio.volume = 0.7;

    audio.addEventListener('error', () => {
      showModal("⚠️ Не удалось загрузить звук. Проверь папку /sounds");
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn("Автовоспроизведение заблокировано:", e);
        showModal("⚠️ Чтобы включить звук, нажми на страницу.");
      });
    }

    currentAudio = audio;
    currentSound = sound;

    updateUI();
    showModal(`🎧 ${NATURE_SOUNDS[sound]} идёт. Нажми 'Пауза'.`, "rain");
  } catch (e) {
    showModal("⚠️ Звук недоступен.");
  }
}

function pauseNature() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    currentSound = null;
    updateUI();
    showModal("⏸️ Звук остановлен.");
  }
}

function updateUI() {
  document.querySelectorAll('[onclick^="playNature"]').forEach(btn => {
    const sound = btn.getAttribute('onclick').match(/'(.+?)'/)?.[1];
    btn.style.background = sound === currentSound ? '#d4edda' : '#f1f3f5';
  });
}

// === Карта роста ===
function showMap() {
  let map = "🗺 Визуальная карта роста\n\n";
  GROWTH_AXES.forEach(ax => {
    const neg = userData.wordCounts[ax.neg] || 0;
    const pos = userData.wordCounts[ax.pos] || 0;
    const diff = pos - neg;
    const level = Math.max(0, Math.min(20, 20 + diff));
    const bar = "🌑".repeat(20 - level) + "🌱".repeat(level);
    const sign = diff >= 0 ? '+' : '';
    map += `${ax.neg.toUpperCase()} ${bar} ${ax.pos.toUpperCase()} (${sign}${diff})\n`;
  });
  showModal(map);
  speak("Карта роста показана.", "calm");
}

// === Словарь сердца ===
function showWords() {
  const words = Object.keys(userData.wordCounts)
    .sort((a, b) => userData.wordCounts[b] - userData.wordCounts[a])
    .map(w => `${w} • (${userData.wordCounts[w]})`)
    .join('\n') || "Пока пусто";
  showModal(`📖 Словарь твоего сердца:\n${words}`);
  speak("Словарь сердца показан.", "calm");
}

// === Сад ===
function showGarden() {
  const hereCount = userData.dailyPresence.length;
  const flowers = "🌼".repeat(Math.max(1, Math.floor(hereCount / 3)));
  const message = hereCount < 3
    ? "Семя ещё в земле. Оно растёт."
    : "Ты уже не садишь. Ты — сад.";
  showModal(`🌷 Твой внутренний сад:\n${flowers}\n${message}`);
  speak("Твой внутренний сад показан.", "calm");
}

// === Прозрение ===
function showInsight() {
  const insight = "Ты уже не идёшь сквозь туман. Ты — свет.";
  showModal(`✨ ${insight}`);
  speak(insight, "calm");
}

// === Погода внутри ===
function showWeather() {
  const totalWords = Object.values(userData.wordCounts).reduce((a, b) => a + b, 0);
  let weather, symbol, advice;

  if (totalWords > 20) {
    weather = "лето присутствия"; symbol = "☀️";
    advice = "Ты здесь. Это уже свет.";
  } else if (totalWords > 10) {
    weather = "весна пробуждения"; symbol = "🌱";
    advice = "Ты снова растёшь. Пусть слова будут семенами.";
  } else if (totalWords > 3) {
    weather = "осень тишины"; symbol = "🍂";
    advice = "Ты собираешь то, что выросло. Не торопись.";
  } else {
    weather = "зима корней"; symbol = "❄️";
    advice = "Ты не растёшь. Ты — основа.";
  }

  const message = `${symbol} Сегодня в тебе: ${weather}. ${advice}`;
  showModal(message);
  speak(advice, "calm");
}

// === Поддержка ===
function showDonate() {
  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); color: #aaa; display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif;
  `;
  modal.innerHTML = `
    <div style="background: #111; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center;">
      <h3>🌱 Поддержать Becoming</h3>
      <p>
        Если это приложение помогло тебе быть здесь —  
        ты можешь поддержать его существование.
      </p>
      <p style="font-size: 0.9em; color: #777;">
        Это добровольно.  
        Не обязан. Просто если хочешь.
      </p>
      <div style="margin: 20px 0;">
        <a href="${DONATE.boosty}" target="_blank" style="color: #4CAF50; text-decoration: none;">
          💚 Поддержать на Boosty
        </a><br><br>
        <a href="${DONATE.kofi}" target="_blank" style="color: #00A0C6; text-decoration: none;">
          💙 Поддержать на Ko-fi
        </a>
      </div>
      <button class="close-modal" 
              style="background: #333; border: none; padding: 8px 16px; border-radius: 6px; color: #ccc; cursor: pointer;">
        Закрыть
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// === Модальное окно (динамическое) ===
function showModal(message, type = null) {
  if (document.querySelector('.becoming-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85); color: #eee; display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif; font-size: 16px;
    animation: fadeIn 0.3s ease-out;
  `;

  let buttons = `
    <button class="close-modal" style="background: #333; color: #ccc; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
      Закрыть
    </button>
  `;

  if (type === "rain") {
    buttons = `
      <button class="pause-audio" style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        ⏸️ Пауза
      </button>
      <button class="close-modal" style="background: #333; color: #ccc; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        Закрыть
      </button>
    `;
  }

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 24px; border-radius: 12px; max-width: 400px; text-align: center;">
      <p style="white-space: pre-line; margin: 0 0 16px; line-height: 1.5;">${message}</p>
      <div style="display: flex; justify-content: center; gap: 10px;">
        ${buttons}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (type === "rain") {
    modal.querySelector('.pause-audio').addEventListener('click', () => {
      pauseNature();
      closeModal();
    });
  }
}

// === Экспорт данных (закомментирован) ===
/*
function exportData() {
  const dataStr = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `becoming-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}
*/

// === Импорт данных (закомментирован) ===
/*
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        Object.assign(userData, imported);
        saveData();
        showModal("✅ Данные восстановлены.");
      } catch (err) {
        showModal("⚠️ Ошибка чтения файла.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
*/

// === Тема (тёмный режим) ===
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === Вспомогательные функции ===
function logWord(word) {
  userData.wordCounts[word] = (userData.wordCounts[word] || 0) + 1;
}

// === Присутствие: отметить день ===
function markPresence() {
  const today = new Date().toDateString();
  if (!userData.dailyPresence.includes(today)) {
    userData.dailyPresence.push(today);
    logWord("здесь");
    saveData();
    showModal("✅ Ты был. Это уже присутствие.");
    speak("Ты был. Это уже присутствие.", "soft");
    updateUI();
  } else {
    showModal("🌱 Ты уже отметил это присутствие.");
  }
}

// === Дневник ===
function writeJournal() {
  const entry = prompt("Запиши сегодняшнее переживание, мысль, чувства:");
  if (entry?.trim()) {
    userData.journal.push({
      text: entry.trim(),
      date: new Date().toISOString()
    });
    saveData();
    showModal("📖 Запись добавлена в дневник.");
    speak("Запись добавлена.", "soft");
  }
}

function readJournal() {
  if (userData.journal.length === 0) {
    showModal("📖 Дневник пока пуст.");
    return;
  }
  const list = userData.journal
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => {
      const date = new Date(e.date).toLocaleDateString('ru-RU');
      return `${date}:\n"${e.text}"`;
    }).join("\n\n");
  showModal(`📖 Твой дневник:\n\n${list}`);
}

// === Утренний ритуал ===
function morningRitual() {
  const words = prompt("Три слова, с которыми ты начинаешь день:");
  if (words?.trim()) {
    userData.rituals.morning.push({
      words: words.trim(),
      date: new Date().toISOString()
    });
    words.trim().split(/\s+/).forEach(w => logWord(w));
    saveData();
    showModal("🌅 Утро начато. Пусть слова будут путеводными.");
    speak("Утро начато. Пусть слова будут путеводными.", "calm");
  }
}

// === Вечерний ритуал ===
function eveningRitual() {
  const word = prompt("Какое слово сегодняшнего вечера?");
  const thanks = prompt("За что ты благодарен сегодня?");
  if (word?.trim() || thanks?.trim()) {
    userData.rituals.evening.push({
      word: word?.trim() || "—",
      thanks: thanks?.trim() || "—",
      date: new Date().toISOString()
    });
    if (word) logWord(word.trim().toLowerCase());
    saveData();
    showModal("🌙 День завершён. Ты не просто прожил — ты был.");
    speak("День завершён. Ты не просто прожил — ты был.", "soft");
  }
}

// === Обновление UI ===
function updateUI() {
  renderYearMap();
  const count = userData.dailyPresence.length;
  const counter = document.getElementById('presence-count');
  if (counter) counter.textContent = count;

  const mapStatus = document.getElementById('day-map-status');
  if (mapStatus) {
    mapStatus.textContent = count === 0
      ? "🗺 Карта дня: пока пуста\nОтметь момент — и она оживёт."
      : `✅ Ты был с собой ${count} дней.\nТы здесь. Это уже начало.`;
  }
}

// === Карта года ===
function renderYearMap() {
  const container = document.getElementById('year-map');
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `<div class="legend">
    <span>🟩 Присутствие</span>
    <span>🟨 Усталость</span>
    <span>🟥 Боль</span>
    <span>🔵 Сон</span>
    <span>⚪ Пропущен</span>
  </div><br>`;

  html += `<div class="month">${year}-${String(month + 1).padStart(2, '0')}:</div>`;
  html += '<div class="calendar">';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day).toDateString();
    const isPresent = userData.dailyPresence.includes(date);
    const emoji = isPresent ? "🟩" : "⚪";
    html += `<span class="day" title="${date}">${emoji}</span>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// === Загрузка интерфейса ===
document.addEventListener('DOMContentLoaded', () => {
  const time = getTimeOfDay();
  const word = getDailyWord();
  const greeting = document.querySelector('.greeting');
  if (greeting) {
    greeting.innerHTML = `${time.emoji} ${time.name}<br>Ты здесь. Это уже победа.<br><span class="daily-word">🌱 Слово дня: ${word}</span>`;
    speak(`${time.name}. Ты здесь. Это уже победа. Слово дня: ${word}`, "soft");
  }

  const savedTheme = localStorage.getItem('theme');
  const isNight = time.key === 'night' || time.key === 'evening';
  const shouldAutoDark = savedTheme === 'dark' || (!savedTheme && isNight);
  document.body.classList.toggle('dark', shouldAutoDark);

  updateUI();
});
