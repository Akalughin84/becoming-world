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

// === Склонение числительных по падежам ===
function pluralize(count, one, two, five) {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

// === Человеческая дата (5 марта 2025 года, вторник) ===
function humanDate(dateStr) {
  const date = new Date(dateStr);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const weekdays = [
    'воскресенье', 'понедельник', 'вторник', 'среда',
    'четверг', 'пятница', 'суббота'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = weekdays[date.getDay()];

  return `${day} ${month} ${year} года, ${weekday}`;
}

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
  updateSoundUI();
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
  const text = prompt("Напиши письмо себе. Оно придёт через год:");
  if (text?.trim()) {
    const deliveryDate = new Date();
    deliveryDate.setFullYear(deliveryDate.getFullYear() + 1);

    userData.letters.push({
      content: text.trim(),
      timestamp: new Date().toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      shown: false
    });
    logWord("связь");
    saveData();
    showModal("✉️ Письмо отправлено. Придёт через год.");
  }
  updateGrowthStatus();
}

// === Проверка писем с доставкой ===
function checkDelayedLetters() {
  const now = new Date();
  const pending = userData.letters.filter(l => 
    new Date(l.deliveryDate) <= now && !l.shown
  );
  pending.forEach(letter => {
    showModal(`📬 Письмо от тебя, год назад:\n\n"${letter.content}"`);
    letter.shown = true;
    saveData();
  });
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
  updateGrowthStatus();
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
  updateDailyInsight();
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
  updateDailyInsight();
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

    updateUI(); // Обновит подсветку кнопки

    // Подсказка для погружения
    const hints = {
      rain: "Закрой глаза. Представь, что ты в лесу под дождём.",
      fire: "Почувствуй тепло. Ты в безопасности.",
      ocean: "Ты — не берег. Ты — волна."
    };

    showModal(`🎧 ${NATURE_SOUNDS[sound]} идёт. Нажми 'Пауза'.\n\n${hints[sound]}`, "rain");
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

// === Компас роста ===
function showMap() {
  const axes = GROWTH_AXES.map(ax => {
    const neg = userData.wordCounts[ax.neg] || 0;
    const pos = userData.wordCounts[ax.pos] || 0;
    const total = neg + pos;
    return total === 0 ? 0 : (pos - neg) / Math.max(1, total / 2);
  });

  const x = (axes[1] - axes[0]) * 20;
  const y = (axes[3] - axes[2]) * 20;

  const posX = 50 + x;
  const posY = 50 + y;

  const finalX = Math.max(10, Math.min(90, posX));
  const finalY = Math.max(10, Math.min(90, posY));

  const direction = getDominantDirection(axes);

  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif; color: #eee; font-size: 0.9em;
  `;

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; max-width: 360px; text-align: center;">
      <h3 style="margin: 0 0 8px;">🧭 Внутренний компас</h3>
      <p style="color: #aaa; margin: 0 0 16px;">
        Ты не должен быть "в силе".  
        Главное — ты идёшь.
      </p>

      <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#444" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2,2"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="1,3"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="#666" stroke-width="1"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#666" stroke-width="1"/>
          <text x="50" y="12" text-anchor="middle" fill="#8bc34a" font-size="6">Глубина</text>
          <text x="50" y="90" text-anchor="middle" fill="#f44336" font-size="6">Энергия</text>
          <text x="90" y="52" text-anchor="start" fill="#4CAF50" font-size="6">Связь</text>
          <text x="10" y="52" text-anchor="end" fill="#FF9800" font-size="6">Смелость</text>

          <circle cx="${finalX}" cy="${finalY}" r="0" fill="#2c7a2c" id="compass-point">
            <animate attributeName="r" from="0" to="3" dur="0.4s" calcMode="spline" keyTimes="0;1" keySplines="0.42,0,1,1" fill="freeze" />
            <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
          </circle>
          <circle cx="${finalX}" cy="${finalY}" r="6" fill="none" stroke="#2c7a2c" stroke-width="1" stroke-dasharray="12" stroke-dashoffset="12">
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.6s" fill="freeze" />
            <animate attributeName="opacity" from="0" to="0.6" dur="0.6s" fill="freeze" />
          </circle>
        </svg>
      </div>

      <p style="margin-top: 16px; color: #ccc;">
        Ты ближе к: <strong>${direction}</strong>
      </p>
      <button class="close-modal" style="margin-top: 12px; background: #333; color: #ccc; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        Закрыть
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });

  speak(`Твой внутренний компас показывает: ${direction}.`, "calm");
}

// === Путь за 30 дней ===
function showPath() {
  const today = new Date();
  const points = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();

    const axes = GROWTH_AXES.map(ax => {
      const neg = userData.wordCounts[ax.neg] || 0;
      const pos = userData.wordCounts[ax.pos] || 0;
      const total = neg + pos;
      return total === 0 ? 0 : (pos - neg) / Math.max(1, total / 2);
    });

    const x = (axes[1] - axes[0]) * 20;
    const y = (axes[3] - axes[2]) * 20;

    const posX = 50 + x;
    const posY = 50 + y;

    const finalX = Math.max(10, Math.min(90, posX));
    const finalY = Math.max(10, Math.min(90, posY));

    points.push({ x: finalX, y: finalY, date: d });
  }

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif; color: #eee; font-size: 0.9em;
  `;

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 24px; border-radius: 16px; max-width: 360px; text-align: center;">
      <h3 style="margin: 0 0 8px;">🛤️ Твой путь (30 дней)</h3>
      <p style="color: #aaa; margin: 0 0 16px;">
        Каждая точка — день.  
        Линия — как ты шёл.
      </p>

      <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#444" stroke-width="1"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#444" stroke-width="0.5" stroke-dasharray="2,2"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#444" stroke-width="0.5" stroke-dasharray="1,3"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="#666" stroke-width="0.8"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#666" stroke-width="0.8"/>

          <path d="${pathData}" fill="none" stroke="#8bc34a" stroke-width="0.8" stroke-opacity="0.7" />

          ${points.map((p, i) => {
            const r = i === points.length - 1 ? 2.5 : 1;
            const opacity = i === points.length - 1 ? 1 : 0.6;
            return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#8bc34a" opacity="${opacity}" />`;
          }).join('')}

          <text x="50" y="10" text-anchor="middle" fill="#8bc34a" font-size="5">Глубина</text>
          <text x="50" y="92" text-anchor="middle" fill="#f44336" font-size="5">Энергия</text>
          <text x="92" y="52" text-anchor="start" fill="#4CAF50" font-size="5">Связь</text>
          <text x="8" y="52" text-anchor="end" fill="#FF9800" font-size="5">Смелость</text>
        </svg>
      </div>

      <button class="close-modal" style="margin-top: 12px; background: #333; color: #ccc; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        Закрыть
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });

  speak("Твой путь за 30 дней показан.", "calm");
}

