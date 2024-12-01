const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 添加请求日志
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

// 中间件
app.use(express.json());
app.use(cors());

// 直接使用当前目录作为静态文件目录
app.use(express.static(__dirname));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 获取所有文章
app.get('/api/articles', async (req, res) => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8').catch(() => '[]');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 保存所有文章
app.post('/api/articles', async (req, res) => {
    try {
        await ensureDataDir();
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '保存数据失败' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器启动时间: ${new Date().toISOString()}`);
    console.log(`服务器运行在 http://112.124.43.20:${PORT}`);
}).on('error', (err) => {
    console.error('服务器启动失败:', err);
}); 