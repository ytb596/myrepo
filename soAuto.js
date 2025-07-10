const fs = require('fs');

const path = './soData.json';

// Giá trị giới hạn biến động (biến động mỗi giây)

const VOLATILITY = 0.02; // tức là +-2% mỗi giây

// Nếu chưa có file, tạo mới

if (!fs.existsSync(path)) {

    const initialPrice = 1000;

    const initialData = {

        buy: initialPrice,

        sell: initialPrice + 200,

        lastUpdate: Date.now(),

        previousBuy: initialPrice,

        previousSell: initialPrice + 200

    };

    fs.writeFileSync(path, JSON.stringify(initialData, null, 2));

}

function updateSO() {

    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const prevBuy = data.buy;

    const prevSell = data.sell;

    // Biến động giá dựa trên giá cũ

    const newBuy = parseFloat((prevBuy * (1 + (Math.random() * VOLATILITY * 2 - VOLATILITY))).toFixed(2));

    const newSell = parseFloat((newBuy + (Math.random() * 500 + 100)).toFixed(2));

    const updated = {

        buy: newBuy,

        sell: newSell,

        lastUpdate: Date.now(),

        previousBuy: prevBuy,

        previousSell: prevSell

    };

    fs.writeFileSync(path, JSON.stringify(updated, null, 2));

}

setInterval(updateSO, 1000); // cập nhật mỗi giây