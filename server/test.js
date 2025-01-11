const express = require('express');
const https = require('https');
const fs = require('fs');
const moment = require('moment');

// HTTPS 配置
const privateKey = fs.readFileSync('server.key', 'utf8'); // 确保路径正确
const certificate = fs.readFileSync('server.crt', 'utf8'); // 确保路径正确
const credentials = { key: privateKey, cert: certificate };

const app = express();

// 定义简单的路由
app.get('/', (req, res) => {
    res.send(`Hello! Ngrok is working! Current Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
});

// 处理任意其他路由
app.all('*', (req, res) => {
    res.status(404).send(`Path not found: ${req.path}`);
});

// 启动 HTTPS 服务器
const httpsServer = https.createServer(credentials, app);
const PORT = 443;

httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
    console.log(`Visit https://localhost:${PORT} to test.`);
});
