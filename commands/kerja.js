const fs = require('fs');
const path = require('path');
const jobs = require('../db/jobs');

const dbPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  let users = loadUsers();

  const user = users[sender];
  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (user.penjara && Date.now() < user.penjara) {
    return sock.sendMessage(from, { text: '🚔 Kamu sedang dipenjara, gak bisa pakai fitur ini dulu.' });
  }

  // Pastikan user punya atribut energi, default 50
  if (typeof user.energi !== 'number') user.energi = 50;

  const jobKey = user.job ? user.job.toLowerCase() : 'pengangguran';
  const job = jobs[jobKey] || jobs['pengangguran'];

  // Berapa energi yang dibutuhkan untuk kerja, bisa disesuaikan tiap job
  const energiButuh = job.energiButuh || 20;

  if (user.energi < energiButuh) {
    return sock.sendMessage(from, {
      text: `⚠️ Energi kamu kurang untuk bekerja sebagai *${job.name}*.\nEnergi saat ini: ${user.energi}/100.\nCoba konsumsi makanan dulu ya dengan .kons`
    });
  }

  // Hitung gaji random
  const gaji = Math.floor(Math.random() * (job.maxGaji - job.minGaji + 1)) + job.minGaji;

  user.uang += gaji;
  user.energi -= energiButuh;

  saveDB(users);

  await sock.sendMessage(from, {
    text: `💼 Kamu bekerja sebagai *${job.name}*.\n${job.deskripsi}\nKamu mendapat Rp${gaji.toLocaleString()}!\nEnergi tersisa: ${user.energi}/100.`
  });
};
