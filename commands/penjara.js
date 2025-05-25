const fs = require('fs');
const path = require('path');
const userPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(userPath));
}

function saveUsers(users) {
  fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, senderParam, from) => {
  // Pastikan command di grup
  if (!m.key.remoteJid.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ Perintah ini hanya bisa digunakan di grup.' });
  }

  // Format sender sebenarnya (biasanya di grup ada di m.key.participant)
  const sender = m.key.participant || senderParam; 
  // Pastikan sender lengkap dengan domain @s.whatsapp.net
  const formattedSender = sender.includes('@') ? sender : sender + '@s.whatsapp.net';

  // Daftar super admins (nomor harus lengkap dengan domain)
  const superAdmins = [
    '62882878068610@s.whatsapp.net',
    '6289876543210@s.whatsapp.net'
  ];

  // Ambil metadata grup
  const metadata = await sock.groupMetadata(m.key.remoteJid);
  const admins = metadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  const isAdminGroup = admins.includes(formattedSender);
  const isSuperAdmin = superAdmins.includes(formattedSender);

  if (!isAdminGroup && !isSuperAdmin) {
    return sock.sendMessage(from, { text: '❌ Kamu bukan admin grup atau superadmin.' });
  }

  const users = loadUsers();

  // Ambil target yang di-tag
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) {
    return sock.sendMessage(from, { text: '❗ Tag user yang mau dipenjara. Contoh: .penjara @user' });
  }

  if (!users[mentioned]) return sock.sendMessage(from, { text: '❌ Target belum terdaftar.' });
  if (mentioned === formattedSender) return sock.sendMessage(from, { text: '❌ Gak bisa penjara diri sendiri.' });

  const durationMs = 20 * 60 * 1000; // 20 menit
  const until = Date.now() + durationMs;

  users[mentioned].penjara = until;
  saveUsers(users);

  // Kirim pesan pribadi ke yang dipenjara
  await sock.sendMessage(mentioned, {
    text: `🚔 Kamu telah dipenjara oleh admin grup selama 20 menit.`,
    mentions: [mentioned]
  });

  // Konfirmasi ke pengirim di grup
  await sock.sendMessage(from, {
    text: `✅ @${mentioned.split('@')[0]} sekarang dipenjara selama 20 menit.`,
    mentions: [mentioned]
  });
};
