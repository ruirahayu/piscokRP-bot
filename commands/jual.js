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

  if (!user) return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  if (args.length < 1) return sock.sendMessage(from, { text: '❗ Contoh: .jual ayam 2' });

  const item = args[0].toLowerCase();
  const jumlah = parseInt(args[1]) || 1;

  if (!user.inventory || !user.inventory[item] || user.inventory[item] < jumlah) {
    return sock.sendMessage(from, { text: `❌ Kamu tidak punya cukup *${item}* untuk dijual.` });
  }

  if (!shop[item]) {
    return sock.sendMessage(from, { text: `❌ Item *${item}* tidak bisa dijual.` });
  }

  const hargaJual = Math.floor(shop[item].harga * 0.5);
  const total = hargaJual * jumlah;

  user.inventory[item] -= jumlah;
  if (user.inventory[item] === 0) delete user.inventory[item];

  user.uang += total;

  saveUsers(users);

  return sock.sendMessage(from, {
    text: `✅ Kamu menjual *${jumlah} ${item}* seharga Rp${total.toLocaleString()}.`
  });
};
