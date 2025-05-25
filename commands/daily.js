const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');
let users = JSON.parse(fs.readFileSync(dbPath));

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  const user = users[sender];
  if (!user) {
    await sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
    return;
  }

  const now = Date.now();
  if (user.lastDaily && now - user.lastDaily < 24 * 60 * 60 * 1000) {
    const sisa = ((24 * 60 * 60 * 1000 - (now - user.lastDaily)) / 3600000).toFixed(1);
    return await sock.sendMessage(from, { text: `🕒 Bonus harian sudah diambil. Coba lagi ${sisa} jam lagi.` });
  }

  const bonus = 500;
  user.uang += bonus;
  user.lastDaily = now;
  saveDB();

  await sock.sendMessage(from, { text: `🎁 Kamu dapat bonus harian sebesar Rp ${bonus.toLocaleString()}!` });
};
