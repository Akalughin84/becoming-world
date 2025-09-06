// app.js — Becoming v1.3
// 🌱 Создано Алексей Калугин, 2025
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
  version: 1.3,
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
  },
  isSoundEnabled: true
};

// === Глобальное состояние календаря ===
let currentCalendarDate = new Date();

function supportsStorage() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// === Загрузка/сохранение ===
function loadData() {
  try {
    if (!supportsStorage()) return;
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
  if (!supportsStorage()) return;
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

function updateSoundUI() {
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.textContent = userData.isSoundEnabled ? '🔊' : '🔇';
    btn.title = userData.isSoundEnabled ? 'Выключить звук' : 'Включить звук';
  }
}

function toggleSound() {
  userData.isSoundEnabled = !userData.isSoundEnabled;
  saveData();
  updateSoundUI(); // Обновит иконку
  showModal(
    userData.isSoundEnabled 
      ? "🔊 Звук включён. Природа и голосовые подсказки активны." 
      : "🔇 Звук выключен. Тишина — тоже присутствие."
  );
}

// === Голос: Web Speech API ===
function speak(text, emotion = "calm") {
  if (!userData.isSoundEnabled || !window.speechSynthesis || !text || text.trim() === "") return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';

  // Настройка интонации
  if (emotion === "soft") {
    utterance.rate = 0.7;
    utterance.pitch = 0.6;
  } else if (emotion === "urgent") {
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
  } else if (emotion === "calm") {
    utterance.rate = 0.8;
    utterance.pitch = 0.7;
  }

  // Используем предпочтительный голос
  if (preferredVoice) {
    utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => {
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    }, 500);
  }
}

// === Слово дня ===
function getDailyWord() {
  const today = new Date().toDateString().split('T')[0];
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
  updateGrowthStatus();
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
  updateGrowthStatus();
}

