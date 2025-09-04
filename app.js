// app.js
// 🌱 Becoming — создано Алексей Калугин, 2025
// Ты здесь. Это уже победа.

// === Глобальные данные ===
const userData = {
  wordCounts: {},
  dailyWords: [],
  letters: [],
  dreams: [],
  forgiveness: [],
  silenceMoments: []
};

// === Загрузка/сохранение ===
function loadData() {
  const saved = localStorage.getItem('becoming_data');
  if (saved) {
    Object.assign(userData, JSON.parse(saved));
  }
}

function saveData() {
  localStorage.setItem('becoming_data', JSON.stringify(userData));
}

loadData();

// === Слово дня ===
function getDailyWord() {
  const today = new Date().toDateString();
  const usedToday = userData.dailyWords.filter(w => new Date(w.date).toDateString() === today);
  if (usedToday.length > 0) return usedToday[0].word;

  const words = ["Дыши", "Ты здесь", "Это достаточно", "Иди", "Верь", "Будь"];
  const word = words[Math.floor(Math.random() * words.length)];

  userData.dailyWords.push({ word, date: new Date().toISOString() });
  saveData();
  return word;
}

// === Письмо ===
function writeLetter() {
  const text = prompt("Напиши письмо себе через год:");
  if (text) {
    userData.letters.push({
      content: text,
      timestamp: new Date().toISOString()
    });
    saveData();
    showModal("✉️ Письмо отправлено.");
  }
}

// === Прозрение ===
function showInsight() {
  const insight = "Ты уже не идёшь сквозь туман. Ты — свет.";
  showModal("✨ " + insight);
}

// === Природа ===
function playNature(sound) {
  try {
    const audio = new Audio(`sounds/${sound}.mp3`);
    audio.loop = true;
    audio.play();
    showModal(`🎧 ${sound === 'rain' ? '🌧️ Дождь' : sound === 'fire' ? '🔥 Огонь' : '🌊 Океан'} идёт. Нажми "Пауза".`, "rain");
  } catch (e) {
    showModal("⚠️ Звук недоступен. Проверь папку /sounds");
  }
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

// === Погода ===
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

// === Модалка ===
function showModal(message, type = null) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
  
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

function stopAudio() {
  const audios = document.querySelectorAll('audio');
  audios.forEach(a => a.pause());
  closeModal();
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

// === Запуск ===
window.onload = () => {
  const word = getDailyWord();
  document.querySelector('.greeting').textContent = `Ты здесь. Это уже победа.\n🌱 Слово дня: ${word}`;
};
