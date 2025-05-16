// Help command - display command information
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const commandHandler = require('../../utils/commandHandler');

module.exports = {
    name: 'help',
    description: 'Hiển thị thông tin trợ giúp về các lệnh',
    aliases: ['trogiup', 'giupdo'],
    usage: 'help [tên lệnh]',
    cooldown: 5,
    
    /**
     * Execute the help command
     * @param {Client} client Discord client
     * @param {Message} message Message object
     * @param {Array} args Command arguments
     */
    execute(client, message, args) {
        const commands = commandHandler.getCommands();
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Danh sách lệnh')
            .setDescription('Dưới đây là danh sách tất cả các lệnh có sẵn:')
            .setTimestamp()
            .setFooter({ text: 'Hệ thống trợ giúp', iconURL: client.user.displayAvatarURL() });
        
        // If no specific command is requested, show all commands
        if (!args.length) {
            // Create a set to track unique commands (exclude aliases)
            const uniqueCommands = new Set();
            
            commands.forEach(command => {
                if (!uniqueCommands.has(command.name)) {
                    uniqueCommands.add(command.name);
                    embed.addFields({
                        name: `${config.prefix}${command.name}`,
                        value: `${command.description || 'Không có mô tả'}`
                    });
                }
            });
            
            embed.addFields({
                name: '\u200b',
                value: `Nhập \`${config.prefix}help [tên lệnh]\` để xem thông tin chi tiết về một lệnh cụ thể!`
            });
            
            return message.channel.send({ embeds: [embed] });
        }
        
        // Show information for a specific command
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || 
                        commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) {
            return message.reply(`Không tìm thấy lệnh nào có tên \`${commandName}\`!`);
        }
        
        embed.setTitle(`Lệnh: ${command.name}`);
        
        if (command.description) embed.addFields({ name: 'Mô tả', value: command.description });
        if (command.aliases) embed.addFields({ name: 'Bí danh', value: command.aliases.join(', ') });
        if (command.usage) embed.addFields({ name: 'Cách sử dụng', value: `${config.prefix}${command.usage}` });
        if (command.cooldown) embed.addFields({ name: 'Thời gian hồi', value: `${command.cooldown} giây` });
        
        message.channel.send({ embeds: [embed] });
    }
};
