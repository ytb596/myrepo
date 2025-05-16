const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'inff',
    description: 'Lấy thông tin tài khoản Free Fire',
    usage: 'inff <UID>',
    cooldown: 5,

    async execute(client, message, args) {
        if (!args[0]) return message.reply('Nhập UID vào mày ơi!');

        const uid = args[0];
        const url = `https://accinfo.vercel.app/player-info?region=SG&uid=${uid}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('API lỗi hoặc UID không tồn tại');

            const data = await res.json();
            const basic = data.basicInfo;
            const clan = data.clanBasicInfo || {};
            const credit = data.creditScoreInfo || {};

            const embed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle(`🔍 Thông tin người chơi: ${basic.nickname || 'Không tên'}`)
                .addFields(
                    { name: 'UID', value: basic.accountId, inline: true },
                    { name: 'Region', value: basic.region || 'N/A', inline: true },
                    { name: 'Level', value: `${basic.level}`, inline: true },
                    { name: 'Rank', value: `${basic.rank}`, inline: true },
                    { name: 'CS Rank', value: `${basic.csRank}`, inline: true },
                    { name: 'Credit Score', value: `${credit.creditScore || 'Không rõ'}`, inline: true },
                    { name: 'Clan', value: clan.clanName || 'Không có', inline: true },
                    { name: 'Số like', value: `${basic.liked}`, inline: true },
                    { name: 'Season', value: `${basic.seasonId}`, inline: true },
                    { name: 'Exp', value: `${basic.exp}`, inline: true },
                    { name: 'Phiên bản', value: basic.releaseVersion || 'N/A', inline: true },
                    { name: 'Ngày tạo acc', value: `<t:${Math.floor(parseInt(basic.createAt))}:F>`, inline: false },
                    { name: 'Online lần cuối', value: `<t:${Math.floor(parseInt(basic.lastLoginAt))}:R>`, inline: true }
                )
                .setFooter({ text: `Yêu cầu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply('Lấy thông tin lỗi. UID sai hoặc server API toang.');
        }
    }
};
