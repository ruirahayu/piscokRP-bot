const QRCode = require('qrcode');
const fs = require('fs');

module.exports = async (qr) => {
  const filePath = './qrcode.png';

  try {
    await QRCode.toFile(filePath, qr);
    console.log(`📱 QR Code sudah disimpan di ${filePath}`);
  } catch (err) {
    console.error('Gagal generate QR code:', err);
  }
};
