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

const DAILY_WORDS = ["Дыши", "Ты здесь", "Это достаточно", "Иди", "Верь", "Будь"];

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
  silenceMoments: []
};

// === Загрузка/сохранение ===
function loadData() {
  try {
    const saved = localStorage.getItem('becoming_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(userData, parsed);
      // Очистка от битых дат
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
    console.error("Ошибка сохранения:", e);
  }
}

loadData();

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
    saveData();
    showModal("✉️ Письмо отправлено.");
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
    saveData();
    showModal("✅ Ты сказал. Это важно.");
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
    saveData();
    showModal("🌌 Сон сохранён.");
  }
}

// === Просто быть ===
function logSilence() {
  userData.silenceMoments.push(new Date().toISOString());
  saveData();
  showModal("🧘 Ты был. Это уже присутствие.");
}

// === Природа ===
function playNature(sound) {
  document.querySelectorAll('audio').forEach(a => a.pause());
  if (!NATURE_SOUNDS[sound]) return;

  try {
    const audio = new Audio(`sounds/${sound}.mp3`);
    audio.loop = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn("Автовоспроизведение заблокировано:", e);
        showModal("⚠️ Чтобы включить звук, нажми на страницу.");
      });
    }
    showModal(`🎧 ${NATURE_SOUNDS[sound]} идёт. Нажми 'Пауза'.`, "rain");
  } catch (e) {
    showModal("⚠️ Звук недоступен. Проверь папку /sounds");
  }
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
    map += `${ax.neg.toUpperCase()} ${bar} ${ax.pos.toUpperCase()} (${diff:+d})\n`;
  });
  showModal(map);
}

// === Словарь сердца ===
function showWords() {
  const words = Object.keys(userData.wordCounts)
    .map(w => `${w} • (${userData.wordCounts[w]})`)
    .join('\n') || "Пока пусто";
  showModal(`📖 Словарь твоего сердца:\n\n${words}`);
}

// === Сад ===
function showGarden() {
  const hereCount = userData.wordCounts["здесь"] || 0;
  const flowers = "🌼".repeat(Math.max(1, Math.floor(hereCount / 3)));
  const message = hereCount < 3 
    ? "Семя ещё в земле. Оно растёт." 
    : "Ты уже не садишь. Ты — сад.";
  showModal(`🌷 Твой внутренний сад:\n\n${flowers}\n\n${message}`);
}

// === Прозрение ===
function showInsight() {
  showModal("✨ Ты уже не идёшь сквозь туман. Ты — свет.");
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

  showModal(`${symbol} Сегодня в тебе: ${weather}.\n\n${advice}`);
}

// === Поддержка ===
function showDonate() {
  const modal = document.createElement('div');
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
      <button onclick="this.closest('div').remove()" 
              style="background: #333; border: none; padding: 8px 16px; border-radius: 6px; color: #ccc;">
        Закрыть
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// === Модальное окно ===
function showModal(message, type = null) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = message;
  modalBody.appendChild(p);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Закрыть";
  closeBtn.type = "button";
  closeBtn.onclick = closeModal;

  if (type === "rain") {
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = "⏸️ Пауза";
    pauseBtn.type = "button";
    pauseBtn.onclick = stopAudio;
    modalBody.appendChild(pauseBtn);
    modalBody.appendChild(document.createElement('br'));
  }

  modalBody.appendChild(closeBtn);
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function stopAudio() {
  document.querySelectorAll('audio').forEach(a => a.pause());
  closeModal();
}

// === Загрузка интерфейса ===
document.addEventListener('DOMContentLoaded', () => {
  const greeting = document.querySelector('.greeting');
  if (greeting) {
    const word = getDailyWord();
    greeting.textContent = `Ты здесь. Это уже победа.\n🌱 Слово дня: ${word}`;
  }
});
