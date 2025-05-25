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

function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args) => {
  const sender = m.key.participant || m.key.remoteJid;
  const from = m.key.remoteJid;
  const users = loadUsers();

  try {
    if (!users[sender] || !users[sender].lamaranDari) {
      return await sock.sendMessage(from, { text: '❌ Kamu tidak punya lamaran yang harus ditolak.' });
    }

    const pelamar = users[sender].lamaranDari;

    // Hapus data lamaran
    delete users[sender].lamaranDari;
    saveUsers(users);

    await sock.sendMessage(from, { text: `❌ Kamu menolak lamaran dari @${pelamar.split('@')[0]}.`, mentions: [pelamar] });
    await sock.sendMessage(pelamar, { text: `❌ Lamaranmu ke @${sender.split('@')[0]} ditolak.`, mentions: [sender] });

  } catch (error) {
    console.error(error);
    await sock.sendMessage(from, { text: '⚠️ Terjadi kesalahan saat menjalankan perintah.' });
  }
};
