const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/users.json');
const bebasPrice = 500; // biaya bayar untuk bebas penjara

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

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (!user.penjara || Date.now() > user.penjara) {
    return sock.sendMessage(from, { text: 'ℹ️ Kamu tidak sedang dipenjara.' });
  }

  if (user.uang < bebasPrice) {
    return sock.sendMessage(from, { text: `❌ Uang kamu tidak cukup. Butuh Rp${bebasPrice.toLocaleString()} untuk bebas.` });
  }

  // Bayar dan bebaskan
  user.uang -= bebasPrice;
  delete user.penjara;

  saveUsers(users);

  return sock.sendMessage(from, { text: `✅ Kamu sudah bebas dari penjara! (-Rp${bebasPrice.toLocaleString()})` });
};
