const form = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messages');
const thankYouMessage = document.getElementById('thankYouMessage');
const storageKey = 'weddingMessages';
const weddingDate = new Date('2026-04-23T17:00:00');

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem(storageKey, JSON.stringify(messages));
}

function renderMessages() {
  const messages = getMessages();
  messagesContainer.innerHTML = '';

  if (messages.length === 0) {
    messagesContainer.innerHTML = '<p class="empty-state">Be the first to send your best wishes.</p>';
    return;
  }

  messages.slice().reverse().forEach((message) => {
    const card = document.createElement('article');
    card.className = 'message-card';

    const text = document.createElement('p');
    text.textContent = message.text;

    const name = document.createElement('strong');
    name.textContent = message.name;

    const time = document.createElement('time');
    time.dateTime = message.date;
    time.textContent = new Date(message.date).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    card.append(text, name, time);
    messagesContainer.appendChild(card);
  });
}

function showThankYou(name) {
  thankYouMessage.textContent = `Thank you, ${name}! Your message is now part of our celebration.`;
  setTimeout(() => {
    thankYouMessage.textContent = '';
  }, 5000);
}

function addMessage(name, text) {
  const messages = getMessages();
  messages.push({
    name: name.trim() || 'Guest',
    text: text.trim(),
    date: new Date().toISOString()
  });
  saveMessages(messages);
  renderMessages();
  showThankYou(name.trim() || 'Guest');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = form.guestName.value;
  const text = form.guestMessage.value;

  if (!name.trim() || !text.trim()) return;

  addMessage(name, text);
  form.reset();
});

window.addEventListener('storage', (event) => {
  if (event.key === storageKey) {
    renderMessages();
  }
});

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 1000 / 60) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

renderMessages();
updateCountdown();
setInterval(updateCountdown, 1000);
