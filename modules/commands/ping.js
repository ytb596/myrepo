// Ping command - simple latency check
module.exports = {
    name: 'ping',
    description: 'Kiểm tra độ trễ của bot',
    aliases: ['pingpong', 'ketnoi'],
    usage: 'ping',
    cooldown: 5,
    
    /**
     * Execute the ping command
     * @param {Client} client Discord client
     * @param {Message} message Message object
     * @param {Array} args Command arguments
     */
    execute(client, message, args) {
        // Calculate latency
        const startTime = Date.now();
        
        message.reply('Đang kiểm tra kết nối...').then(sentMessage => {
            const endTime = Date.now();
            const latency = endTime - startTime;
            const apiLatency = Math.round(client.ws.ping);
            
            // Edit the original message with the latency information
            sentMessage.edit(
                `🏓 Pong!\n` +
                `📥 Độ trễ tin nhắn: ${latency}ms\n` +
                `📡 Độ trễ API: ${apiLatency}ms`
            );
        });
    }
};
