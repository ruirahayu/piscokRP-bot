const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const showQR = require('../utils/qr');
const handleMessage = require('../handlers/messageHandler');

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    qrTimeout: 0,
    getMessage: async () => ({}),
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) await showQR(qr);

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    await handleMessage(sock, msg);
  });
}

module.exports = startSock;
