// Command handler utility
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

// Create a collection to store commands
const commands = new Collection();

/**
 * Initialize the command handler
 * @param {Client} client Discord client
 */
function init(client) {
    console.log('Đang khởi tạo trình xử lý lệnh...');
    loadCommands();
    
    // Set up message event listener for command execution
    client.on('messageCreate', message => {
        // Ignore messages from bots or messages that don't start with the prefix
        if (message.author.bot || !message.content.startsWith(config.prefix)) return;
        
        // Parse the command name and arguments
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Check if the command exists
        if (!commands.has(commandName)) return;
        
        // Get the command
        const command = commands.get(commandName);
        
        try {
            // Execute the command
            command.execute(client, message, args);
        } catch (error) {
            console.error(`Lỗi khi thực thi lệnh ${commandName}:`, error);
            message.reply('Đã xảy ra lỗi khi thực hiện lệnh này!');
        }
    });
    
    console.log('Trình xử lý lệnh đã được khởi tạo!');
}

/**
 * Load all command modules
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, '..', 'modules', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Đã tìm thấy ${commandFiles.length} tệp lệnh để tải.`);
    
    // Clear existing commands
    commands.clear();
    
    // Load each command file
    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            
            // Clear cache to ensure we get fresh command
            delete require.cache[require.resolve(filePath)];
            
            const command = require(filePath);
            
            // Register the command
            registerCommand(command.name, command);
        } catch (error) {
            console.error(`Lỗi khi tải tệp lệnh ${file}:`, error);
        }
    }
    
    console.log(`Đã tải thành công ${commands.size} lệnh!`);
}

/**
 * Register a command in the collection
 * @param {string} name Command name
 * @param {object} command Command object
 */
function registerCommand(name, command) {
    if (!name || !command || !command.execute) {
        console.error(`Invalid command structure for ${name || 'unknown'}`);
        return;
    }
    
    commands.set(name, command);
    console.log(`Registered command: ${name}`);
    
    // Also register aliases if they exist
    if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => {
            commands.set(alias, command);
            console.log(`Registered alias: ${alias} for command ${name}`);
        });
    }
}

/**
 * Remove a command from the collection
 * @param {string} name Command name
 */
function unregisterCommand(name) {
    if (!name) return;
    
    // Find the command
    const command = commands.get(name);
    
    if (!command) {
        // Try finding by filename without extension
        for (const [cmdName, cmd] of commands.entries()) {
            if (cmdName.toLowerCase() === name.toLowerCase() || 
                (cmd.filename && cmd.filename.replace('.js', '').toLowerCase() === name.toLowerCase())) {
                commands.delete(cmdName);
                console.log(`Unregistered command: ${cmdName}`);
                
                // Also unregister aliases
                if (cmd.aliases && Array.isArray(cmd.aliases)) {
                    cmd.aliases.forEach(alias => {
                        commands.delete(alias);
                        console.log(`Unregistered alias: ${alias} for command ${cmdName}`);
                    });
                }
                
                return;
            }
        }
        return;
    }
    
    commands.delete(name);
    console.log(`Unregistered command: ${name}`);
    
    // Also unregister aliases
    if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => {
            commands.delete(alias);
            console.log(`Unregistered alias: ${alias} for command ${name}`);
        });
    }
}

/**
 * Get all commands
 * @returns {Collection} Commands collection
 */
function getCommands() {
    return commands;
}

module.exports = {
    init,
    loadCommands,
    registerCommand,
    unregisterCommand,
    getCommands
};
