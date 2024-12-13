import apiClient from "../api";

export const login = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    console.log("Login Success:", response.data);
    localStorage.setItem("token", response.data.token); // 儲存 Token
    return true; // 登入成功，回傳 true
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    return false; // 登入失敗，回傳 false
  }
};

export const register = async (
  username: string,
  password: string,
  nickname: string
) => {
  const response = await apiClient.post("/auth/register", {
    username,
    password,
    nickname,
  });
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("token");
};

export const getCurrentUsers = async (): Promise<{
  username: string;
  nickname: string;
  admin: boolean;
} | null> => {
  try {
    const response = await apiClient.get("users/current");
    return response.data;
  } catch (error: any) {
    return null;
  }
};
