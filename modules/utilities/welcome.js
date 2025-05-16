// Welcome utility - Handle welcome messages for new members
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const memoryOptimizer = require('../../utils/memoryOptimizer');

module.exports = {
    name: 'welcome',
    description: 'Xử lý tin nhắn chào mừng cho thành viên mới',
    
    // Define events this utility handles
    events: [
        {
            name: 'guildMemberAdd',
            /**
             * Handle new member joining
             * @param {Client} client Discord client
             * @param {GuildMember} member Guild member who joined
             */
            execute: async (client, member) => {
                try {
                    // Ensure this only runs in guilds
                    if (!member.guild) return;
                    
                    console.log(`Thành viên mới tham gia: ${member.user.tag}`);
                    
                    // Get welcome channel
                    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId) || 
                                           member.guild.systemChannel;
                    
                    if (!welcomeChannel) {
                        console.warn(`Không thể tìm thấy kênh chào mừng cho máy chủ ${member.guild.name}`);
                        return;
                    }
                    
                    // Create welcome embed
                    const embed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('Chào mừng đến với máy chủ!')
                        .setDescription(`Xin chào <@${member.id}>, chào mừng đến với **${member.guild.name}**! Chúng tôi rất vui khi bạn tham gia!`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { 
                                name: '👋 Thành viên thứ', 
                                value: `Bạn là thành viên thứ ${member.guild.memberCount} của chúng tôi!`,
                                inline: true 
                            },
                            { 
                                name: '📅 Tài khoản được tạo', 
                                value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                                inline: true 
                            }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Hệ thống chào mừng', iconURL: client.user.displayAvatarURL() });
                    
                    // Send welcome message
                    await welcomeChannel.send({ 
                        content: `Chào mừng đến với máy chủ, <@${member.id}>! 🎉`,
                        embeds: [embed] 
                    });
                    
                    // Optimize memory usage
                    memoryOptimizer.optimizeObject(embed);
                } catch (error) {
                    console.error('Lỗi trong sự kiện chào mừng:', error);
                }
            }
        }
    ]
};
