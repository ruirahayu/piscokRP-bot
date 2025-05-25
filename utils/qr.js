const QRCode = require('qrcode');

module.exports = async (qr) => {
  try {
    const dataUrl = await QRCode.toDataURL(qr);
    console.log('📱 QR Code Data URL:');
    console.log(dataUrl);
  } catch (err) {
    console.error('Gagal generate QR code:', err);
  }
};