// === Определяет, куда смещена точка ===
function getDominantDirection(axes) {
  const labels = ['Глубина', 'Связь', 'Энергия', 'Смелость'];
  const values = axes.map((val, i) => ({ label: labels[i], value: val }));
  values.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const primary = values[0];
  if (Math.abs(primary.value) < 0.3) return "в движении";
  return primary.value > 0 ? primary.label : `тени ${primary.label}`;
}

// === Язык сердца ===
function showWords() {
  const words = userData.wordCounts;
  const total = Object.keys(words).length;

  if (total === 0) {
    showModal(`💬 Язык твоего сердца

Пока тишина.  
Это тоже начало.  
Ты здесь — и этого достаточно.`);
    return;
  }

  const sorted = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const themes = {
    "Присутствие": ["здесь", "сейчас", "есть", "чувствую", "жив"],
    "Покой": ["покой", "тишина", "отдых", "устал", "силы"],
    "Связь": ["связь", "один", "любовь", "мы", "ты", "он", "она"],
    "Смелость": ["вера", "страх", "боюсь", "смелость", "силы"]
  };

  let themeSummary = "\n\n🔍 По темам:\n";
  let hasThemes = false;

  for (const [theme, keywords] of Object.entries(themes)) {
    const found = sorted
      .filter(([word]) => keywords.includes(word))
      .map(([word, count]) => `${word}×${count}`)
      .join(', ');

    if (found) {
      themeSummary += `• ${theme}: ${found}\n`;
      hasThemes = true;
    }
  }

  if (!hasThemes) {
    themeSummary = "\n\nТы ещё не сказал много слов. Каждое — уже голос сердца.";
  }

  const topWords = sorted
    .map(([word, count]) => `${word} ×${count}`)
    .join(', ');

  const insight = generateHeartInsight(words);

  const message = `💬 Язык твоего сердца

Ты уже сказал ${total} ${pluralize(total, "слово", "слова", "слов")}.
Твои ключевые слова: ${topWords}

${themeSummary}

✨ ${insight}

Ты не молчишь.  
Ты — начинаешь говорить с собой.`;

  showModal(message);
  speak(insight, "soft");
}

