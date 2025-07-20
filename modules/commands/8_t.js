const fs = require('fs');

const { EmbedBuilder } = require('discord.js');

const transactionsPath = './transactions.json';

function loadTransactions() {

    if (!fs.existsSync(transactionsPath)) fs.writeFileSync(transactionsPath, '{}');

    return JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

}

function saveTransactions(data) {

    fs.writeFileSync(transactionsPath, JSON.stringify(data, null, 2));

}

module.exports = {

    name: 'ct',

    description: 'Chuyển số ảo cho người khác',

    usage: 'ct @user <số lượng>',

    cooldown: 5,

    async execute(client, message, args) {

        const mention = message.mentions.users.first();

        const amount = parseInt(args[1]);

        if (!mention || isNaN(amount) || amount <= 0) {

            return message.reply('❌ Cú pháp sai. Dùng: `ct @user <số lượng>`');

        }

        const senderId = message.author.id;

        const receiverId = mention.id;

        if (senderId === receiverId) {

            return message.reply('❌ Không thể chuyển cho chính mình.');

        }

        const transactions = loadTransactions();

        // Khởi tạo nếu chưa có

        if (!transactions[senderId]) transactions[senderId] = { username: message.author.username, bought: 0, sold: 0, spent: 0, earned: 0 };

        if (!transactions[receiverId]) transactions[receiverId] = { username: mention.username, bought: 0, sold: 0, spent: 0, earned: 0 };

        const sender = transactions[senderId];

        const receiver = transactions[receiverId];

        const senderOwned = (sender.bought || 0) - (sender.sold || 0);

        if (amount > senderOwned) {

            return message.reply(`❌ Bạn chỉ có ${senderOwned} số để chuyển.`);

        }

        // Thực hiện chuyển

        sender.bought -= amount;

        receiver.bought += amount;

        saveTransactions(transactions);

        const embed = new EmbedBuilder()

            .setColor('#1abc9c')

            .setTitle('💸 Chuyển Số Thành Công')

            .setDescription(`${message.author.username} đã chuyển **${amount} số** cho ${mention.username}.`)

            .addFields(

                { name: '📤 Từ', value: `${message.author.username}`, inline: true },

                { name: '📥 Đến', value: `${mention.username}`, inline: true },

                { name: '🔢 Số lượng', value: `${amount} số`, inline: true }

            )

            .setTimestamp();

        message.channel.send({ embeds: [embed] });

    }

};