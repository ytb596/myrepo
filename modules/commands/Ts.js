const fs = require('fs');

const { EmbedBuilder } = require('discord.js');

const transactionsPath = './transactions.json';

const START_AMOUNT = 441;

module.exports = {

    name: 'rs',

    description: 'Đăng ký tài khoản số ảo và nhận 441 số miễn phí',

    usage: 'rs',

    cooldown: 100,

    async execute(client, message) {

        const userId = message.author.id;

        const username = message.author.username;

        // Tạo file nếu chưa tồn tại

        if (!fs.existsSync(transactionsPath)) {

            fs.writeFileSync(transactionsPath, '{}');

        }

        const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

        // Kiểm tra đã đăng ký chưa

        if (transactions[userId]) {

            return message.reply('❌ Bạn đã đăng ký rồi!');

        }

        // Tạo tài khoản mới

        transactions[userId] = {

            username: username,

            bought: START_AMOUNT,

            spent: 0,

            sold: 0,

            earned: 0

        };

        fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));

        // Gửi thông báo thành công

        const embed = new EmbedBuilder()

            .setColor('#3498db')

            .setTitle('✅ Đăng Ký Thành Công')

            .setDescription(`Xin chào ${username}! Bạn đã nhận **${START_AMOUNT} số ảo** miễn phí.`)

            .setFooter({ text: 'Hãy sử dụng số ảo một cách khôn ngoan nhé!' })

            .setTimestamp();

        message.channel.send({ embeds: [embed] });

    }

};