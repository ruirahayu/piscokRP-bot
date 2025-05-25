const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

const itemEmoji = {
  nasi: '🍚',
  ayam: '🍗',
  jus: '🧃',
  apel: '🍎',
  sandwich: '🥪',
  pizza: '🍕',
  kue: '🍰',
  kopi: '☕',
  hp: '📱',
  berlian: '💎',
  anjing: '🐶',
  kucing: '🐱',
  'rumah kecil': '🏠',
  mobil: '🚗',
  motor: '🛵'
};

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    await sock.sendMessage(from, {
      text: '❌ Kamu belum daftar. Ketik `.daftar <nama> <umur> <gender>`'
    });
    return;
  }

  const pasangan = user.pasangan ? `@${user.pasangan.split('@')[0]}` : 'Belum punya pasangan';
  const inventory = user.inventory || {};

  const invText = Object.keys(inventory).length
    ? Object.entries(inventory)
        .map(([item, qty]) => {
          const emoji = itemEmoji[item.toLowerCase()] || '📦';
          return `- ${emoji} *${capitalizeWords(item)}*: ${qty}`;
        })
        .join('\n')
    : '📦 Kosong';

  const jobName = user.job ? capitalizeWords(user.job) : 'Pengangguran';
  const energi = user.energi !== undefined ? user.energi : '100'; // default energi kalau belum ada

  const text = `📄 *Profilmu:*

👤 Nama: ${user.nama}
🎂 Umur: ${user.umur}
🚻 Gender: ${user.gender}
💼 Job: ${jobName}
🔋 Energi: ${energi}
💰 Uang: Rp${user.uang.toLocaleString()}
💑 Pasangan: ${pasangan}

🎒 *Inventory:*
${invText}`;

  await sock.sendMessage(from, {
    text,
    mentions: user.pasangan ? [user.pasangan] : []
  });
};
