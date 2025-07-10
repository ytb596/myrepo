// UID command - Hiển thị ID người dùng và kênh

const { EmbedBuilder } = require('discord.js');

module.exports = {

    name: 'uid',

    description: 'Hiển thị ID của người dùng và kênh hiện tại',

    aliases: ['id', 'showid'],

    usage: 'uid [@người_dùng]',

    cooldown: 3,

    

    /**

     * Execute the uid command

     * @param {Client} client Discord client

     * @param {Message} message Message object

     * @param {Array} args Command arguments

     */

    execute(client, message, args) {

        // Lấy thông tin người dùng được đề cập hoặc người gửi tin nhắn

        const target = message.mentions.users.first() || message.author;

        const member = message.guild.members.cache.get(target.id);

        

        // Tạo embed hiển thị thông tin

        const embed = new EmbedBuilder()

            .setColor('#1abc9c')

            .setTitle('Thông tin ID')

            .setThumbnail(target.displayAvatarURL({ dynamic: true }))

            .addFields(

                { 

                    name: '👤 ID Người dùng', 

                    value: `\`${target.id}\``,

                    inline: true 

                },

                { 

                    name: '🏷️ Tag', 

                    value: `\`${target.tag}\``,

                    inline: true 

                },

                { 

                    name: '📅 Ngày tham gia máy chủ', 

                    value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Không xác định',

                    inline: false 

                },

                { 

                    name: '#️⃣ ID Kênh hiện tại', 

                    value: `\`${message.channel.id}\``,

                    inline: true 

                },

                { 

                    name: '🏠 ID Máy chủ', 

                    value: `\`${message.guild.id}\``,

                    inline: true 

                }

            )

            .setFooter({ text: 'Sử dụng !uid @người_dùng để xem ID của người khác' })

            .setTimestamp();

            

        // Nếu đây là người dùng khác với người gửi lệnh, hiển thị thông tin bổ sung

        if (target.id !== message.author.id) {

            embed.setDescription(`Hiển thị thông tin ID của ${target}`);

        }

        

        message.reply({ embeds: [embed] });

    }

};