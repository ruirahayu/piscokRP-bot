const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}
function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];
  if (!user || !user.lamaranDari) {
    return sock.sendMessage(from, { text: '❌ Tidak ada lamaran yang masuk.' });
  }

  const pengirim = user.lamaranDari;
  if (!users[pengirim]) {
    return sock.sendMessage(from, { text: '❌ Pengirim lamaran tidak ditemukan.' });
  }

  users[sender].pasangan = pengirim;
  users[pengirim].pasangan = sender;

  users[sender].lamaranDari = null;
  saveUsers(users);

  await sock.sendMessage(from, { text: '💞 Kamu menerima lamaran tersebut! Selamat!' });
  await sock.sendMessage(pengirim, {
    text: `🎉 @${sender.split('@')[0]} menerima lamarannya! Kalian sekarang pasangan resmi! 💕`,
    mentions: [sender],
  });
};