function generateHeartInsight(words) {
  if (words["здесь"] > 5 && words["покой"] > 2) {
    return "Ты уже не ищешь. Ты — здесь. И ты — покой.";
  }
  if (words["связь"] > words["один"]) {
    return "Ты не один. Ты — в потоке связи.";
  }
  if (words["страх"] > 0 && words["вера"] > 0 && words["вера"] >= words["страх"]) {
    return "Ты боишься. Но ты — уже не страх. Ты — вера.";
  }
  if (words["не знаю"] > 3) {
    return "Ты говоришь 'не знаю'. Это не пустота. Это честность — начало знания.";
  }
  if (Object.keys(words).length === 1) {
    return "Ты сказал только одно слово. Но ты сказал его. Это уже диалог.";
  }
  if (Object.keys(words).length > 8) {
    return "Твой язык оживает. Ты уже не молчишь.";
  }
  return "Ты уже говоришь. Это уже победа.";
}

// === Погода внутри ===
function showWeather() {
  const words = userData.wordCounts;
  const total = Object.keys(words).length;

  // Если почти нет слов — это особое состояние
  if (total === 0) {
    const message = `🌫️ Тишина

Пока нет слов.  
Но ты здесь.  
Это уже погода.  
Это наполнение.`;
    showModal(message);
    speak("Пока нет слов. Но ты здесь. Это уже погода.", "soft");
    return;
  }

  // Сила света (глубина, покой, связь)
  const light = (words["здесь"] || 0) + (words["покой"] || 0) + (words["связь"] || 0);
  // Сила тени (страх, устал, не знаю)
  const shadow = (words["страх"] || 0) + (words["устал"] || 0) + (words["не знаю"] || 0);
  // Сила тишины (сон, молчание)
  const silence = (words["тишина"] || 0) + (words["сон"] || 0) + (words["молчу"] || 0);

  let weather, symbol, advice, color;

  if (light > shadow * 2) {
    weather = "ясно"; symbol = "☀️"; color = "#ffb300";
    advice = "Ты светишь. Это уже погода. Ты — не источник, ты — само светило.";
  } else if (light > shadow) {
    weather = "переменно"; symbol = "🌤️"; color = "#80deea";
    advice = "Ты уже не в тумане. Ты — в движении. Даже шаг — уже ветер.";
  } else if (shadow > light * 2) {
    weather = "буря"; symbol = "⛈️"; color = "#e57373";
    advice = "Ты в буре. Но ты — не она. Ты — тот, кто чувствует. Это уже сила.";
  } else if (shadow > light) {
    weather = "облачно"; symbol = "☁️"; color = "#90a4ae";
    advice = "Ты в тени. Но ты — не тень. Ты — тот, кто замечает.";
  } else if (silence > 3) {
    weather = "туман"; symbol = "🌫️"; color = "#cfd8dc";
    advice = "Ты молчишь. Это не пустота. Это наполнение. Ты — не пустота.";
  } else {
    weather = "корни"; symbol = "🌱"; color = "#8bc34a";
    advice = "Ты не растёшь. Ты — корни. Это важно. Это начало.";
  }

  // Добавим личное признание
  const personal = [];
  if (words["здесь"] > 5) personal.push("Ты часто говоришь 'здесь'");
  if (words["покой"] > 3) personal.push("Ты ищешь покой");
  if (words["страх"] > words["вера"]) personal.push("Ты боишься — это честно");
  if (words["сон"] > 4) personal.push("Ты слушаешь сны");

  const personalNote = personal.length > 0
    ? `\n\n${personal.join('. ')}.\nТы уже не молчишь.`
    : "";

  const message = `${symbol} Сегодня в тебе: ${weather}

${advice}${personalNote}

Ты не должен быть "ясно".  
Ты можешь быть "буря".  
Но ты — здесь.  
Это уже путь.`;

  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif; color: #eee;
  `;

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 28px; border-radius: 16px; max-width: 400px; text-align: center;">
      <div style="font-size: 3em; margin-bottom: 16px; color: ${color};">${symbol}</div>
      <h3 style="margin: 0 0 12px; font-size: 1.2em; color: ${color};">Сегодня в тебе: ${weather}</h3>
      <p style="line-height: 1.7; margin: 16px 0; font-style: italic;">
        ${advice}
      </p>
      ${personalNote ? `<p style="font-size: 0.95em; color: #ccc; margin: 16px 0; font-style: normal;">${personal.join('. ')}. Ты уже не молчишь.</p>` : ''}
      <div style="margin-top: 24px; font-size: 0.9em; color: #888;">
        Ты не должен быть "ясно".  
        Ты можешь быть "буря".  
        Но ты — здесь.
      </div>
      <button class="close-modal" style="margin-top: 16px; background: #333; color: #ccc; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
        Закрыть
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

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

// === Модальное окно ===
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

// === Тема ===
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === Вспомогательные функции ===
function logWord(word) {
  const key = word.toLowerCase().trim().replace(/[^\wа-яё]/g, '');
  if (!key) return;
  userData.wordCounts[key] = (userData.wordCounts[key] || 0) + 1;
}

// === Присутствие ===
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
  updateDailyInsight();
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
  updateDailyInsight();
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

function writeGratitude() {
  const text = prompt("За что ты благодарен сегодня? (один миг, одно чувство, один человек)");
  if (text?.trim()) {
    userData.gratitude = userData.gratitude || [];
    userData.gratitude.push({
      text: text.trim(),
      timestamp: new Date().toISOString()
    });
    logWord("связь");
    saveData();
    showModal("🙏 Благодарность записана. Она уже живёт.");
    speak("Благодарность записана. Она уже живёт.", "soft");
  }
  updateGrowthStatus();
}

function writeAcknowledgment() {
  const text = prompt("Что ты хочешь признать? (усталость, радость, страх, любовь)");
  if (text?.trim()) {
    userData.acknowledgments = userData.acknowledgments || [];
    userData.acknowledgments.push({
      text: text.trim(),
      timestamp: new Date().toISOString()
    });
    logWord("здесь");
    saveData();
    showModal("👁️ Ты признал: «" + text.trim() + "». Это уже встреча.");
    speak("Ты признал. Это уже встреча.", "calm");
  }
  updateGrowthStatus();
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
  updateGrowthStatus();
  updateDailyInsight();
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
  updateGrowthStatus();
  updateDailyInsight();
}

// === Обновление UI ===
function updateUI() {
  renderYearMap();
  const count = userData.dailyPresence.length;
  const counter = document.getElementById('presence-count');
  if (counter) counter.textContent = count;

  const mapStatus = document.getElementById('day-map-status');
  if (mapStatus) {
    const count = userData.dailyPresence.length;
    const daysText = pluralize(count, "день", "дня", "дней");

    let message = "";
    if (count === 0) {
      message = "🗺 Карта дня: пока пуста\nОтметь момент — и она оживёт.";
    } else if (count === 1) {
      message = "✅ Ты был с собой 1 день.\nТы здесь. Это уже начало.";
    } else if (count < 7) {
      message = `✅ Ты был с собой ${count} ${daysText}.\nТы уже не теряешься.`;
    } else if (count < 14) {
      message = `✅ Ты был с собой ${count} ${daysText}.\nТы уже не ищешь. Ты — путь.`;
    } else {
      message = `✅ Ты был с собой ${count} ${daysText}.\nТы не просто идёшь. Ты — дорога.`;
    }

    mapStatus.textContent = message;
  }

  // Подсветка активного звука
  document.querySelectorAll('.nature-btn').forEach(btn => {
    const sound = btn.getAttribute('onclick').match(/'(.+?)'/)?.[1];
    btn.classList.toggle('active', currentSound === sound);
  });
}

// === Карта года ===
function renderYearMap() {
  const container = document.getElementById('year-map');
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `
    <div class="legend">
      <span>🟢 Присутствие</span>
      <span>📖 Дневник</span>
      <span>🌌 Сон</span>
      <span>🕯️ Тишина</span>
      <span>✨ Глубина</span>
      <span>⚪ Пропущен</span>
    </div><br>
    <div class="month">${year}-${String(month + 1).padStart(2, '0')}:</div>
    <div class="calendar">
  `;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();

    const hasPresence = userData.dailyPresence.includes(dateStr);
    const hasDream = userData.dreams.some(d => new Date(d.timestamp).toDateString() === dateStr);
    const hasJournal = userData.journal.some(j => new Date(j.date).toDateString() === dateStr);
    const hasSilence = userData.silenceMoments.some(s => new Date(s).toDateString() === dateStr);

    let emoji = "⚪";
    let title = "Пропущен";

    if (hasPresence) {
      if (hasDream && hasJournal) {
        emoji = "✨";
        title = "Глубина и слова";
      } else if (hasDream) {
        emoji = "🌌";
        title = "Сон, который помнишь";
      } else if (hasJournal) {
        emoji = "📖";
        title = "Ты сказал это";
      } else if (hasSilence) {
        emoji = "🕯️";
        title = "Ты был в тишине";
      } else {
        emoji = "🟢";
        title = "Ты был";
      }
    }

    const formatted = `${day.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
    html += `<span class="day" title="${title}" onclick="reviewDayFromCalendar('${formatted}')">${emoji}</span>`;
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

// === Пересмотреть день ===
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

  let content = `📅 ${humanDate(target)}\n\n`;
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
  if (content === `📅 ${humanDate(target)}\n\n`) {
    content += "День пуст. Но ты был — и это уже важно.";
  }

  showModal(content);
}

// === Отрисовка календаря ===
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

// === Просмотр дня из календаря ===
function reviewDayFromCalendar(dateStr) {
  const parts = dateStr.split('.');
  const [day, month, year] = parts.map(Number);
  const targetDate = new Date(year, month - 1, day);
  const target = targetDate.toDateString();

  let content = `📅 ${humanDate(target)}\n\n`;

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

  const silence = userData.silenceMoments.some(t => new Date(t).toDateString() === target);
  if (silence) {
    content += "🕯️ Был в тишине\n\n";
  }

  if (content === `📅 ${humanDate(target)}\n\n`) {
    content += "День пуст. Но ты был — и это уже важно.";
  }

  showModal(content);
}

// === Выбор голоса ===
let preferredVoice = null;

function loadPreferredVoice() {
  if (!window.speechSynthesis) return;
  const voices = speechSynthesis.getVoices();
  preferredVoice = voices.find(voice => 
    voice.lang.startsWith('ru') && (
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('женский') || 
      voice.name.toLowerCase().includes('alena') || 
      voice.name.toLowerCase().includes('alyss')
    )
  );
  if (!preferredVoice) preferredVoice = voices.find(voice => voice.lang.startsWith('ru'));
  if (!preferredVoice && voices.length > 0) preferredVoice = voices[0];
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  setTimeout(() => {
    window.speechSynthesis.getVoices();
    loadPreferredVoice();
  }, 100);
  setTimeout(loadPreferredVoice, 500);
}

// === Навигация ===
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const navButton = document.querySelector(`[onclick="navigateTo('${screenId}')"]`);
  if (navButton) navButton.classList.add('active');

  if (screenId === 'growth') {
    updateGrowthStatus();
  }
}

