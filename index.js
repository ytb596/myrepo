require('./soAuto');

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const commandHandler = require('./utils/commandHandler');
const eventHandler = require('./utils/eventHandler');
const memoryOptimizer = require('./utils/memoryOptimizer');

const botInstances = new Map();

// ==== TỰ ĐỌC FILE .env (KHÔNG DÙNG dotenv) ====
function loadEnvFile() {
    const envData = {};
    if (fs.existsSync('.env')) {
        const lines = fs.readFileSync('.env', 'utf8').split('\n');
        for (const line of lines) {
            if (!line.trim() || line.startsWith('#')) continue;
            const [key, ...val] = line.split('=');
            envData[key.trim()] = val.join('=').trim();
        }
    }
    return envData;
}

// ==== TẠO BOT CHÍNH HOẶC PHỤ ====
function createBotInstance(token, isMain = false) {
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

        // ==== !addbot - Ai cũng dùng được ====
        if (command === '!addbot') {
            const newToken = args[0];
            const authorId = message.author.id;

            if (!newToken) return message.reply('⚠️ Vui lòng cung cấp token bot phụ.');

            const envKey = `BOT_TOKEN_${authorId}`;
            const currentEnv = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
            const envLines = currentEnv.split('\n');

            // ==== Giới hạn tối đa 10 bot phụ đang hoạt động ====
            const currentBotCount = Array.from(botInstances.keys()).filter(key => key !== mainToken).length;
            if (currentBotCount >= 10) {
                return message.reply('🚫 Đã đạt giới hạn 10 bot phụ đang hoạt động. Không thể thêm bot mới.');
            }

            // ==== Mỗi người chỉ được có 1 bot phụ ====
            const hasExistingBot = envLines.some(line => line.trim().startsWith(`BOT_TOKEN_${authorId}=`));
            if (hasExistingBot) {
                return message.reply('❌ Bạn chỉ được thêm 1 bot phụ duy nhất.');
            }

            // ==== Ghi token mới vào .env ====
            fs.appendFileSync('.env', `\n${envKey}=${newToken}`);

            // ==== Thêm vào admin nếu chưa có ====
            if (!config.admins) config.admins = [];
            if (!config.admins.includes(authorId)) {
                config.admins.push(authorId);
                fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
                console.log(`👑 Đã thêm ${authorId} vào danh sách admin.`);
            }

            message.reply(`✅ Bot phụ của bạn đã được thêm và sẽ khởi chạy trong vài giây.`);

            setTimeout(() => {
                createBotInstance(newToken, false);
            }, 1000);

            return;
        }

        // ==== !restart - CHỈ ADMIN ====
        if (command === '!restart') {
            const authorId = message.author.id;
            const allowedUsers = config.admins || [];

            if (!allowedUsers.includes(authorId)) {
                return message.reply('❌ Bạn không có quyền khởi động lại bot.');
            }

            message.reply('🔁 Đang khởi động lại...');
            process.exit(0);
        }
    });

    bot.login(token).then(() => {
        console.log(`🤖 Đã đăng nhập: ${bot.user.tag}`);
        memoryOptimizer.reportMemoryUsage();

        setInterval(() => {
            memoryOptimizer.reportMemoryUsage();
            memoryOptimizer.runGarbageCollection();
        }, 3600000);

    }).catch(console.error);

    botInstances.set(token, bot);
}

// ==== KHỞI CHẠY BOT CHÍNH ====
const mainToken = config.token;
createBotInstance(mainToken, true);

// ==== KHỞI ĐỘNG BOT PHỤ TỪ .env ====
const envData = loadEnvFile();
for (const key in envData) {
    if (key.startsWith('BOT_TOKEN_')) {
        const token = envData[key];
        createBotInstance(token, false);
    }
}

// ==== HOT RELOAD LỆNH ====
const commandsPath = path.join(__dirname, 'modules', 'commands');
fs.watch(commandsPath, (eventType, filename) => {
    if (!filename) return;

    const commandPath = path.join(commandsPath, filename);
    try {
        if (fs.existsSync(commandPath)) {
            delete require.cache[require.resolve(commandPath)];
            const command = require(commandPath);
            commandHandler.registerCommand(command.name, command);
            console.log(`🔁 Reload command: ${command.name}`);
        } else if (eventType === 'rename') {
            const commandName = filename.replace('.js', '');
            commandHandler.unregisterCommand(commandName);
            console.log(`❌ Unregistered command: ${commandName}`);
        }
    } catch (error) {
        console.error(`⚠️ Lỗi khi xử lý file lệnh: ${filename}`, error);
    }
});

// ==== HOT RELOAD TIỆN ÍCH ====
const utilitiesPath = path.join(__dirname, 'modules', 'utilities');
fs.watch(utilitiesPath, (eventType, filename) => {
    if (!filename) return;

    const utilityPath = path.join(utilitiesPath, filename);
    try {
        if (fs.existsSync(utilityPath)) {
            delete require.cache[require.resolve(utilityPath)];
            eventHandler.loadEvents();
            console.log(`🔁 Reload tiện ích: ${filename}`);
        }
    } catch (error) {
        console.error(`⚠️ Lỗi khi xử lý tiện ích: ${filename}`, error);
    }
});

// ==== TẮT BOT ====
process.on('SIGINT', () => {
    console.log('🛑 Đang tắt bot...');
    botInstances.forEach(bot => bot.destroy());
    process.exit(0);
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);