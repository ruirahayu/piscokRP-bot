const fs = require('fs');
const path = require('path');
const userPath = path.join(__dirname, '../db/users.json');

const itemEmoji = {
  nasi: '🍚',
  ayam: '🍗',
  jus: '🧃',
  apel: '🍎',
  sandwich: '🥪',
  pizza: '🍕',
  kue: '🍰',
  kopi: '☕',
  // tambahkan kalau perlu
};

function loadUsers() {
  return JSON.parse(fs.readFileSync(userPath));
}

function saveUsers(users) {
  fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
}

module.exports = async (sock, m, args, sender, from) => {
  if (args.length < 1) {
    return sock.sendMessage(from, { text: '❌ Format salah. Contoh: `.kons apel`' });
  }

  const users = loadUsers();
  const user = users[sender];
  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  const itemInput = args[0].toLowerCase();
  const inventoryKeys = Object.keys(user.inventory || {});
  const itemKey = inventoryKeys.find(key => key.toLowerCase() === itemInput);

  if (!itemKey || !user.inventory[itemKey] || user.inventory[itemKey] < 1) {
    return sock.sendMessage(from, { text: `❌ Kamu tidak punya ${itemInput} di inventory.` });
  }

  // Energi tambahan sesuai item
  const energyBoosts = {
    nasi: 10,
    ayam: 15,
    jus: 8,
    apel: 12,
    sandwich: 18,
    pizza: 25,
    kue: 20,
    kopi: 5,
  };

  const tambahEnergi = energyBoosts[itemInput] || 0;

  // Kurangi 1 item di inventory
  user.inventory[itemKey] -= 1;
  if (user.inventory[itemKey] <= 0) {
    delete user.inventory[itemKey];
  }

  // Tambah energi dengan batas max 100
  user.energi = Math.min((user.energi || 0) + tambahEnergi, 100);

  saveUsers(users);

  return sock.sendMessage(from, {
    text: `🍽️ Kamu mengonsumsi ${itemEmoji[itemInput] || ''} *${itemKey}*.\n🔋 Energi bertambah +${tambahEnergi}, sekarang: ${user.energi}/100`
  });
};
