// commands/slot.js
const fs = require('fs');
const path = require('path');
const userPath = path.join(__dirname, '../db/users.json');
const shop = require('../db/shopitems');

function loadUsers() {
  return JSON.parse(fs.readFileSync(userPath));
}

function saveUsers(users) {
  fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
}

const symbols = ['🍒', '🍋', '🍉', '🍇', '⭐', '💎'];

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (user.penjara && Date.now() < user.penjara) {
    return sock.sendMessage(from, { text: '🚔 Kamu sedang dipenjara, gak bisa pakai fitur ini dulu.' });
  }

  const bet = parseInt(args[0]);
  if (!bet || bet < 1) {
    return sock.sendMessage(from, { text: '❌ Masukkan jumlah taruhan yang valid.\nContoh: .slot 100' });
  }

  if (user.uang < bet) {
    return sock.sendMessage(from, { text: '❌ Uang kamu tidak cukup untuk taruhan itu.' });
  }

  // Kurangi uang taruhan
  user.uang -= bet;

  // Generate slot hasil 3 simbol
  const result = [];
  for (let i = 0; i < 3; i++) {
    result.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  // Hitung kemenangan
  let winnings = 0;
  if (result[0] === result[1] && result[1] === result[2]) {
    winnings = bet * 5; // triple sama = 5x taruhan
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    winnings = bet * 2; // dua sama = 2x taruhan
  }

  if (winnings > 0) {
    user.uang += winnings;
  }

  saveUsers(users);

  const resultText = result.join(' | ');
  const message = winnings > 0
    ? `🎰 Hasil slot: ${resultText}\n🎉 Kamu menang Rp${winnings.toLocaleString()}!`
    : `🎰 Hasil slot: ${resultText}\n😞 Kamu kalah Rp${bet.toLocaleString()}. Coba lagi ya!`;

  await sock.sendMessage(from, { text: message });
};
