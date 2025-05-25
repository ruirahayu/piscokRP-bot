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

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();

  // Ambil list mention dari pesan
  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length === 0) {
    return sock.sendMessage(from, {
      text: '❌ Tag orang yang mau kamu transfer.\nContoh: .transfer @user 500',
    });
  }

  const targetJid = mentions[0]; // JID target transfer
  const amount = parseInt(args[1]);

  if (!users[targetJid]) {
    return sock.sendMessage(from, { text: '❌ User tersebut belum daftar.' });
  }

  if (isNaN(amount) || amount <= 0) {
    return sock.sendMessage(from, { text: '❌ Nominal transfer tidak valid.' });
  }

  if (!users[sender] || (users[sender].uang || 0) < amount) {
    return sock.sendMessage(from, { text: '❌ Uang kamu tidak cukup.' });
  }

  // Proses transfer saldo
  users[sender].uang -= amount;
  users[targetJid].uang = (users[targetJid].uang || 0) + amount;
  saveUsers(users);

  await sock.sendMessage(from, {
    text: `✅ Transfer berhasil!\nKamu mengirim Rp${amount} ke @${targetJid.split('@')[0]}`,
    mentions: [targetJid],
  });
};
