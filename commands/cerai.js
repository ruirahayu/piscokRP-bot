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

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (!user.pasangan) {
    return sock.sendMessage(from, { text: '❌ Kamu belum punya pasangan.' });
  }

  if (args[0]?.toLowerCase() !== 'ya') {
    return sock.sendMessage(from, {
      text: '❗ Kamu yakin ingin bercerai? Ketik `.cerai ya` untuk konfirmasi.',
    });
  }

  const pasanganId = user.pasangan;
  if (users[pasanganId]) {
    users[pasanganId].pasangan = null;
  }

  users[sender].pasangan = null;
  saveUsers(users);

  await sock.sendMessage(from, { text: '💔 Kamu dan pasangan sudah resmi bercerai.' });
};
