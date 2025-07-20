const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const config = require('./config.json'); // Lấy cấu hình từ file JSON

const filesDir = __dirname; // Thư mục hiện tại

function getFiles() {
  return fs.readdirSync(filesDir)
    .filter(f => f !== path.basename(__filename)) // loại trừ file này
    .sort();
}

function renameFiles(files) {
  files.forEach((file, index) => {
    const oldPath = path.join(filesDir, file);
    const newFileName = `${index + 1}_${file.replace(/^\d+_/, '')}`;
    const newPath = path.join(filesDir, newFileName);
    if (oldPath !== newPath) fs.renameSync(oldPath, newPath);
  });
}

module.exports = {
  name: 'file',
  description: 'Quản lý file trong thư mục lệnh',
  usage: 'file <gui|xoa|list> [số thứ tự]',
  cooldown: 3,

  async execute(client, message, args) {
    const subcommand = args[0];
    if (!subcommand || !['gui', 'xoa', 'list'].includes(subcommand)) {
      return message.reply('❌ Cú pháp sai. Dùng: `file <gui|xoa|list> [số thứ tự]`');
    }

    const userId = message.author.id;

    // Kiểm tra quyền admin
    const isAdmin = config.admins.includes(userId) || userId === config.ownerId;
    if ((subcommand === 'gui' || subcommand === 'xoa') && !isAdmin) {
      return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
    }

    let files = getFiles();

    if (subcommand === 'list') {
      if (files.length === 0) return message.reply('❌ Thư mục không có file nào.');

      const embed = new EmbedBuilder()
        .setTitle('📂 Danh sách file trong thư mục')
        .setColor('#0099ff')
        .setDescription(files.map((file, i) => `**${i + 1}.** ${file}`).join('\n'))
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    const index = parseInt(args[1]);
    if (isNaN(index) || index < 1 || index > files.length) {
      return message.reply(`❌ Vui lòng nhập số thứ tự hợp lệ (1 - ${files.length})`);
    }

    const fileName = files[index - 1];
    const filePath = path.join(filesDir, fileName);

    if (subcommand === 'gui') {
      return message.channel.send({ files: [filePath] });
    }

    if (subcommand === 'xoa') {
      try {
        fs.unlinkSync(filePath);
        files = getFiles();
        renameFiles(files);

        return message.reply(`✅ Đã xóa file **${fileName}** và cập nhật số thứ tự.`);
      } catch (err) {
        console.error(err);
        return message.reply('❌ Đã có lỗi khi xóa file.');
      }
    }
  },
};
