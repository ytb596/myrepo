const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'ask',
    description: 'Hỏi AI Qwen bất cứ điều gì!',
    usage: 'ask <câu hỏi>',
    cooldown: 3,

    async execute(client, message, args) {
        if (!args.length) return message.reply('Mày định hỏi gì? Gõ câu hỏi sau lệnh `ask`.');

        const query = encodeURIComponent(args.join(' '));
        const url = `https://qwen-ai.apis-bj-devs.workers.dev/?text=${query}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success || !data.content) return message.reply('Không nhận được phản hồi từ AI. API ngu hoặc die.');

            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('🤖 Qwen AI trả lời')
                .addFields(
                    { name: '❓ Câu hỏi', value: args.join(' '), inline: false },
                    { name: '💬 Trả lời', value: data.content, inline: false }
                )
                .setFooter({ text: 'API by @BJ_Coder — Powered by Qwen AI' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply('Lỗi khi kết nối API. Gọi lại sau hoặc đấm chủ API.');
        }
    }
};
