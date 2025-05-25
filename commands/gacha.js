// commands/gacha.js
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

// Definisi item & chance (semakin besar weight semakin besar chance)
const gachaPool = [
  { key: 'nasi', weight: 40 },
  { key: 'ayam', weight: 25 },
  { key: 'apel', weight: 20 },
  { key: 'berlian', weight: 5 },
  { key: 'mobil', weight: 2 },
  { key: 'motor', weight: 8 },
];

// Fungsi random berdasar weight
function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item.key;
    random -= item.weight;
  }
  return items[items.length - 1].key;
}

module.exports = async (sock, m, args, sender, from) => {
  const users = loadUsers();
  const user = users[sender];

  if (!user) {
    return sock.sendMessage(from, { text: '❌ Kamu belum daftar.' });
  }

  const gachaPrice = 100; // biaya gacha

  if (user.uang < gachaPrice) {
    return sock.sendMessage(from, { text: `❌ Uang kamu kurang untuk gacha. Butuh Rp${gachaPrice.toLocaleString()}` });
  }

  user.uang -= gachaPrice;

  const resultKey = weightedRandom(gachaPool);
  user.inventory = user.inventory || {};
  user.inventory[resultKey] = (user.inventory[resultKey] || 0) + 1;

  saveUsers(users);

  const emoji = shop[resultKey]?.emoji || '';
  const itemName = resultKey.charAt(0).toUpperCase() + resultKey.slice(1);

  await sock.sendMessage(from, { text: `🎉 Kamu mendapatkan ${emoji} *${itemName}* dari gacha! (-Rp${gachaPrice.toLocaleString()})` });
};
