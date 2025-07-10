const { EmbedBuilder } = require('discord.js');

module.exports = {

    name: 'gioithieu',

    description: 'Giới thiệu về bot MIRVN-1',

    aliases: ['about', 'introduce'],

    usage: 'gioithieu',

    cooldown: 5,

    /**

     * @param {import('discord.js').Client} client 

     * @param {import('discord.js').Message} message 

     * @param {Array<string>} args 

     */

    execute(client, message, args) {

        try {

            // Tạo embed giới thiệu bot

            const embed = new EmbedBuilder()

                .setColor('#3498db')

                .setTitle('🤖 Giới thiệu về MIRVN-1')

                .setThumbnail(client.user.displayAvatarURL())

                .setDescription(

                    `Chào mừng bạn đã đến với **MIRVN-1**!\n\n` +

                    `🎯 **Mục tiêu:** Làm hài lòng "vị", dù chỉ với vài lệnh đơn giản.\n\n` +

                    `📌 Dù bot chưa có nhiều chức năng, nhưng chúng tôi luôn cải tiến và phát triển.\n\n` +

                    `💬 Nếu có góp ý, đừng ngần ngại chia sẻ để MIRVN-1 trở nên tốt hơn!`

                )

                .addFields(

                    {

                        name: '📚 Tổng số lệnh',

                        value: `\`${client.commands ? client.commands.size : 'Không xác định'}\``,

                        inline: true

                    },

                    {

                        name: '📅 Khởi chạy từ',

                        value: client.readyTimestamp ? `<t:${Math.floor(client.readyTimestamp / 1000)}:D>` : 'Không xác định',

                        inline: true

                    },

                    {

                        name: '👤 Người tạo',

                        value: 'Ngọc Nhi Nguyễn',

                        inline: true

                    }

                )

                .setFooter({ text: `Được yêu cầu bởi: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })

                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {

            console.error('Lỗi khi thực hiện lệnh gioithieu:', error);

            message.reply('❌ Đã xảy ra lỗi khi thực hiện lệnh này!');

        }

    }

};