const fs = require('fs');

const path = require('path');

module.exports = {

    name: 'menu',

    description: 'Hiển thị tất cả lệnh hiện có trong menu',

    aliases: ['help', 'commands'],

    usage: 'menu',

    cooldown: 3,

    /**

     * Load toàn bộ lệnh trong thư mục `commands` và gửi danh sách ra

     */

    execute(client, message, args) {

        const commandsPath = path.join(__dirname); // chính là thư mục `commands`

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        let menuList = '📋 **Danh sách lệnh có sẵn:**\n\n';

        for (const file of commandFiles) {

            const command = require(path.join(commandsPath, file));

            if (command.name) {

                menuList += `🔹 \`${command.name}\` - ${command.description || 'Không có mô tả'}\n`;

            }

        }

        message.reply(menuList);

    }

};