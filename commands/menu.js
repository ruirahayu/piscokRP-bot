module.exports = async (sock, m, args, sender, from) => {
  const profileBot = '🤖 *piscokRP-bot*\n────────────────────\n';
  const menuText = 
  `${profileBot}📋 *Menu Utama – PiscokRP Bot*

  👤 *USER COMMANDS*
  ┊📝 .daftar <nama> <umur> <gender>
  ┊🧍 .profile
  ┊🎒 .inv
  ┊💞 .pasangan

  💰 *EKONOMI*
  ┊💵 .uang
  ┊🛠️ .kerja
  ┊🎁 .daily
  ┊🔁 .transfer
  ┊🛍️ .shop
  ┊🛒 .beli <item> <jumlah>
  ┊🎲 .gacha
  ┊🎰 .slot
  ┊🥷 .rampok
  ┊🏆 .top

  💞 *HUBUNGAN*
  ┊💍 .nikah @user
  ┊🔐 .nikahpaksa @user
  ┊💔 .cerai

  🛠️ *LAINNYA*
  ┊🧑‍💼 .job
  ┊🌀 .gantijob
  ┊📖 .menu

  ────────────────────
  🤖 *PiscokRP-Bot by kamu*
  `;

  await sock.sendMessage(from, { text: menuText });
};
