const form = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messages');
const thankYouMessage = document.getElementById('thankYouMessage');
const weddingDate = new Date('2026-04-23T17:00:00');

// Replace these with your Supabase project values.
const SUPABASE_URL = 'https://lbkzzafhefajmnlcqvwl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_luoqIFWqKuwEf8gCUr1KAg_TLYuhY5N';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let realtimeChannel;

async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, text, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

function renderMessages(messages) {
  messagesContainer.innerHTML = '';

  if (!messages || messages.length === 0) {
    messagesContainer.innerHTML = '<p class="empty-state">Be the first to send your best wishes.</p>';
    return;
  }

  messages.forEach((message) => {
    const card = document.createElement('article');
    card.className = 'message-card';

    const text = document.createElement('p');
    text.textContent = message.text;

    const name = document.createElement('strong');
    name.textContent = message.name || 'Guest';

    const time = document.createElement('time');
    time.dateTime = message.created_at;
    time.textContent = new Date(message.created_at).toLocaleString([], {
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

async function addMessage(name, text) {
  const cleanedName = name.trim() || 'Guest';
  const cleanedText = text.trim();

  const { error } = await supabase.from('messages').insert([
    {
      name: cleanedName,
      text: cleanedText
    }
  ]);

  if (error) {
    console.error('Error sending message:', error);
    thankYouMessage.textContent = 'Unable to send your message right now. Please try again.';
    return;
  }

  showThankYou(cleanedName);
}

async function initMessages() {
  const messages = await fetchMessages();
  renderMessages(messages);
  subscribeToMessages();
}

function subscribeToMessages() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
      const messages = await fetchMessages();
      renderMessages(messages);
    })
    .subscribe();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = form.guestName.value;
  const text = form.guestMessage.value;

  if (!name.trim() || !text.trim()) return;

  await addMessage(name, text);
  form.reset();
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

window.addEventListener('load', () => {
  initMessages();
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