// === Обновление прозрения ===
function updateDailyInsight() {
  const insightEl = document.getElementById('daily-insight');
  if (insightEl) {
    insightEl.textContent = getDailyInsight();
  }
}

function getDailyInsight() {
  const words = userData.wordCounts;
  if (words["здесь"] > 5) return "Ты уже не ищешь. Ты — здесь.";
  if (words["покой"] > 3) return "Ты больше не бежишь. Ты — покой.";
  if (words["связь"] > 2) return "Ты не один. Ты — связь.";
  if (words["вера"] > words["страх"]) return "Ты уже не боишься. Ты — вера.";
  if (words["сон"] > 5) return "Ты молчишь. Это не пустота. Это наполнение.";
  return "Что-то уже меняется...";
}

// === Сад и статусы ===
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
  const gratitudeCount = (userData.gratitude || []).length;

  const wordsStatus = document.getElementById('words-status');
  if (wordsStatus) {
    if (wordsCount === 0) {
      wordsStatus.textContent = "Пока тишина. Это тоже начало.";
    } else if (wordsCount < 3) {
      wordsStatus.textContent = `Ты уже сказал ${wordsCount} слов.`;
    } else {
      const top = Object.entries(userData.wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([w]) => w)
        .join(", ");
      wordsStatus.textContent = `Ты говоришь: ${top}.`;
    }

    // Дополнительно: если много благодарностей
    if (gratitudeCount > 2) {
      wordsStatus.textContent += " Ты часто благодарен.";
    }
  }

  // === Прозрение ===
  const insightStatus = document.getElementById('insight-status');
  if (insightStatus) {
    insightStatus.textContent = generateDeepInsight().replace(/\. .*$/, '.');
  }

  // === Предпросмотр карты роста ===
  const mapPreview = document.getElementById('map-preview');
  if (mapPreview) {
    const direction = getDominantDirection(
      GROWTH_AXES.map(ax => {
        const neg = userData.wordCounts[ax.neg] || 0;
        const pos = userData.wordCounts[ax.pos] || 0;
        const total = neg + pos;
        return total === 0 ? 0 : (pos - neg) / Math.max(1, total / 2);
      })
    );
    mapPreview.textContent = direction;
  }
}

