const fs = require('fs');

const { EmbedBuilder } = require('discord.js');

const soDataPath = './soData.json';

const transactionsPath = './transactions.json';

const MAX_SUPPLY = 1000000;

function loadData() {

    if (!fs.existsSync(soDataPath)) return null;

    const data = JSON.parse(fs.readFileSync(soDataPath, 'utf8'));

    return data;

}

function loadTransactions() {

    if (!fs.existsSync(transactionsPath)) fs.writeFileSync(transactionsPath, '{}');

    return JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

}

function saveTransactions(data) {

    fs.writeFileSync(transactionsPath, JSON.stringify(data, null, 2));

}

function getEmoji(change) {

    return change > 0 ? '📈' : change < 0 ? '📉' : '⚖️';

}

function formatNumber(num) {

    return num.toLocaleString('vi-VN');

}

module.exports = {

    name: 'so',

    description: 'Giá và giao dịch số ảo (so, mua, ban, vi, top)',

    usage: 'so | mua <số> | ban <số> | vi | top',

    cooldown: 3,

    async execute(client, message, args) {

        const sub = args[0]?.toLowerCase();

        const amount = parseInt(args[1]);

        const data = loadData();

        if (!data) return message.reply('❌ Dữ liệu thị trường chưa sẵn sàng.');

        const { buy, sell, lastUpdate, previousBuy } = data;

        const change = buy - previousBuy;

        const percent = previousBuy > 0 ? ((change / previousBuy) * 100).toFixed(2) : '0.00';

        const emoji = getEmoji(change);

        const transactions = loadTransactions();

        const userId = message.author.id;

        const username = message.author.username;

        const userData = transactions[userId] || { username, bought: 0, spent: 0, sold: 0, earned: 0 };

        if (!sub || sub === 'so') {

            // Lệnh xem giá

            const embed = new EmbedBuilder()

                .setColor(change > 0 ? '#2ecc71' : change < 0 ? '#e74c3c' : '#95a5a6')

                .setTitle(`${emoji} Thị Trường Số Ảo`)

                .addFields(

                    { name: '💰 Giá Mua', value: `${formatNumber(buy)} đ`, inline: true },

                    { name: '💸 Giá Bán', value: `${formatNumber(sell)} đ`, inline: true },

                    { name: '📊 Biến Động', value: `${change.toFixed(2)} đ (${percent}%)`, inline: true },

                    { name: '⏱️ Cập nhật', value: `<t:${Math.floor(lastUpdate / 1000)}:R>`, inline: false }

                )

                .setFooter({ text: 'Giá thay đổi mỗi giây — Đầu tư bằng niềm tin 🤖' })

                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        }

        // Tính tổng cung đã bán

        const totalBought = Object.values(transactions).reduce((s, u) => s + (u.bought || 0), 0);

        const remaining = MAX_SUPPLY - totalBought;

        if (sub === 'mua') {

            if (isNaN(amount) || amount <= 0) {

                return message.reply('❌ Nhập số lượng hợp lệ. Ví dụ: `so mua 100`');

            }

            if (amount > remaining) {

                return message.reply(`⚠️ Chỉ còn lại ${remaining} số trong thị trường.`);

            }

            const totalCost = parseFloat((buy * amount).toFixed(2));

            userData.bought += amount;

            userData.spent += totalCost;

            transactions[userId] = userData;

            saveTransactions(transactions);

            const embed = new EmbedBuilder()

                .setColor('#2ecc71')

                .setTitle(`✅ Mua Thành Công`)

                .setDescription(`Bạn đã mua **${amount} số** với giá **${formatNumber(buy)} đ/số**.`)

                .addFields(

                    { name: '💸 Tổng Chi Phí', value: `${formatNumber(totalCost)} đ`, inline: true },

                    { name: '📦 Còn lại', value: `${remaining - amount} số`, inline: true },

                    { name: '📊 Biến động', value: `${change.toFixed(2)} đ (${percent}%)`, inline: true }

                )

                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        }

        if (sub === 'ban') {

            if (isNaN(amount) || amount <= 0) {

                return message.reply('❌ Nhập số lượng hợp lệ. Ví dụ: `so ban 50`');

            }

            if (userData.bought - (userData.sold || 0) < amount) {

                return message.reply('⚠️ Bạn không đủ số để bán.');

            }

            const revenue = parseFloat((sell * amount).toFixed(2));

            userData.sold = (userData.sold || 0) + amount;

            userData.earned = (userData.earned || 0) + revenue;

            transactions[userId] = userData;

            saveTransactions(transactions);

            const embed = new EmbedBuilder()

                .setColor('#e67e22')

                .setTitle(`✅ Bán Thành Công`)

                .setDescription(`Bạn đã bán **${amount} số** với giá **${formatNumber(sell)} đ/số**.`)

                .addFields(

                    { name: '💰 Tổng Thu Về', value: `${formatNumber(revenue)} đ`, inline: true },

                    { name: '📊 Biến động', value: `${change.toFixed(2)} đ (${percent}%)`, inline: true }

                )

                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        }

        if (sub === 'vi') {

            const owned = (userData.bought || 0) - (userData.sold || 0);

            const profit = ((userData.earned || 0) - (userData.spent || 0)).toFixed(2);

            const embed = new EmbedBuilder()

                .setColor('#3498db')

                .setTitle(`👛 Ví Số Ảo của ${username}`)

                .addFields(

                    { name: '🔢 Đang nắm giữ', value: `${owned} số`, inline: true },

                    { name: '💰 Đã chi', value: `${formatNumber(userData.spent || 0)} đ`, inline: true },

                    { name: '💵 Thu về', value: `${formatNumber(userData.earned || 0)} đ`, inline: true },

                    { name: '📈 Lợi nhuận', value: `${formatNumber(profit)} đ`, inline: true }

                )

                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        }

        if (sub === 'top') {

            const sorted = Object.entries(transactions)

                .sort((a, b) => ((b[1].bought || 0) - (b[1].sold || 0)) - ((a[1].bought || 0) - (a[1].sold || 0)))

                .slice(0, 10);

            const lines = sorted.map(([id, u], i) => {

                const holding = (u.bought || 0) - (u.sold || 0);

                return `**#${i + 1}** ${u.username}: ${holding} số`;

            });

            const embed = new EmbedBuilder()

                .setColor('#f1c40f')

                .setTitle('🏆 Top Nhà Đầu Tư Số Ảo')

                .setDescription(lines.join('\n'))

                .setFooter({ text: 'Chỉ tính theo số đang nắm giữ' })

                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        }

        return message.reply('❓ Lệnh không hợp lệ. Dùng: `so`, `so mua <số>`, `so ban <số>`, `so vi`, `so top`');

    }

};