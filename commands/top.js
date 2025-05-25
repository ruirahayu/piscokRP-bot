const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();

  // Sort user by uang descending
  const sorted = Object.entries(users)
    .filter(([_, u]) => u.uang !== undefined)
    .sort((a, b) => b[1].uang - a[1].uang)
    .slice(0, 10);

  if (sorted.length === 0) {
    return sock.sendMessage(from, { text: '❌ Belum ada data uang.' });
  }

  let text = '🏆 Top 10 Pemilik Uang Terbanyak:\n';
  sorted.forEach(([jid, u], i) => {
    text += `${i + 1}. @${jid.split('@')[0]} - Rp${u.uang}\n`;
  });

  const mentions = sorted.map(([jid]) => jid);

  await sock.sendMessage(from, { text, mentions });
};
