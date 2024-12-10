import apiClient from "../api";

export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    console.log("Login Success:", response.data);
    localStorage.setItem("token", response.data.token); // 儲存 Token
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
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

export const getUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data;
};
