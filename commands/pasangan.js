const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (!user.pasangan) {
    return sock.sendMessage(from, { text: '❌ Kamu belum punya pasangan.' });
  }

  const pasangan = users[user.pasangan];
  if (!pasangan) {
    return sock.sendMessage(from, { text: '⚠️ Data pasangan tidak ditemukan.' });
  }

  await sock.sendMessage(from, {
    text: `💑 Pasanganmu adalah @${user.pasangan.split('@')[0]} (${pasangan.nama}, ${pasangan.umur} tahun, Gender: ${pasangan.gender})`,
    mentions: [user.pasangan],
  });
};
