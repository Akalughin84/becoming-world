// app.js
// 🌱 Becoming — создано Алексей Калугин, 2025
// Не для продуктивности. Для присутствия.
// Ты здесь. Это уже победа.

// === Глобальные данные ===
const userData = {
  wordCounts: {},
  dailyWords: [],
  silenceMoments: [],
  letters: [],
  dreams: [],
  forgiveness: [],
  lastLetter: null
};

// Загружаем данные из localStorage
function loadData() {
  const saved = localStorage.getItem('becoming_data');
  if (saved) {
    Object.assign(userData, JSON.parse(saved));
  }
}

// Сохраняем данные
function saveData() {
  localStorage.setItem('becoming_data', JSON.stringify(userData));
}

// Инициализация
loadData();

// === Слово дня ===
function getDailyWord() {
  const themes = {
    fear: ["Верь", "Ты сильнее страха", "Иди", "Ты не один"],
    tired: ["Отдыхай", "Ты сделал достаточно", "Дыши", "Ты здесь"],
    default: ["Дыши", "Ты здесь", "Это достаточно", "Иди", "Верь", "Будь"]
  };

  const usedToday = userData.dailyWords.filter(w => 
    new Date(w.date).toDateString() === new Date().toDateString()
  ).map(w => w.word);

  const available = themes.default.filter(w => !usedToday.includes(w));
  const word = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : "Будь";

  userData.dailyWords.push({ word, date: new Date().toISOString() });
  saveData();
  return word;
}

// === Прозрения по триггерам ===
function getInsight() {
  const insights = [
    { condition: () => userData.wordCounts.страх > (userData.wordCounts.вера || 0) + 3,
      message: "Ты боишься больше, чем веришь. Но ты идёшь — это и есть вера." },
    { condition: () => userData.wordCounts.устал > 5 && userData.wordCounts.здесь > 3,
      message: "Ты устаёшь, защищая присутствие. Это не слабость. Это любовь." },
    { condition: () => userData.wordCounts.не_знаю > 10,
      message: "Ты не знаешь пути. Но ты знаешь, чего хочешь. Этого хватит." },
    { condition: () => true,
      message: "Ты уже не идёшь сквозь туман. Ты — свет." }
  ];

  for (let rule of insights) {
    if (rule.condition()) return rule.message;
  }
  return "Пока тишина…";
}

// === Письмо ===
function writeLetter() {
  const text = prompt("Напиши письмо себе через год:");
  if (text) {
    userData.letters.push({
      content: text,
      timestamp: new Date().toISOString(),
      delivered: false
    });
    userData.lastLetter = new Date().toISOString();
    saveData();
    showModal("📬 Ты написал письмо. Оно будет ждать.");
  }
}

// === Прозрение ===
function showInsight() {
  const insight = getInsight();
  showModal("✨ " + insight);
}

// === Тишина ===
function logSilence() {
  userData.silenceMoments.push(new Date().toISOString());
  saveData();
  showModal("🧘 Ты был. Это уже присутствие.");
}

// === Сад ===
function showGarden() {
  const hereCount = userData.wordCounts.здесь || 0;
  const flowers = "🌼".repeat(Math.max(1, Math.floor(hereCount / 3)));
  const message = hereCount < 3 
    ? "Семя ещё в земле. Оно растёт." 
    : "Ты уже не садишь. Ты — сад.";
  showModal(`🌷 Твой внутренний сад:\n\n${flowers}\n\n${message}`);
}

// === Внутренняя погода ===
function showWeather() {
  const totalWords = Object.values(userData.wordCounts).reduce((a,b) => a+b, 0);
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

// === Погода в словах ===
function updateGreeting() {
  const word = getDailyWord();
  document.querySelector('.greeting').textContent = `Ты здесь. Это уже победа.\n🌱 Слово дня: ${word}`;
}

// === Природа ===
function playRain() {
  const audio = new Audio('sounds/rain.mp3'); // положи в папку /sounds
  audio.loop = true;
  audio.play();
  showModal("🌧️ Дождь идёт. Нажми 'Пауза', чтобы остановить.", "rain");
}

function stopAudio() {
  const audios = document.querySelectorAll('audio');
  audios.forEach(a => a.pause());
  document.querySelector('#modal').style.display = 'none';
}

// === Умная модалка ===
function showModal(message, type = null) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `<p>${message}</p>`;
  
  if (type === "rain") {
    modalBody.innerHTML += `<button onclick="stopAudio()">⏸️ Пауза</button>`;
  } else {
    modalBody.innerHTML += `<button onclick="closeModal()">Закрыть</button>`;
  }
  
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// === Запуск ===
window.onload = () => {
  updateGreeting();
  checkEveningRitual();
};

// === Вечерний ритуал ===
function checkEveningRitual() {
  const now = new Date();
  if (now.getHours() >= 20) {
    const did = confirm("Время вечернего ритуала. Закрыть день тремя словами?");
    if (did) {
      const q1 = prompt("Что важно?");
      const q2 = prompt("За что благодарю?");
      const q3 = prompt("Что отпускаю?");
      showModal(`🌙 Ты закрыл день:\n\n${q1 || '...'}\n${q2 || '...'}\n${q3 || '...'}`);
    }
  }
}

// === Донаты ===
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
        <a href="https://boosty.to/becoming" target="_blank" style="color: #4CAF50; text-decoration: none;">
          💚 Поддержать на Boosty
        </a><br><br>
        <a href="https://ko-fi.com/becoming5036" target="_blank" style="color: #00A0C6; text-decoration: none;">
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

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
