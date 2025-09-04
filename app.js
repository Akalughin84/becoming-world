// 🌱 Becoming — создано Алексей Калугин, 2025
// Не для продуктивности. Для присутствия.
// Ты здесь. Это уже победа.

function writeLetter() {
  const text = prompt("Напиши письмо себе через год:");
  if (text) {
    showModal("📬 Ты написал письмо. Оно будет ждать.");
  }
}

function showInsight() {
  const insights = [
    "Ты учишься прощать. Не потому что боль ушла. А потому что ты больше не хочешь её носить.",
    "Ты уже не идёшь. Ты — путь.",
    "Ты не знаешь пути. Но ты знаешь, чего хочешь. Этого хватит."
  ];
  showModal("✨ " + insights[Math.floor(Math.random() * insights.length)]);
}

function playRain() {
  showModal("🌧️ Дождь идёт. Ты здесь.");
}

function showGarden() {
  const flowers = "🌼".repeat(Math.floor(Math.random() * 5) + 1);
  showModal(`🌷 Твой сад: ${flowers}`);
}

function showWeather() {
  const weathers = [
    "🌱 Весна пробуждения. Ты снова растёшь.",
    "☀️ Лето присутствия. Ты здесь. Это свет.",
    "🍂 Осень тишины. Ты собираешь то, что выросло.",
    "❄️ Зима корней. Ты не растёшь. Ты — основа."
  ];
  showModal("🌤️ " + weathers[Math.floor(Math.random() * weathers.length)]);
}

function showDonate() {
  document.getElementById('modal-body').innerHTML = `
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
  `;
  document.getElementById('modal').style.display = 'flex';
}

function showModal(message) {
  document.getElementById('modal-body').innerHTML = `<p>${message}</p><button onclick="closeModal()">Закрыть</button>`;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Установка PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}