const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',          // 管理員用戶名
    host: 'localhost',         // 本地伺服器
    database: 'agile_water',   // 剛創建的資料庫名稱
    password: 'root',          // 管理員密碼
    port: 5432                 // PostgreSQL 默認端口
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Database connected successfully:', res.rows[0]);
    }
});

module.exports = pool;
