const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/users.json');

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath));
  } catch {
    return {};
  }
}

function saveDB(users) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error saat menyimpan data:', e);
  }
}

module.exports = async function daftar(sock, m, args, sender, from) {
  let users = loadDB();

  if (users[sender]) {
    await sock.sendMessage(from, { text: '⚠️ Kamu sudah terdaftar.' });
    return;
  }

  if (args.length < 3) {
    await sock.sendMessage(from, { text: '❌ Format salah.\nContoh: `.daftar Zoro 21 L`' });
    return;
  }

  const nama = args[0];
  const umur = parseInt(args[1]);
  const gender = args[2] ? args[2].toUpperCase() : '';

  if (isNaN(umur) || umur < 10 || umur > 90 || !['L', 'P'].includes(gender)) {
    await sock.sendMessage(from, { text: '❌ Format umur/gender salah.\nGender: L (laki-laki), P (perempuan)' });
    return;
  }

  users[sender] = {
    nama,
    umur,
    gender,
    uang: 100,
    job: 'Pengangguran',
    pasangan: null
  };

  saveDB(users);

  await sock.sendMessage(from, {
    text: `✅ Berhasil daftar!\n👤 Nama: ${nama}\n🎂 Umur: ${umur}\n🚻 Gender: ${gender}`
  });
};
