const config = require('../config.json');

/**
 * Apply memory optimizations to the Discord client
 * @param {Client} client Discord client
 */
function optimize(client) {
    console.log('Đang áp dụng tối ưu hóa bộ nhớ...');

    // Không set trực tiếp vào client.options như vậy nữa, mà config cache từ đầu (nếu muốn)
    // Còn đoạn dưới vẫn giữ nguyên để không đụng quá nhiều vào cấu trúc cũ

    client.on('ready', () => {
        // Sweep cached messages periodically
        setInterval(() => {
            console.log('Đang dọn dẹp tin nhắn đã lưu trong bộ nhớ cache...');

            client.channels.cache.forEach(channel => {
                if (channel.messages && channel.messages.cache) {
                    channel.messages.cache.clear();
                }
            });

        }, config.cacheSettings.messageSweepInterval * 1000);
    });

    console.log('Đã áp dụng tối ưu hóa bộ nhớ!');
}

/**
 * Run garbage collection (if available in Node version with --expose-gc flag)
 */
function runGarbageCollection() {
    if (global.gc) {
        console.log('Đang chạy thu gom rác thủ công...');
        global.gc();
        console.log('Thu gom rác hoàn tất.');
    }
}

/**
 * Report current memory usage
 */
function reportMemoryUsage() {
    const memoryUsage = process.memoryUsage();

    const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

    console.log('Thông tin sử dụng bộ nhớ:');
    console.log(`- RSS (Resident Set Size): ${formatMemory(memoryUsage.rss)}`);
    console.log(`- Tổng Heap: ${formatMemory(memoryUsage.heapTotal)}`);
    console.log(`- Heap đã sử dụng: ${formatMemory(memoryUsage.heapUsed)}`);
    console.log(`- Bộ nhớ bên ngoài: ${formatMemory(memoryUsage.external)}`);

    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    if (heapUsedMB > config.memoryLimit) {
        console.warn(`CẢNH BÁO: Sử dụng bộ nhớ (${heapUsedMB.toFixed(2)} MB) vượt quá giới hạn (${config.memoryLimit} MB)`);
        runGarbageCollection();
    }
}

/**
 * Apply optimization techniques for large objects
 * @param {Object} object Object to optimize
 */
function optimizeObject(object) {
    // Tuỳ ý cắt bỏ field rác nếu cần
    return object;
}

module.exports = {
    optimize,
    reportMemoryUsage,
    runGarbageCollection,
    optimizeObject
};
