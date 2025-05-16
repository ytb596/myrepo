// Tiện ích mã hóa và giải mã token
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Khóa mã hóa (trong thực tế, khóa này nên được lưu trữ an toàn)
const SECRET_KEY = 'discord-bot-secret-key';

/**
 * Mã hóa token
 * @param {string} token Token cần mã hóa
 * @returns {string} Token đã được mã hóa
 */
function encodeToken(token) {
    try {
        // Tạo cipher với thuật toán aes-256-ctr
        const cipher = crypto.createCipher('aes-256-ctr', SECRET_KEY);
        
        // Mã hóa token
        let encodedToken = cipher.update(token, 'utf8', 'hex');
        encodedToken += cipher.final('hex');
        
        return encodedToken;
    } catch (error) {
        console.error('Lỗi khi mã hóa token:', error);
        return null;
    }
}

/**
 * Giải mã token
 * @param {string} encodedToken Token đã được mã hóa
 * @returns {string} Token gốc
 */
function decodeToken(encodedToken) {
    try {
        // Tạo decipher với thuật toán aes-256-ctr
        const decipher = crypto.createDecipher('aes-256-ctr', SECRET_KEY);
        
        // Giải mã token
        let token = decipher.update(encodedToken, 'hex', 'utf8');
        token += decipher.final('utf8');
        
        return token;
    } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return null;
    }
}

/**
 * Đọc token từ config.json
 * @returns {string} Token giải mã
 */
function getDecodedToken() {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (!config.encodedToken) {
            // Nếu không có encodedToken, trả về token thông thường
            return config.token;
        }
        
        return decodeToken(config.encodedToken);
    } catch (error) {
        console.error('Lỗi khi đọc token từ config:', error);
        return null;
    }
}

/**
 * Mã hóa token và lưu vào config.json
 * @param {string} token Token cần mã hóa
 * @returns {boolean} Kết quả thành công hay không
 */
function saveEncodedToken(token) {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Mã hóa token
        const encodedToken = encodeToken(token);
        
        // Cập nhật config
        config.encodedToken = encodedToken;
        
        // Xóa token thường nếu có
        delete config.token;
        
        // Lưu lại config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        
        return true;
    } catch (error) {
        console.error('Lỗi khi lưu token đã mã hóa:', error);
        return false;
    }
}

module.exports = {
    encodeToken,
    decodeToken,
    getDecodedToken,
    saveEncodedToken
};