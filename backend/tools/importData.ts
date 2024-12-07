import fs from 'fs';
import mongoose from 'mongoose';

import { connectDB } from '../src/config/db';
import { WaterDispenser } from '../src/models/WaterDispenser';

interface RawReview {
  sn: number;
  time: string;
  sisn: string;
  star: string;
  content: string;
  name: string;
  img: string;
  usn: number;
  cmntImg: string;
}

interface RawWaterDispenser {
  sn: number;
  lat: number | null;
  lng: number | null;
  access: string;
  type: string;
  name: string;
  addr: string;
  iced: boolean;
  cold: boolean;
  warm: boolean;
  hot: boolean;
  openingHours: string;
  description: string;
  rate: number;
  photos: string[];
  path: string;
  reviews: RawReview[];
}

const importData = async (jsonFilePath: string) => {
  try {
    // 連接 MongoDB
    connectDB();
    console.log('Connected to MongoDB!');

    // 讀取 JSON 文件
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    const rawData: RawWaterDispenser[] = JSON.parse(data);

    for (const rawDispenser of rawData) {
      if (rawDispenser.access !== '公開') continue;
      if (rawDispenser.lat === null || rawDispenser.lng === null) continue;

      // 檢查飲水機是否已存在於數據庫中
      const existingDispenser = await WaterDispenser.findOne({
        sn: rawDispenser.sn
      });

      // 設置評論的初始序號
      let initialReviewSN = 1;
      if (existingDispenser) {
        // 如果已存在，從當前評論數量的下一個序號開始
        initialReviewSN = existingDispenser.reviews.length + 1;
      }

      // 將原始評論數據轉換為符合模型的格式
      const reviews: {
        sn: number;
        username: string;
        cmntImg?: string;
        star: number;
        content: string;
        time: Date;
        stolen: boolean;
      }[] = [];

      for (const [i, rawReview] of rawDispenser.reviews.entries()) {
        if (rawReview.name === '') continue;

        const reviewData = {
          sn: initialReviewSN + i,
          username: rawReview.name,
          cmntImg: rawReview.cmntImg ?? undefined,
          star: parseFloat(rawReview.star),
          content: rawReview.content ?? '',
          time: new Date(rawReview.time),
          stolen: true
        };

        reviews.push(reviewData);
      }

      const name = rawDispenser.name.trim();
      const addr = rawDispenser.addr.trim();
      const openingHours = rawDispenser.openingHours.trim();

      // 創建符合模型的飲水機數據
      const dispenserData = {
        sn: rawDispenser.sn,
        location: { coordinates: [rawDispenser.lng, rawDispenser.lat] },
        type: rawDispenser.type,
        name: name !== '' ? name : 'No name',
        addr: addr !== '' ? addr : undefined,
        iced: rawDispenser.iced,
        cold: rawDispenser.cold,
        warm: rawDispenser.warm,
        hot: rawDispenser.hot,
        openingHours: openingHours !== '' ? openingHours : undefined,
        description: rawDispenser.description.trim(),
        rate: rawDispenser.rate,
        photos: rawDispenser.photos,
        path: rawDispenser.path,
        reviews
      };

      // 將飲水機數據保存到 MongoDB
      if (existingDispenser) {
        console.log(`Updating existing dispenser with SN: ${rawDispenser.sn}`);
        existingDispenser.set(dispenserData);
        await existingDispenser.save();
      } else {
        console.log(`Creating new dispenser with SN: ${rawDispenser.sn}`);
        const newDispenser = new WaterDispenser(dispenserData);
        await newDispenser.save();
      }
    }

    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    // 關閉 MongoDB 連接
    mongoose.connection.close();
  }
};

const path = process.argv[2];
if (!path) {
  console.error('Please provide a path to the JSON file!');
  process.exit(1);
}

// 執行數據導入
importData(path);
