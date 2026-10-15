require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 (允许主站和调试本地域名访问)
app.use(cors({
  origin: '*', // 生产环境下可以替换为特定的域名列表，开发阶段设为 *
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// API 路由端点
// ==========================================
// 2. 读档端点：获取指定游戏的存档与最高分
app.get('/api/game/data', async (req, res) => {
  const { game_id } = req.query;
  if (!game_id) {
    return res.status(400).json({ success: false, message: 'Missing game_id parameter.' });
  }

  try {
    const row = await db.get(
      'SELECT score, save_data FROM game_saves WHERE user_id = ? AND game_id = ?',
      ['guest', game_id]
    );

    if (row) {
      res.json({
        success: true,
        data: {
          score: row.score,
          save_data: row.save_data ? JSON.parse(row.save_data) : null
        }
      });
    } else {
      // 没存档，返回初始默认数据
      res.json({
        success: true,
        data: {
          score: 0,
          save_data: null
        }
      });
    }
  } catch (error) {
    console.error('Get game data failed:', error.message);
    res.status(500).json({ success: false, message: 'Database read error.', error: error.message });
  }
});

// 3. 存盘端点：更新最高分与游戏进度存档
app.post('/api/game/score', async (req, res) => {
  const { game_id, score, save_data } = req.body;
  
  if (!game_id) {
    return res.status(400).json({ success: false, message: 'Missing game_id.' });
  }

  const newScore = parseInt(score) || 0;
  const saveDataStr = save_data ? JSON.stringify(save_data) : null;

  try {
    // 检查是否已有旧记录
    const existing = await db.get(
      'SELECT score FROM game_saves WHERE user_id = ? AND game_id = ?',
      ['guest', game_id]
    );

    if (existing) {
      // 仅当新提交的分数大于旧的分数时，才更新 score
      const finalScore = Math.max(existing.score, newScore);

      await db.run(`
        UPDATE game_saves 
        SET score = ?, save_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND game_id = ?
      `, [finalScore, saveDataStr, 'guest', game_id]);
    } else {
      // 插入新纪录
      await db.run(`
        INSERT INTO game_saves (user_id, game_id, score, save_data, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, ['guest', game_id, newScore, saveDataStr]);
    }

    res.json({ success: true, message: 'Game score and save data synced successfully.' });
  } catch (error) {
    console.error('Post game score failed:', error.message);
    res.status(500).json({ success: false, message: 'Database write error.', error: error.message });
  }
});

// 4. 排行榜端点：获取指定小游戏的前 10 名排行
app.get('/api/game/leaderboard', async (req, res) => {
  const { game_id } = req.query;
  if (!game_id) {
    return res.status(400).json({ success: false, message: 'Missing game_id.' });
  }

  try {
    // 游客模式：存档以 user_id='guest' 记账，users 表可能没有对应行，
    // 因此改为 LEFT JOIN + 昵称兜底，避免排行榜恒为空。
    const rows = await db.query(`
      SELECT s.score, COALESCE(u.username, '游客') AS username, COALESCE(u.avatar, '') AS avatar
      FROM game_saves s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.game_id = ?
      ORDER BY s.score DESC
      LIMIT 10
    `, [game_id]);

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      avatar: row.avatar,
      score: row.score
    }));

    res.json({
      success: true,
      game_id,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard failed:', error.message);
    res.status(500).json({ success: false, message: 'Database read error.', error: error.message });
  }
});

// 启动端口监听
app.listen(PORT, () => {
  console.log(`Unified Game API Service is running on port ${PORT}`);
});
