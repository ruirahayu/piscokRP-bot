const fs = require('fs');
const path = require('path');
const userPath = path.join(__dirname, '../db/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(userPath));
}

function saveUsers(users) {
  fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  if (user.penjara && Date.now() < user.penjara) {
    return sock.sendMessage(from, { text: '🚔 Kamu sedang dipenjara, gak bisa pakai fitur ini dulu.' });
  }

  const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) {
    return sock.sendMessage(from, { text: '❗ Tag target yang ingin dirampok.\nContoh: .rampok @target' });
  }

  if (mentioned === sender) {
    return sock.sendMessage(from, { text: '🤨 Kamu gak bisa merampok diri sendiri.' });
  }

  const target = users[mentioned];
  if (!target) {
    return sock.sendMessage(from, { text: '❌ Target belum terdaftar di sistem.' });
  }

  const energyCost = 20;
  if (user.energi < energyCost) {
    return sock.sendMessage(from, { text: `⚡ Energi kamu tidak cukup! Butuh ${energyCost} energi untuk merampok.` });
  }

  if (target.uang < 1000) {
    return sock.sendMessage(from, { text: '💸 Target terlalu miskin (saldo < Rp1000).' });
  }

  user.energi -= energyCost;

  // Cek anti-rampok
  const inventory = target.inventory || {};
  const antiItems = ['dompet_besi', 'anjing_penjaga'];
  const hasAnti = antiItems.find(item => inventory[item] && inventory[item] > 0);

  if (hasAnti) {
    inventory[hasAnti] -= 1;
    target.inventory = inventory;
    saveUsers(users);

    // Kirim notifikasi ke target
    await sock.sendMessage(mentioned, {
      text: `🛡️ Seseorang mencoba merampokmu, tapi ${hasAnti.replace('_', ' ')} melindungimu!\nItem ${hasAnti.replace('_', ' ')} telah digunakan.`
    });

    return sock.sendMessage(from, {
      text: `🚫 Rampokanmu gagal! @${mentioned.split('@')[0]} dilindungi oleh *${hasAnti.replace('_', ' ')}*.\n⚡ Energi tersisa: ${user.energi}`,
      mentions: [mentioned]
    });
  }

  const berhasil = Math.random() < 0.5;

  if (berhasil) {
    const jumlah = Math.floor(Math.random() * 400) + 100;
    const curian = Math.min(jumlah, target.uang);

    user.uang += curian;
    target.uang -= curian;

    saveUsers(users);

    // Kirim notifikasi ke target
    await sock.sendMessage(mentioned, {
      text: `❗ Kamu baru saja dirampok oleh @${sender.split('@')[0]}!\nKehilangan Rp${curian.toLocaleString()}.`,
      mentions: [sender]
    });

    return sock.sendMessage(from, {
      text: `🤑 Kamu berhasil merampok @${mentioned.split('@')[0]} dan dapat Rp${curian.toLocaleString()}!\n⚡ Energi tersisa: ${user.energi}`,
      mentions: [mentioned]
    });
  } else {
    const denda = Math.floor(Math.random() * 200) + 100;
    const rugi = Math.min(denda, user.uang);

    user.uang -= rugi;
    target.uang += rugi;

    saveUsers(users);

    await sock.sendMessage(mentioned, {
      text: `🔒 Seseorang mencoba merampokmu, tapi gagal. Kamu menerima Rp${rugi.toLocaleString()} dari kegagalan itu.`,
    });

    return sock.sendMessage(from, {
      text: `💥 Gagal! Kamu ketahuan dan kehilangan Rp${rugi.toLocaleString()} ke @${mentioned.split('@')[0]}!\n⚡ Energi tersisa: ${user.energi}`,
      mentions: [mentioned]
    });
  }
};