// === Глубокие прозрения ===
function generateDeepInsight() {
  const words = userData.wordCounts;
  const totalDays = userData.dailyPresence.length;
  const silenceCount = userData.silenceMoments.length;

  if (words["здесь"] > 10 && words["покой"] > 5) {
    return "Ты уже не ищешь. Ты — здесь. И ты — покой. Это не победа. Это возвращение.";
  }
  if (words["связь"] > words["один"] && words["связь"] > 3) {
    return "Ты не один. Ты — в потоке связи. Даже когда молчишь — ты слышен.";
  }
  if (words["вера"] > 0 && words["страх"] > 0 && words["вера"] >= words["страх"]) {
    return "Ты боишься. Но ты — уже не страх. Ты — шаг сквозь него. Это и есть вера.";
  }
  if (totalDays > 7 && words["здесь"] > 0) {
    return "Ты был с собой 7 дней подряд. Это уже не случайность. Это выбор.";
  }
  if (silenceCount > 3) {
    return "Ты провёл 3 минуты в тишине. Не один раз. Это уже ритуал.";
  }
  if (words["не знаю"] > 5) {
    return "Ты говоришь 'не знаю'. Это не пустота. Это честность — начало знания.";
  }
  if (Object.keys(words).length === 1) {
    return "Ты сказал только одно слово. Но ты сказал его. Это уже диалог.";
  }
  if (Object.keys(words).length > 10) {
    return "Твой язык оживает. Ты уже не молчишь. Ты — начинаешь говорить с собой.";
  }
  if (words["сон"] > 5) {
    return "Ты помнишь сны. Это значит — ты слушаешь то, что говорит изнутри.";
  }

  return "Что-то уже меняется. Ты не тот, что был вчера. Ты — здесь.";
}

