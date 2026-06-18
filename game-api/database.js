const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 数据库文件存放路径 (当前目录下)
const dbPath = path.join(__dirname, 'game_data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initSchema();
  }
});

// 初始化数据库表结构
function initSchema() {
  db.serialize(() => {
    // 1. 创建缓存用户信息表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        avatar TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err.message);
    });

    // 2. 创建用户游戏积分与存档表 (联合主键)
    db.run(`
      CREATE TABLE IF NOT EXISTS game_saves (
        user_id TEXT,
        game_id TEXT,
        score INTEGER DEFAULT 0,
        save_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, game_id)
      )
    `, (err) => {
      if (err) console.error('Error creating game_saves table:', err.message);
    });

    console.log('SQLite schema checked/initialized successfully.');
  });
}

// 数据库辅助包装方法（使用 Promise 以简化 async/await 流程）
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  query,
  get,
  run
};
