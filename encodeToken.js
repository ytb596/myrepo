// Công cụ mã hóa token Discord Bot
const tokenEncoder = require('./utils/tokenEncoder');
const readline = require('readline');

// Tạo giao diện dòng lệnh
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hỏi token từ người dùng
rl.question('Nhập token Discord Bot của bạn: ', (token) => {
    if (!token || token.trim() === '') {
        console.error('Token không được để trống!');
        rl.close();
        return;
    }
    
    // Mã hóa và lưu token
    const success = tokenEncoder.saveEncodedToken(token);
    
    if (success) {
        console.log('Đã mã hóa và lưu token thành công!');
        console.log('Token của bạn đã được mã hóa và lưu trong config.json');
    } else {
        console.error('Đã xảy ra lỗi khi mã hóa token!');
    }
    
    rl.close();
});