// === Перечитать сны ===
function readDreams() {
  if (userData.dreams.length === 0) {
    showModal("🌌 Пока нет записанных снов.");
    return;
  }

  const list = userData.dreams
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(dream => {
      const date = new Date(dream.timestamp).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${date}:\n"${dream.text}"`;
    })
    .join("\n\n");

  showModal(`🌌 Твои сны:\n\n${list}`);
}

// === Просто быть (с ритуалом тишины) ===
function logSilence() {
  if (window.silenceTimer) {
    showModal("🕯 Тишина уже идёт. Заверши её перед началом новой.");
    return;
  }

  userData.silenceMoments.push(new Date().toISOString());
  logWord("покой");
  saveData();

  showModal("🕯 Ритуал тишины начался.\n3 минуты для тебя.", "silence");

  if (!currentAudio) {
    playNature('rain');
  }

  window.silenceTimer = setTimeout(() => {
    delete window.silenceTimer;
    showModal("🕯 Ты был. Это уже победа.\nТы не делал. Ты просто был.");
    speak("Ты был. Это уже победа.", "soft");

    setTimeout(() => {
      try {
        const bell = new Audio('sounds/bell.mp3');
        bell.volume = 0.4;
        bell.play().catch(() => {});
      } catch (e) {
        console.warn("Не удалось воспроизвести звон.");
      }
    }, 2000);
  }, 3 * 60 * 1000);
  updateGrowthStatus();
}

// === Прервать тишину ===
function cancelSilence() {
  if (!window.silenceTimer) {
    showModal("🕯 Тишина не идёт.");
    return;
  }

  clearTimeout(window.silenceTimer);
  delete window.silenceTimer;

  showModal("🕯 Ты вышел из тишины. Это тоже выбор.");
  speak("Ты вышел из тишины. Это тоже выбор.", "soft");
}

// === Природа ===
let currentAudio = null;
let currentSound = null;

function playNature(sound) {
  if (!userData.isSoundEnabled) {
    showModal("🔇 Звук выключен. Включи его в настройках.");
    return;
  }
  
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

// === Карта роста (персонализированная) ===
function showMap() {
  let map = `🌱 Карта твоего пути
`;

  GROWTH_AXES.forEach(ax => {
    const neg = userData.wordCounts[ax.neg] || 0;
    const pos = userData.wordCounts[ax.pos] || 0;
    const total = neg + pos;
    let percentage = total === 0 ? 50 : Math.round((pos / total) * 100);
    const barLength = 20;
    const filled = Math.round(barLength * (percentage / 100));

    const bar = "▫️".repeat(barLength - filled) + "🟩".repeat(filled);

    let status = "в равновесии";
    if (percentage > 70) status = "в силе";
    else if (percentage > 60) status = "преобладает";
    else if (percentage < 30) status = "в тени";
    else if (percentage < 40) status = "ослаблено";

    map += `
${ax.label}
${ax.neg.toUpperCase()} → ${bar} ← ${ax.pos.toUpperCase()}
(${neg} : ${pos}) — ${status}
`;
  });

  showModal(map);
  speak("Карта твоего пути обновлена.", "calm");
}

// === Сад (растёт от слов присутствия) ===
function updateGrowthStatus() {
  // === Сад ===
  const hereCount = ["здесь", "сейчас", "есть", "чувствую"].reduce(
    (sum, w) => sum + (userData.wordCounts[w] || 0), 0
  );
  const gardenStatus = document.getElementById('garden-status');
  if (gardenStatus) {
    if (hereCount < 2) {
      gardenStatus.textContent = "Семя ещё в земле. Оно растёт.";
    } else if (hereCount < 5) {
      gardenStatus.textContent = "Первые ростки. Ты уже не только садишь.";
    } else if (hereCount < 10) {
      gardenStatus.textContent = "Ты уже не садишь. Ты — сад.";
    } else {
      gardenStatus.textContent = "Ты — не сад. Ты — сезон.";
    }
  }

  // === Словарь сердца ===
  const wordsCount = Object.keys(userData.wordCounts).length;
  const wordsStatus = document.getElementById('words-status');
  if (wordsStatus) {
    if (wordsCount === 0) {
      wordsStatus.textContent = "Пока тишина. Это тоже начало.";
    } else if (wordsCount < 3) {
      wordsStatus.textContent = `Ты уже сказал ${wordsCount} слов.`;
    } else if (wordsCount < 6) {
      wordsStatus.textContent = `Ты уже сказал ${wordsCount} слов. Ты слышишь себя.`;
    } else {
      wordsStatus.textContent = `Ты уже сказал ${wordsCount} слов. Твой язык — живой.`;
    }
  }

  // === Прозрение ===
  const insightStatus = document.getElementById('insight-status');
  if (insightStatus) {
    const insight = generateInsightSnippet();
    insightStatus.textContent = generateInsightSnippet();
  }

  // === Предпросмотр карты роста ===
  const mapPreview = document.getElementById('map-preview');
  if (mapPreview) {
    const axes = GROWTH_AXES.map(ax => {
      const neg = userData.wordCounts[ax.neg] || 0;
      const pos = userData.wordCounts[ax.pos] || 0;
      const diff = pos - neg;
      if (diff > 2) return ax.label;
      if (diff < -2) return `тень ${ax.label}`;
      return null;
    }).filter(Boolean).slice(0, 2).join(", ") || "в движении";

    mapPreview.textContent = `Ты в ${axes}.`;
  }
}

// === Краткие прозрения для статуса ===
function generateInsightSnippet() {
  const words = userData.wordCounts;
  if (words["здесь"] > 5) return "Ты уже не ищешь. Ты — здесь.";
  if (words["покой"] > 3) return "Ты больше не бежишь. Ты — покой.";
  if (words["связь"] > 2) return "Ты не один. Ты — связь.";
  if (words["вера"] > words["страх"]) return "Ты уже не боишься. Ты — вера.";
  return "Что-то уже меняется...";
}


// === Погода внутри (на основе баланса слов) ===
function showWeather() {
  const words = userData.wordCounts;
  const light = (words["здесь"] || 0) + (words["покой"] || 0) + (words["связь"] || 0);
  const shadow = (words["страх"] || 0) + (words["устал"] || 0) + (words["не знаю"] || 0);
  const silence = (words["тишина"] || 0) + (words["сон"] || 0);

  let weather, symbol, advice;

  if (light > shadow * 2) {
    weather = "ясно"; symbol = "☀️";
    advice = "Ты светишь. Это уже погода.";
  } else if (light > shadow) {
    weather = "переменно"; symbol = "🌤️";
    advice = "Ты уже не в тумане. Ты — в движении.";
  } else if (shadow > light) {
    weather = "буря"; symbol = "⛈️";
    advice = "Ты в буре. Но ты — не она. Ты — тот, кто чувствует.";
  } else if (silence > 3) {
    weather = "туман"; symbol = "🌫️";
    advice = "Ты молчишь. Это не пустота. Это наполнение.";
  } else {
    weather = "корни"; symbol = "🌱";
    advice = "Ты не растёшь. Ты — корни. Это важно.";
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

  if (type === "rain" || type === "silence") {
    buttons = `
      <button class="pause-audio" style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        ⏸️ Пауза
      </button>
      <button class="cancel-silence" style="background: #ff9800; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        🛑 Прервать
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

  if (type === "silence") {
    modal.querySelector('.pause-audio').addEventListener('click', () => {
      pauseNature();
    });
    modal.querySelector('.cancel-silence').addEventListener('click', () => {
      cancelSilence();
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
  const key = word.toLowerCase().trim().replace(/[^\wа-яё]/g, '');
  userData.wordCounts[key] = (userData.wordCounts[key] || 0) + 1;
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
  updateGrowthStatus();
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
  updateGrowthStatus();
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

// === О приложении ===
function showAbout() {
  const aboutText = `🌱 Becoming — пространство для возвращения к себе.

Здесь ты можешь:
  • ✉️ Написать письмо себе — через год, через жизнь
  • 🌌 Рассказать сон, который помнишь
  • 🍃 Произнести слово, которое растёт: "здесь", "верь", "дышать"
  • 🌷 Увидеть, как твой внутренний сад отвечает на "я был"
  • 🌙 Отметить 3 минуты тишины — без дела, без смысла
  • 🌿 Простить — себе, другому, прошлому

Здесь нет:
  • Уведомлений
  • Рейтингов
  • "Должен"
  • Сравнений

Есть только ты.
И возможность сказать: 
"Я здесь. 
Это уже победа."

Создано с заботой — Алексей Калугин, 2025`;

  showModal(aboutText);
}

// === Пересмотреть день (по дате) ===
function reviewDay() {
  const dateStr = prompt("Введите дату (напр. 12.05.2025):");
  if (!dateStr) return;

  const parts = dateStr.split('.');
  if (parts.length !== 3) {
    showModal("⚠️ Неверный формат. Используй ДД.ММ.ГГГГ");
    return;
  }
  const [day, month, year] = parts.map(Number);
  const targetDate = new Date(year, month - 1, day);
  if (isNaN(targetDate.getTime())) {
    showModal("⚠️ Неверная дата.");
    return;
  }

  const target = targetDate.toDateString();

  const journalEntries = userData.journal.filter(e => new Date(e.date).toDateString() === target);
  const dreams = userData.dreams.filter(e => new Date(e.timestamp).toDateString() === target);
  const rituals = [
    ...userData.rituals.morning.filter(r => new Date(r.date).toDateString() === target),
    ...userData.rituals.evening.filter(r => new Date(r.date).toDateString() === target)
  ];
  const presence = userData.dailyPresence.includes(target);

  let content = `📅 ${day}.${month}.${year}\n\n`;
  if (presence) content += "✅ Отметил присутствие\n\n";
  if (journalEntries.length > 0) {
    content += "📖 Дневник:\n";
    journalEntries.forEach(e => {
      const time = new Date(e.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      content += `  ${time}: "${e.text}"\n`;
    });
    content += "\n";
  }
  if (dreams.length > 0) {
    content += "🌌 Сны:\n";
    dreams.forEach(d => {
      const time = new Date(d.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      content += `  ${time}: "${d.text}"\n`;
    });
    content += "\n";
  }
  if (rituals.length > 0) {
    content += "🌅🌙 Ритуалы:\n";
    rituals.forEach(r => {
      const time = new Date(r.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      if (r.words) content += `  ${time} (утро): ${r.words}\n`;
      if (r.word) content += `  ${time} (вечер): "${r.word}", благодарность: "${r.thanks}"\n`;
    });
    content += "\n";
  }
  if (content === `📅 ${day}.${month}.${year}\n\n`) {
    content += "День пуст. Но ты был — и это уже важно.";
  }

  showModal(content);
}

// === Отрисовка визуального календаря ===
function renderCalendar() {
  const container = document.getElementById('calendar-grid');
  const monthYearLabel = document.getElementById('calendar-month-year');
  if (!container || !monthYearLabel) return;

  const date = currentCalendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  container.innerHTML = '';

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  dayNames.forEach(name => {
    const header = document.createElement('div');
    header.textContent = name;
    header.style.fontWeight = '600';
    header.style.color = '#666';
    header.style.textAlign = 'center';
    container.appendChild(header);
  });

  for (let i = 0; i < startingDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    container.appendChild(empty);
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    const dayStr = dayDate.toDateString();

    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = day;

    if (dayDate.toDateString() === today.toDateString()) {
      cell.classList.add('today');
    }

    const hasJournal = userData.journal.some(e => new Date(e.date).toDateString() === dayStr);
    const hasDream = userData.dreams.some(e => new Date(e.timestamp).toDateString() === dayStr);
    const hasMorning = userData.rituals.morning.some(r => new Date(r.date).toDateString() === dayStr);
    const hasEvening = userData.rituals.evening.some(r => new Date(r.date).toDateString() === dayStr);
    const hasPresence = userData.dailyPresence.includes(dayStr);
    const hasSilence = userData.silenceMoments.some(t => new Date(t).toDateString() === dayStr);

    if (hasJournal) cell.classList.add('has-journal');
    if (hasDream) cell.classList.add('has-dream');
    if (hasMorning || hasEvening) cell.classList.add('has-ritual');
    if (hasPresence) cell.classList.add('has-presence');
    if (hasSilence) cell.classList.add('has-silence');

    cell.style.cursor = 'pointer';
    cell.title = 'Посмотреть день';
    cell.addEventListener('click', () => {
      const formatted = `${day.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
      reviewDayFromCalendar(formatted);
    });

    container.appendChild(cell);
  }
}

// === Смена месяца ===
function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

// === Просмотр дня (из календаря) ===
function reviewDayFromCalendar(dateStr) {
  const parts = dateStr.split('.');
  const [day, month, year] = parts.map(Number);
  const targetDate = new Date(year, month - 1, day);
  const target = targetDate.toDateString();

  let content = `📅 ${day}.${month}.${year}\n\n`;

  const presence = userData.dailyPresence.includes(target);
  if (presence) {
    content += "✅ Отметил присутствие\n\n";
  }

  const journal = userData.journal.filter(e => new Date(e.date).toDateString() === target);
  if (journal.length > 0) {
    content += "📖 Дневник:\n";
    journal.forEach(e => {
      const time = new Date(e.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      content += `  ${time}: "${e.text}"\n`;
    });
    content += "\n";
  }

  const dreams = userData.dreams.filter(e => new Date(e.timestamp).toDateString() === target);
  if (dreams.length > 0) {
    content += "🌌 Сны:\n";
    dreams.forEach(d => {
      const time = new Date(d.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      content += `  ${time}: "${d.text}"\n`;
    });
    content += "\n";
  }

  const rituals = [
    ...userData.rituals.morning.filter(r => new Date(r.date).toDateString() === target),
    ...userData.rituals.evening.filter(r => new Date(r.date).toDateString() === target)
  ];
  if (rituals.length > 0) {
    content += "🌅🌙 Ритуалы:\n";
    rituals.forEach(r => {
      const time = new Date(r.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      if (r.words) content += `  ${time} (утро): ${r.words}\n`;
      if (r.word) content += `  ${time} (вечер): "${r.word}", благодарность: "${r.thanks}"\n`;
    });
    content += "\n";
  }

  if (content === `📅 ${day}.${month}.${year}\n\n`) {
    content += "День пуст. Но ты был — и это уже важно.";
  }

  showModal(content);
}

// === Выбор приятного голоса ===
let preferredVoice = null;

function loadPreferredVoice() {
  if (!window.speechSynthesis) return;

  const voices = speechSynthesis.getVoices();

  // Ищем русский женский или мягкий голос
  preferredVoice = voices.find(voice => 
    voice.lang.startsWith('ru') && 
    (
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('женский') || 
      voice.name.toLowerCase().includes('alena') || 
      voice.name.toLowerCase().includes('alyss')
    )
  );

  // Если не нашли — любой русский
  if (!preferredVoice) {
    preferredVoice = voices.find(voice => voice.lang.startsWith('ru'));
  }

  // Если и нет русского — берём первый доступный
  if (!preferredVoice && voices.length > 0) {
    preferredVoice = voices[0];
  }
}

// Загружаем голоса после инициализации
if ('speechSynthesis' in window) {
  // В некоторых браузерах голоса появляются только после события
  window.speechSynthesis.getVoices();
  setTimeout(() => {
    window.speechSynthesis.getVoices(); // второй вызов для надёжности
    loadPreferredVoice();
  }, 100);
  setTimeout(loadPreferredVoice, 500); // подстраховка
}

// === Навигация между экранами ===
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // Найдём кнопку, связанную с экраном
  const navButton = document.querySelector(`[onclick="navigateTo('${screenId}')"]`);
  if (navButton) navButton.classList.add('active');
  // Если зашли на "рост" — обновим статус
  if (screenId === 'growth') {
    updateGrowthStatus();
  }
}

// === Обновление прозрения на главной ===
function getDailyInsight() {
  const words = userData.wordCounts;
  if (words["здесь"] > 5) return "Ты уже не ищешь. Ты — здесь.";
  if (words["покой"] > 3) return "Ты больше не бежишь. Ты — покой.";
  if (words["связь"] > 2) return "Ты не один. Ты — связь.";
  if (words["вера"] > words["страх"]) return "Ты уже не боишься. Ты — вера.";
  if (words["сон"] > 5) return "Ты молчишь. Это не пустота. Это наполнение.";
  return "Что-то уже меняется...";
}

function updateDailyInsight() {
  const insightEl = document.getElementById('daily-insight');
  if (insightEl) {
    const insight = getDailyInsight();
    insightEl.textContent = insight;
  }
}

// === Случайное присутствие (шёпот) ===
/*
function randomWhisper() {
  const whispers = [
    "Ты уже начал.",
    "Я помню тебя.",
    "Ты здесь. Это уже победа.",
    "Ты не один."
  ];
  if (Math.random() < 0.1) {
    const whisper = whispers[Math.floor(Math.random() * whispers.length)];
    showModal(`✨ ${whisper}`);
    speak(whisper, "soft");
  }
}

// Запускаем каждые 15 минут
setInterval(randomWhisper, 15 * 60 * 1000);
*/

// === Загрузка интерфейса ===
document.addEventListener('DOMContentLoaded', () => {
  const time = getTimeOfDay();
  const word = getDailyWord();
  const greeting = document.querySelector('.greeting');
  if (greeting) {
    const recentWords = Object.keys(userData.wordCounts)
      .filter(w => userData.wordCounts[w] > 0)
      .sort((a, b) => userData.wordCounts[b] - userData.wordCounts[a])
      .slice(0, 2)
      .join(", ");

    const personal = recentWords ? `Сегодня ты сказал: ${recentWords}.` : "Ты здесь. Это уже победа.";

    greeting.innerHTML = `${time.emoji} ${time.name}<br>Ты здесь. Это уже победа.<br><span class="daily-word">🌱 Слово дня: ${word}</span><br><small>${personal}</small>`;
    speak(`${time.name}. Ты здесь. Это уже победа. Слово дня: ${word}`, "soft");
  }

  const savedTheme = localStorage.getItem('theme');
  const isNight = time.key === 'night' || time.key === 'evening';
  const shouldAutoDark = savedTheme === 'dark' || (!savedTheme && isNight);
  document.body.classList.toggle('dark', shouldAutoDark);

  updateUI();
  renderCalendar(); // Запуск календаря
  updateSoundUI();
  navigateTo('home');         // Открываем главную
  updateDailyInsight();       // Обновляем прозрение
  updateGrowthStatus();
});
