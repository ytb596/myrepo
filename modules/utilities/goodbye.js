// Goodbye utility - Handle goodbye messages when members leave
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const memoryOptimizer = require('../../utils/memoryOptimizer');

module.exports = {
    name: 'goodbye',
    description: 'Xử lý tin nhắn tạm biệt khi thành viên rời máy chủ',
    
    // Define events this utility handles
    events: [
        {
            name: 'guildMemberRemove',
            /**
             * Handle member leaving
             * @param {Client} client Discord client
             * @param {GuildMember} member Guild member who left
             */
            execute: async (client, member) => {
                try {
                    // Ensure this only runs in guilds
                    if (!member.guild) return;
                    
                    console.log(`Thành viên đã rời: ${member.user.tag}`);
                    
                    // Get goodbye channel
                    const goodbyeChannel = member.guild.channels.cache.get(config.goodbyeChannelId) || 
                                           member.guild.systemChannel;
                    
                    if (!goodbyeChannel) {
                        console.warn(`Không thể tìm thấy kênh tạm biệt cho máy chủ ${member.guild.name}`);
                        return;
                    }
                    
                    // Calculate how long the user was in the server
                    const joinedTimestamp = member.joinedTimestamp;
                    let memberDuration = '';
                    
                    if (joinedTimestamp) {
                        const duration = Date.now() - joinedTimestamp;
                        memberDuration = formatDuration(duration);
                    } else {
                        memberDuration = 'Không xác định';
                    }
                    
                    // Create goodbye embed
                    const embed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setTitle('Thành viên đã rời')
                        .setDescription(`**${member.user.tag}** đã rời khỏi máy chủ.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { 
                                name: '👥 Số thành viên hiện tại', 
                                value: `${member.guild.memberCount} thành viên`,
                                inline: true 
                            },
                            { 
                                name: '⏱️ Thời gian trong máy chủ', 
                                value: memberDuration,
                                inline: true 
                            }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Hệ thống tạm biệt', iconURL: client.user.displayAvatarURL() });
                    
                    // Send goodbye message
                    await goodbyeChannel.send({ embeds: [embed] });
                    
                    // Optimize memory usage
                    memoryOptimizer.optimizeObject(embed);
                } catch (error) {
                    console.error('Lỗi trong sự kiện tạm biệt:', error);
                }
            }
        }
    ]
};

/**
 * Format duration in milliseconds to a readable string
 * @param {number} ms Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
        return `${years} năm và ${months % 12} tháng`;
    } else if (months > 0) {
        return `${months} tháng và ${days % 30} ngày`;
    } else if (days > 0) {
        return `${days} ngày và ${hours % 24} giờ`;
    } else if (hours > 0) {
        return `${hours} giờ và ${minutes % 60} phút`;
    } else if (minutes > 0) {
        return `${minutes} phút và ${seconds % 60} giây`;
    } else {
        return `${seconds} giây`;
    }
}
