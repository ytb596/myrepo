const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './soData.json';

module.exports = {
    name: 'so',
    description: 'Xem giá mua bán số mới nhất từ bot ảo',
    usage: 'so',
    cooldown: 3,

    async execute(client, message) {
        if (!fs.existsSync(path)) {
            return message.reply('Chưa có dữ liệu số. Đợi bot chạy ít nhất 1 giây!');
        }

        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const { buy, sell, lastUpdate } = data;

        const embed = new EmbedBuilder()
            .setColor('#e67e22')
            .setTitle('📈 Thị Trường Số Ảo')
            .addFields(
                { name: '💰 Giá Mua', value: `${buy} đ`, inline: true },
                { name: '💸 Giá Bán', value: `${sell} đ`, inline: true },
                { name: '📊 Chênh lệch', value: `${(sell - buy).toFixed(2)} đ`, inline: false },
                { name: '⏱️ Cập nhật lần cuối', value: `<t:${Math.floor(lastUpdate / 1000)}:R>`, inline: false }
            )
            .setFooter({ text: 'Giá thay đổi mỗi giây — Ảo thôi đừng chốt kèo' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
