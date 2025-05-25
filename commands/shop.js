const shop = require('../db/shopitems');

module.exports = async (sock, m, args, sender, from) => {
  if (Object.keys(shop).length === 0) {
    return sock.sendMessage(from, {
      text: '📦 Toko masih kosong.'
    });
  }

  let list = '🛒 *Daftar Item di Toko:*\n\n';
  let i = 1;

  for (const [item, info] of Object.entries(shop)) {
    list += `${i++}. ${info.emoji} ${item} - Rp${info.harga.toLocaleString()}\n`;
  }

  list += `\nUntuk membeli, ketik: .beli <nama_item> <jumlah>\nContoh: .beli nasi 2`;

  await sock.sendMessage(from, { text: list });
};
