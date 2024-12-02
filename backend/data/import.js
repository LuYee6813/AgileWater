const { Pool } = require('pg');
const fs = require('fs');

// 資料庫設定
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agile_water',
  password: 'root',
  port: 5432,
});

// 讀取 JSON 文件
const data = JSON.parse(fs.readFileSync('pt_result.json', 'utf8'));

(async () => {
  const client = await pool.connect();
  try {
    for (const station of data) {
      const {
        sn, lat, lng, access, name, addr, iced, cold, warm, hot,
        opening_hours, description, rate,
      } = station;
    
      // 跳過 name 為空的記錄
      if (!name || name.trim() === '') {
        console.warn(`Skipping station with sn=${sn} due to missing name`);
        continue;
      }
    
      await client.query(
        `
        INSERT INTO water_stations
        (sn, lat, lng, access, name, addr, iced, cold, warm, hot, opening_hours, description, rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (sn) DO NOTHING
        `,
        [
          sn,
          parseFloat(lat),
          parseFloat(lng),
          access || null,
          name || null,
          addr || null,
          iced === 'yes',
          cold === 'yes',
          warm === 'yes',
          hot === 'yes',
          opening_hours || null,
          description || null,
          parseFloat(rate),
        ]
      );
    }
    console.log('Data imported successfully!');
  } catch (err) {
    console.error('Error importing data:', err);
  } finally {
    client.release();
    pool.end();
  }
  
  
})();

