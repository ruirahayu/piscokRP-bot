const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(dbPath));
  } catch {
    return {};
  }
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers(); // Baca file setiap panggil command
  const user = users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ Kamu belum daftar. Ketik `.daftar <nama> <umur> <gender>`' });
    return;
  }

  await sock.sendMessage(from, {
    text: `💰 Saldo kamu: Rp ${user.uang.toLocaleString()}`
  });
};
