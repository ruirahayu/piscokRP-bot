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
  const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mention) {
    return sock.sendMessage(from, {
      text: '❌ Tag orang yang mau dilamar. Contoh: .nikah @wauser',
    });
  }

  const target = mention;

  // Cek apakah kedua user sudah terdaftar
  if (!users[sender] || !users[target]) {
    return sock.sendMessage(from, {
      text: '❌ Kamu atau target belum daftar.',
    });
  }

  // Cek apakah sudah punya pasangan
  if (users[sender].pasangan) {
    return sock.sendMessage(from, {
      text: '❌ Kamu sudah punya pasangan.',
    });
  }

  if (users[target].pasangan) {
    return sock.sendMessage(from, {
      text: '❌ Target sudah punya pasangan.',
    });
  }

  // Cek apakah sudah pernah melamar orang
  const existingProposal = Object.entries(users).find(([id, u]) => u.lamaranDari === sender);
  if (existingProposal) {
    return sock.sendMessage(from, {
      text: '❌ Kamu sudah melamar seseorang. Tunggu jawabannya dulu.',
    });
  }

  // Cek apakah target sudah dilamar orang lain
  if (users[target].lamaranDari) {
    return sock.sendMessage(from, {
      text: '❌ Target sedang diproses lamaran dari orang lain.',
    });
  }

  // Simpan lamaran
  users[target].lamaranDari = sender;
  saveUsers(users);

  // Notifikasi ke pelamar
  await sock.sendMessage(from, {
    text: `💌 Lamaran dikirim ke @${target.split('@')[0]}! Tunggu jawabannya.`,
    mentions: [target],
  });

  // Notifikasi ke target
  await sock.sendMessage(target, {
    text: `💍 @${sender.split('@')[0]} melamar kamu!\nBalas dengan:\n.terima - untuk menerima\n.tolak - untuk menolak`,
    mentions: [sender],
  });
};
