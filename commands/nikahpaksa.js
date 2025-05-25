const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

const ADMIN_JID = '628xxxxxxx@s.whatsapp.net'; // Ganti dengan JID adminmu

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  if (sender !== ADMIN_JID) {
    return sock.sendMessage(from, { text: '❌ Kamu bukan admin.' });
  }

  if (args.length < 2) {
    return sock.sendMessage(from, { text: '❌ Format salah. Contoh: .nikahpaksa @user1 @user2' });
  }

  const users = loadUsers();
  const user1 = args[0].replace(/^@/, '') + '@s.whatsapp.net';
  const user2 = args[1].replace(/^@/, '') + '@s.whatsapp.net';

  if (!users[user1] || !users[user2]) {
    return sock.sendMessage(from, { text: '❌ Salah satu user belum daftar.' });
  }

  if (users[user1].pasangan || users[user2].pasangan) {
    return sock.sendMessage(from, { text: '❌ Salah satu sudah punya pasangan.' });
  }

  users[user1].pasangan = user2;
  users[user2].pasangan = user1;
  saveUsers(users);

  await sock.sendMessage(from, {
    text: `💘 Kamu berhasil menjodohkan @${args[0]} dan @${args[1]}!`,
    mentions: [user1, user2],
  });
};