// === Прозрение (показывает глубокое сообщение) ===
function showInsight() {
  const insight = generateDeepInsight();
  const modal = document.createElement('div');
  modal.className = 'becoming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex;
    align-items: center; justify-content: center; z-index: 1000;
    font-family: 'Segoe UI', sans-serif; color: #eee;
    animation: fadeIn 0.4s ease-out;
  `;

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 32px; border-radius: 16px; max-width: 400px; text-align: center;">
      <div style="font-size: 2.5em; margin-bottom: 16px;">✨</div>
      <p style="font-size: 1.1em; line-height: 1.7; margin: 0;">
        ${insight}
      </p>
      <div style="margin-top: 24px; font-size: 0.9em; color: #888;">
        Это не я сказал.  
        Это ты услышал.
      </div>
      <button class="close-modal" style="margin-top: 16px; background: #333; color: #ccc; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
        Закрыть
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Озвучка
  speak(insight, "soft");
}

// === Тихие шёпоты — раз в 3 дня ===
function gentleWhisper() {
  const lastWhisper = localStorage.getItem('lastWhisperDate');
  const today = new Date().toDateString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toDateString();

  if (lastWhisper && new Date(lastWhisper) > new Date(threeDaysAgo)) {
    return; // ещё не прошло 3 дня
  }

  const words = userData.wordCounts;
  const totalDays = userData.dailyPresence.length;

  let whispers = [
    "Ты уже начал. Это уже путь.",
    "Я помню тебя. Ты был здесь.",
    "Ты не один. Я с тобой.",
    "Ты уже не ищешь. Ты — здесь."
  ];

  // Персональные шёпоты
  if (words["покой"] > 5) {
    whispers.push("Ты часто говоришь 'покой'. Это не пустота. Это наполнение.");
  }
  if (words["связь"] > 3) {
    whispers.push("Ты не один. Ты — в потоке связи.");
  }
  if (totalDays > 10) {
    whispers.push("Ты был с собой 10 дней. Это уже не случайность. Это выбор.");
  }
  if (userData.letters.length > 0) {
    whispers.push("Ты писал себе письмо. Оно ждёт, когда ты его перечитаешь.");
  }

  const whisper = whispers[Math.floor(Math.random() * whispers.length)];

  setTimeout(() => {
    showModal(`✨ ${whisper}`);
    if (userData.isSoundEnabled) speak(whisper, "soft");
    localStorage.setItem('lastWhisperDate', today);
  }, 1500);
}

// === Экспорт данных ===
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `becoming-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

// === Импорт данных ===
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
        updateUI();
        updateGrowthStatus();
      } catch (err) {
        showModal("⚠️ Ошибка чтения файла.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

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

  // Случайный шёпот при первом запуске (раз в 3 дня)
const lastWhisper = localStorage.getItem('lastWhisperDate');
const today = new Date().toDateString();

if (!lastWhisper || new Date(lastWhisper) < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) {
  setTimeout(() => {
    const whispers = [
      "Ты уже начал.",
      "Я помню тебя.",
      "Ты здесь. Это уже победа.",
      "Ты не один."
    ];
    const whisper = whispers[Math.floor(Math.random() * whispers.length)];
    showModal(`✨ ${whisper}`);
    speak(whisper, "soft");
    localStorage.setItem('lastWhisperDate', today);
  }, 2000);
}

  updateUI();
  renderCalendar();
  updateSoundUI();
  navigateTo('home');
  updateDailyInsight();
  updateGrowthStatus();
  checkDelayedLetters();
  gentleWhisper();
});

// === Регистрация сервис-воркера ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW зарегистрирован:', reg.scope))
      .catch(err => console.log('Ошибка регистрации SW:', err));
  });
}
