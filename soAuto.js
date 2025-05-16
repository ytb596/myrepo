const fs = require('fs');
const path = './soData.json';

function randomPrice(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

// Tạo file nếu chưa có
if (!fs.existsSync(path)) {
    const initialData = {
        buy: 0,
        sell: 0,
        lastUpdate: Date.now()
    };
    fs.writeFileSync(path, JSON.stringify(initialData, null, 2));
}

function updateSO() {
    const buy = randomPrice(1000, 5000);
    const sell = randomPrice(parseFloat(buy) + 100, parseFloat(buy) + 1000);
    const data = {
        buy: parseFloat(buy),
        sell: parseFloat(sell),
        lastUpdate: Date.now()
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

setInterval(updateSO, 1000);
