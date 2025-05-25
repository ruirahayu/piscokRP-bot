const fs = require('fs');
const path = require('path');
const jobs = require('../db/jobs');

const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveUsers(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}


module.exports = async (sock, m, args, sender, from) => {
  if (args.length < 1) {
    return sock.sendMessage(from, { text: '❌ Format salah. Contoh: `.gantijob petani`' });
  }

  const users = loadUsers();
  const user = users[sender];
  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (user.penjara && Date.now() < user.penjara) {
    return sock.sendMessage(from, { text: '🚔 Kamu sedang dipenjara, gak bisa pakai fitur ini dulu.' });
  }

  const jobInput = args.join(' ').toLowerCase();

  if (!jobs[jobInput]) {
    return sock.sendMessage(from, { text: `❌ Pekerjaan '${jobInput}' tidak ditemukan.` });
  }

  user.job = jobInput;

  saveUsers(users);

  return sock.sendMessage(from, { text: `✅ Kamu berhasil ganti pekerjaan menjadi *${jobs[jobInput].name}*.` });
};
