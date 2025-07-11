const fs = require('fs');

const path = require('path');

const ADMIN_BOT_ID = '1371358649771102241'; // 👉 Thay ID này bằng ID thật của admin bot

module.exports = {

    name: 'cmd',

    description: 'Tạo file hoặc liệt kê file trong thư mục hiện tại (chỉ admin bot)',

    usage: 'cmd <add/list> [tên_file] [nội_dung]',

    cooldown: 3,

    execute(client, message, args) {

        // Kiểm tra xem người gửi có phải là admin bot không

        if (message.author.id !== ADMIN_BOT_ID) {

            return message.reply('❌ Bạn không có quyền sử dụng lệnh này. Chỉ admin bot mới được phép.');

        }

        const subCommand = args[0];

        const currentDir = __dirname;

        if (!subCommand || !['add', 'list'].includes(subCommand)) {

            return message.reply('❌ Cú pháp sai. Dùng: `cmd add <tên_file> <nội_dung>` hoặc `cmd list`');

        }

        if (subCommand === 'add') {

            const fileName = args[1];

            const content = args.slice(2).join(' ');

            if (!fileName || !content) {

                return message.reply('⚠️ Vui lòng cung cấp đầy đủ `tên_file` và `nội_dung`.');

            }

            const filePath = path.join(currentDir, `${fileName}.js`);

            if (fs.existsSync(filePath)) {

                return message.reply('⚠️ File đã tồn tại. Vui lòng chọn tên khác hoặc xóa file cũ.');

            }

            fs.writeFile(filePath, content, (err) => {

                if (err) {

                    console.error(err);

                    return message.reply('❌ Lỗi khi tạo file.');

                }

                message.reply(`✅ File \`${fileName}.js\` đã được tạo thành công.`);

            });

        }

        if (subCommand === 'list') {

            const files = fs.readdirSync(currentDir).filter(file => file.endsWith('.js'));

            if (files.length === 0) {

                return message.reply('📭 Không có file `.js` nào trong thư mục.');

            }

            const fileList = files.map(file => `📄 ${file}`).join('\n');

            message.reply(`📂 **Danh sách file trong thư mục:**\n\n${fileList}`);

        }

    }

};
