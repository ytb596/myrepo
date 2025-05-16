// Main bot entry point
require('./soAuto'); // chạy tạo số mỗi giây
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const commandHandler = require('./utils/commandHandler');
const eventHandler = require('./utils/eventHandler');
const memoryOptimizer = require('./utils/memoryOptimizer');

// Create the Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
});

// Initialize command and event handlers
commandHandler.init(client);
eventHandler.init(client);

// Setup memory optimization
memoryOptimizer.optimize(client);

// Watch for command file changes
const commandsPath = path.join(__dirname, 'modules', 'commands');
const commandWatcher = fs.watch(commandsPath, (eventType, filename) => {
    if (!filename) return;
    
    const commandPath = path.join(commandsPath, filename);
    
    // Check if the file exists
    try {
        // File was added or modified
        if (fs.existsSync(commandPath)) {
            console.log(`Tệp lệnh ${filename} đã được ${eventType === 'rename' ? 'thêm' : 'sửa đổi'}`);
            
            // Clear command from cache if it exists
            delete require.cache[require.resolve(commandPath)];
            
            // Reload command
            const command = require(commandPath);
            commandHandler.registerCommand(command.name, command);
            console.log(`Đã tải lại lệnh: ${command.name}`);
        } 
        // File was deleted
        else if (eventType === 'rename') {
            // Find the command name from our collection to remove it
            const commandName = filename.replace('.js', '');
            commandHandler.unregisterCommand(commandName);
            console.log(`Đã hủy đăng ký lệnh: ${commandName}`);
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý thay đổi tệp lệnh cho ${filename}:`, error);
    }
});

// Watch for utility file changes
const utilitiesPath = path.join(__dirname, 'modules', 'utilities');
const utilityWatcher = fs.watch(utilitiesPath, (eventType, filename) => {
    if (!filename) return;
    
    const utilityPath = path.join(utilitiesPath, filename);
    
    try {
        // File was added or modified
        if (fs.existsSync(utilityPath)) {
            console.log(`Tệp tiện ích ${filename} đã được ${eventType === 'rename' ? 'thêm' : 'sửa đổi'}`);
            
            // Clear from cache if it exists
            delete require.cache[require.resolve(utilityPath)];
            
            // Reload utility
            eventHandler.loadEvents();
            console.log(`Đã tải lại các tiện ích`);
        } 
        // No need to handle deletion specifically for utilities as they'll be reloaded
    } catch (error) {
        console.error(`Lỗi khi xử lý thay đổi tệp tiện ích cho ${filename}:`, error);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Đang đóng các trình theo dõi tệp và tắt bot...');
    commandWatcher.close();
    utilityWatcher.close();
    client.destroy();
    process.exit(0);
});

// Login to Discord
const tokenEncoder = require('./utils/tokenEncoder');
const token = config.encodedToken ? tokenEncoder.decodeToken(config.encodedToken) : config.token;
client.login(token).then(() => {
    console.log(`Bot đã đăng nhập với tên ${client.user.tag}`);
    
    // Report memory usage
    memoryOptimizer.reportMemoryUsage();
    
    // Set up interval to report memory usage periodically
    setInterval(() => {
        memoryOptimizer.reportMemoryUsage();
        memoryOptimizer.runGarbageCollection();
    }, 3600000); // Mỗi giờ
});

// Error handling
client.on('error', error => {
    console.error('Lỗi client Discord:', error);
});

process.on('uncaughtException', error => {
    console.error('Lỗi ngoại lệ không được xử lý:', error);
});

process.on('unhandledRejection', error => {
    console.error('Lỗi promise không được xử lý:', error);
});
