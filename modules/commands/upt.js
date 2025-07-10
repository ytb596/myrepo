const { EmbedBuilder } = require('discord.js');

const os = require('os');

module.exports = {

    name: 'upt',

    description: 'Hiển thị thời gian hoạt động và thông tin hệ thống của bot',

    aliases: ['uptime', 'bottime', 'stats'],

    usage: 'upt',

    cooldown: 5,

    execute(client, message) {

        const uptime = formatTime(client.uptime);

        const systemUptime = formatTime(os.uptime() * 1000);

        const mem = process.memoryUsage();

        const memoryUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);

        const memoryTotal = (mem.rss / 1024 / 1024).toFixed(2);

        const cpus = os.cpus();

        const cpu = cpus && cpus.length > 0 ? cpus[0].model : 'Không xác định';

        const cpuCores = cpus ? cpus.length : 'Không rõ';

        const platform = `${os.type()} ${os.release()} (${os.arch()})`;

        const ping = Math.round(client.ws.ping);

        const serverCount = client.guilds.cache.size;

        const userCount = client.users.cache.size;

        const embed = new EmbedBuilder()

            .setColor('#2ecc71')

            .setTitle('📊 Thông tin hoạt động & hệ thống')

            .setThumbnail(client.user.displayAvatarURL())

            .addFields(

                { name: '⏱️ Uptime bot', value: uptime, inline: true },

                { name: '⏱️ Uptime máy chủ', value: systemUptime, inline: true },

                { name: '📶 Ping', value: `${ping}ms`, inline: true },

                { name: '💾 RAM', value: `${memoryUsed} MB / ${memoryTotal} MB`, inline: true },

                { name: '🧠 CPU', value: `${cpu} (${cpuCores} cores)`, inline: false },

                { name: '💻 OS', value: platform, inline: false },

                { name: '🖥️ Server', value: `${serverCount}`, inline: true },

                { name: '👥 Users', value: `${userCount}`, inline: true },

            )

            .setFooter({ text: `Yêu cầu bởi: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })

            .setTimestamp();

        message.channel.send({ embeds: [embed] });

    }

};

function formatTime(ms) {

    const s = Math.floor(ms / 1000);

    const d = Math.floor(s / 86400);

    const h = Math.floor((s % 86400) / 3600);

    const m = Math.floor((s % 3600) / 60);

    const sec = s % 60;

    return [

        d ? `${d} ngày` : '',

        h ? `${h} giờ` : '',

        m ? `${m} phút` : '',

        sec ? `${sec} giây` : ''

    ].filter(Boolean).join(', ');

}