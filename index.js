require('./soAuto');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const fs = require('fs');

const path = require('path');

const config = require('./config.json');

const commandHandler = require('./utils/commandHandler');

const eventHandler = require('./utils/eventHandler');

const memoryOptimizer = require('./utils/memoryOptimizer');

const botInstances = new Map();

// ==== ĐỌC FILE .env ====

function loadEnvFile() {

    const envData = {};

    if (fs.existsSync('.env')) {

        const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);

        for (const line of lines) {

            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('#')) continue;

            const [key, ...val] = trimmed.split('=');

            envData[key.trim()] = val.join('=').trim();

        }

    }

    return envData;

}

// ==== GHI VÀO .env ====

function writeEnvKey(key, value) {

    const current = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';

    const exists = current.includes(`${key}=`);

    if (!exists) {

        fs.appendFileSync('.env', `\n${key}=${value}`);

    }

}

// ==== TẠO BOT ====

function createBotInstance(token, isMain = false) {

    if (botInstances.has(token)) {

        console.log(`⚠️ Bot với token này đã được khởi chạy.`);

        return;

    }

    const bot = new Client({

        intents: [

            GatewayIntentBits.Guilds,

            GatewayIntentBits.GuildMessages,

            GatewayIntentBits.MessageContent,

            GatewayIntentBits.GuildMembers,

        ],

        partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],

    });

    commandHandler.init(bot);

    eventHandler.init(bot);

    memoryOptimizer.optimize(bot);

    bot.on('messageCreate', async (message) => {

        if (!message.guild || message.author.bot) return;

        const args = message.content.trim().split(/\s+/);

        const command = args.shift().toLowerCase();

        if (command === '!addbot') {

            const newToken = args[0];

            const authorId = message.author.id;

            if (!newToken) return message.reply('⚠️ Vui lòng cung cấp token bot phụ.');

            const envKey = `BOT_TOKEN_${authorId}`;

            const currentBotCount = Array.from(botInstances.keys()).filter(key => key !== config.token).length;

            if (currentBotCount >= 10) {

                return message.reply('🚫 Đã đạt giới hạn 10 bot phụ.');

            }

            if (loadEnvFile()[envKey]) {

                return message.reply('❌ Bạn chỉ được thêm 1 bot phụ.');

            }

            writeEnvKey(envKey, newToken);

            if (!config.admins) config.admins = [];

            if (!config.admins.includes(authorId)) {

                config.admins.push(authorId);

                fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));

                console.log(`👑 Thêm admin: ${authorId}`);

            }

            message.reply('✅ Bot phụ đã được thêm. Đang khởi động...');

            setTimeout(() => createBotInstance(newToken), 1000);

            return;

        }

        if (command === '!restart') {

            const authorId = message.author.id;

            if (!config.admins.includes(authorId)) {

                return message.reply('❌ Bạn không có quyền.');

            }

            message.reply('🔁 Restart bot...');

            process.exit(0);

        }

    });

    bot.login(token).then(() => {

        console.log(`🤖 Bot đăng nhập: ${bot.user.tag}`);

        memoryOptimizer.reportMemoryUsage();

        setInterval(() => {

            memoryOptimizer.reportMemoryUsage();

            memoryOptimizer.runGarbageCollection();

        }, 60 * 60 * 1000); // 1 tiếng

    }).catch(err => {

        console.error(`❌ Lỗi đăng nhập bot:`, err.message);

    });

    botInstances.set(token, bot);

}

// ==== KHỞI ĐỘNG BOT CHÍNH ====

createBotInstance(config.token, true);

// ==== KHỞI ĐỘNG BOT PHỤ ====

const envData = loadEnvFile();

for (const key in envData) {

    if (key.startsWith('BOT_TOKEN_')) {

        createBotInstance(envData[key]);

    }

}

// ==== HOT RELOAD COMMANDS ====

const commandsPath = path.join(__dirname, 'modules', 'commands');

fs.watch(commandsPath, (eventType, filename) => {

    if (!filename.endsWith('.js')) return;

    const filePath = path.join(commandsPath, filename);

    try {

        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        if (eventType === 'rename' && !fs.existsSync(filePath)) {

            commandHandler.unregisterCommand(command.name);

            console.log(`❌ Xoá lệnh: ${command.name}`);

        } else {

            commandHandler.registerCommand(command.name, command);

            console.log(`🔁 Reload lệnh: ${command.name}`);

        }

    } catch (e) {

        console.error(`⚠️ Lỗi reload lệnh ${filename}`, e);

    }

});

// ==== HOT RELOAD TIỆN ÍCH ====

const utilitiesPath = path.join(__dirname, 'modules', 'utilities');

fs.watch(utilitiesPath, (eventType, filename) => {

    if (!filename) return;

    const filePath = path.join(utilitiesPath, filename);

    try {

        delete require.cache[require.resolve(filePath)];

        eventHandler.loadEvents(); // Có thể cần thay đổi logic này nếu sự kiện theo bot

        console.log(`🔁 Reload tiện ích: ${filename}`);

    } catch (e) {

        console.error(`⚠️ Lỗi reload tiện ích ${filename}`, e);

    }

});

// ==== TẮT BOT ====

process.on('SIGINT', () => {

    console.log('🛑 Tắt bot...');

    for (const bot of botInstances.values()) {

        bot.destroy();

    }

    process.exit(0);

});

process.on('unhandledRejection', console.error);

process.on('uncaughtException', console.error);