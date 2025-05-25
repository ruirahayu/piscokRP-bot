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

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, {
      text: '❌ Kamu belum daftar. Ketik `.daftar <nama> <umur> <gender>`'
    });
  }

  if (user.penjara && Date.now() < user.penjara) {
    return sock.sendMessage(from, { text: '🚔 Kamu sedang dipenjara, gak bisa pakai fitur ini dulu.' });
  }

  if (args.length < 2) {
    return sock.sendMessage(from, {
      text: '❌ Format salah.\nContoh: `.beli nasi 2`'
    });
  }

  const itemKey = args[0].toLowerCase();
  const jumlah = parseInt(args[1]);

  if (!shop[itemKey]) {
    return sock.sendMessage(from, {
      text: `❌ Item \`${itemKey}\` tidak tersedia di toko.`
    });
  }

  if (isNaN(jumlah) || jumlah < 1) {
    return sock.sendMessage(from, {
      text: '❌ Jumlah harus angka dan minimal 1.'
    });
  }

  const harga = shop[itemKey].harga;
  const emoji = shop[itemKey].emoji;
  const total = harga * jumlah;

  if (user.uang < total) {
    return sock.sendMessage(from, {
      text: `❌ Uang kamu tidak cukup. Total: Rp${total.toLocaleString()}`
    });
  }

  user.uang -= total;
  if (!user.inventory) user.inventory = {};
  user.inventory[itemKey] = (user.inventory[itemKey] || 0) + jumlah;

  saveUsers(users);

  return sock.sendMessage(from, {
    text: `✅ Kamu membeli ${jumlah} ${emoji} *${itemKey}* seharga Rp${total.toLocaleString()}.`
  });
};
