const jobs = require('../db/jobs');

module.exports = async (sock, m, args, sender, from) => {
  let list = '🛠️ *Daftar Pekerjaan yang Tersedia:*\n\n';
  let i = 1;

  for (const key in jobs) {
    const job = jobs[key];
    list += `${i++}. *${job.name}*\n   Gaji: Rp${job.minGaji.toLocaleString()} - Rp${job.maxGaji.toLocaleString()}\n   Deskripsi: ${job.deskripsi}\n\n`;
  }

  list += 'Untuk ganti pekerjaan, ketik: `.gantijob <nama_pekerjaan>`\nContoh: `.gantijob petani`';

  await sock.sendMessage(from, { text: list });
};
