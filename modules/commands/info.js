// Info command - display bot information
const { EmbedBuilder, version: djsVersion } = require('discord.js');
const { version } = require('../../package.json');
const memoryOptimizer = require('../../utils/memoryOptimizer');
const os = require('os');

module.exports = {
    name: 'info',
    description: 'Hiển thị thông tin và thống kê về bot',
    aliases: ['thongtin', 'bot'],
    usage: 'info',
    cooldown: 10,
    
    /**
     * Execute the info command
     * @param {Client} client Discord client
     * @param {Message} message Message object
     * @param {Array} args Command arguments
     */
    execute(client, message, args) {
        // Calculate uptime
        const uptime = formatUptime(client.uptime);
        
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
        
        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Thông tin Bot')
            .setDescription(`Thông tin và thống kê về bot`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🤖 Tên Bot', value: client.user.username, inline: true },
                { name: '🆔 ID Bot', value: client.user.id, inline: true },
                { name: '📊 Số máy chủ', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Số người dùng', value: `${client.users.cache.size}`, inline: true },
                { name: '📡 Độ trễ API', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '⏱️ Thời gian hoạt động', value: uptime, inline: true },
                { 
                    name: '💾 Sử dụng bộ nhớ', 
                    value: `${memoryUsedMB} MB / ${memoryTotalMB} MB`, 
                    inline: true 
                },
                { name: '🔧 Node.js', value: process.version, inline: true },
                { name: '📚 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '📦 Phiên bản Bot', value: `v${version || '1.0.0'}`, inline: true },
                { 
                    name: '💻 Hệ thống', 
                    value: `${os.type()} ${os.arch()} (${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB)`, 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Hệ thống thông tin Bot', iconURL: client.user.displayAvatarURL() });
        
        message.channel.send({ embeds: [embed] });
        
        // Run memory optimization
        memoryOptimizer.runGarbageCollection();
    }
};

/**
 * Format bot uptime in a readable format
 * @param {number} uptime Uptime in milliseconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(uptime) {
    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0) parts.push(`${seconds} giây`);
    
    return parts.join(', ');
}
