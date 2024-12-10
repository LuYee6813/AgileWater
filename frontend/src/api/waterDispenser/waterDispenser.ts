import apiClient from "../api";
import { WaterDispenserParams } from "../common";

export const getWaterDispensers = async (params: WaterDispenserParams) => {
  try {
    // 設置預設值
    const defaultParams = {
      offset: 0,
      limit: -1,
      radius: 1000,
      sort: "distance",
    };

    // 合併用戶傳入的參數和預設值
    const queryParams = { ...defaultParams, ...params };

    // 檢查必要參數
    if (!queryParams.lat || !queryParams.lng) {
      throw new Error("Lat and Lng are required.");
    }

    // 發送 API 請求
    const response = await apiClient.get("/water_dispensers", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching water dispenser list:", error);
    throw error;
  }
};

export const getWaterDispenserDetails = async (sn: number) => {
  const response = await apiClient.get(`/water_dispensers/${sn}`);
  return response.data;
};
