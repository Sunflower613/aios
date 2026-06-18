require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
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
// 核心 OIDC SSO Token 验证中间件
// ==========================================
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <Access_Token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing Authorization Token.' });
  }

  try {
    // 请求 SSO 用户信息端点，验证 Token 并获取玩家资料
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://sso.pengyg.top';
    const response = await axios.get(`${ssoBaseUrl}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const profile = response.data;
    if (!profile || !profile.sub) {
      return res.status(401).json({ success: false, message: 'Invalid SSO Token.' });
    }

    const sub = profile.sub;
    const username = profile.name || profile.preferred_username || '匿名玩家';
    const avatar = profile.picture || '';

    // 自动将最新用户信息缓存/更新到数据库中 (供排行榜联合查询使用)
    await db.run(`
      INSERT INTO users (id, username, avatar, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        avatar = excluded.avatar,
        updated_at = CURRENT_TIMESTAMP
    `, [sub, username, avatar]);

    // 挂载到请求对象上
    req.user = {
      id: sub,
      username,
      avatar
    };

    next();
  } catch (error) {
    console.error('Token authentication failed:', error.message);
    res.status(401).json({ success: false, message: 'SSO Token Authentication failed.', error: error.message });
  }
}

// ==========================================
// API 路由端点
// ==========================================

// 0. 获取 SSO 客户端公共配置 (方便前端动态构建登录链接)
app.get('/api/auth/config', (req, res) => {
  res.json({
    success: true,
    client_id: process.env.SSO_CLIENT_ID,
    authorize_url: `${process.env.SSO_BASE_URL || 'https://sso.pengyg.top'}/api/oauth/authorize`,
    redirect_uri: process.env.REDIRECT_URI
  });
});

// 1. SSO 授权回调码换取令牌端点 (保护 Client Secret 不在前端泄露)
app.post('/api/auth/callback', async (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Missing OAuth Authorization Code.' });
  }

  try {
    const ssoBaseUrl = process.env.SSO_BASE_URL || 'https://sso.pengyg.top';
    const finalRedirect = redirect_uri || process.env.REDIRECT_URI;
    
    // 向 SSO 发送 POST 请求换取 token
    const tokenResponse = await axios.post(`${ssoBaseUrl}/api/oauth/token`, new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: finalRedirect,
      client_id: process.env.SSO_CLIENT_ID,
      client_secret: process.env.SSO_CLIENT_SECRET
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokens = tokenResponse.data;
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Failed to retrieve access token from SSO.' });
    }

    // 请求用户基础信息
    const profileResponse = await axios.get(`${ssoBaseUrl}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const profile = profileResponse.data;
    const sub = profile.sub;
    const username = profile.name || profile.preferred_username || '匿名玩家';
    const avatar = profile.picture || '';

    // 写入/更新本地用户记录
    await db.run(`
      INSERT INTO users (id, username, avatar, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        avatar = excluded.avatar,
        updated_at = CURRENT_TIMESTAMP
    `, [sub, username, avatar]);

    res.json({
      success: true,
      access_token: accessToken,
      user: {
        id: sub,
        username,
        avatar
      }
    });

  } catch (error) {
    console.error('SSO Callback error:', error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      message: 'OAuth Code Exchange failed.',
      error: error.response ? error.response.data : error.message
    });
  }
});

// 2. 读档端点：获取指定游戏的存档与最高分
app.get('/api/game/data', authenticateToken, async (req, res) => {
  const { game_id } = req.query;
  if (!game_id) {
    return res.status(400).json({ success: false, message: 'Missing game_id parameter.' });
  }

  try {
    const row = await db.get(
      'SELECT score, save_data FROM game_saves WHERE user_id = ? AND game_id = ?',
      [req.user.id, game_id]
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
app.post('/api/game/score', authenticateToken, async (req, res) => {
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
      [req.user.id, game_id]
    );

    if (existing) {
      // 仅当新提交的分数大于旧的分数时，才更新 score
      const finalScore = Math.max(existing.score, newScore);

      await db.run(`
        UPDATE game_saves 
        SET score = ?, save_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND game_id = ?
      `, [finalScore, saveDataStr, req.user.id, game_id]);
    } else {
      // 插入新纪录
      await db.run(`
        INSERT INTO game_saves (user_id, game_id, score, save_data, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [req.user.id, game_id, newScore, saveDataStr]);
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
    // 联合 users 用户表和 game_saves 表，聚合分数和昵称
    const rows = await db.query(`
      SELECT s.score, u.username, u.avatar
      FROM game_saves s
      JOIN users u ON s.user_id = u.id
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
