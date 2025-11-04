import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { IDecodedToken } from "./actions/authActions";

const cookieOptions = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  // httpOnly: process.env.NODE_ENV === "production",
};

const setAuthCookie = (token: string) => {
  Cookies.set("authToken", token, cookieOptions);
};

const removeAuthCookie = () => {
  Cookies.remove("authToken");
};

const getAuthCookie = () => {
  return Cookies.get("authToken");
};

const decodeToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const isTokenValid = (token: string) => {
  if (!token) return false;

  try {
    const decodedToken: IDecodedToken = jwtDecode(token);
    if (!decodedToken) return false;
    const currTime = Date.now() / 1000;
    return decodedToken.exp > currTime;
  } catch (error) {
    return false;
  }
};

export {
  setAuthCookie,
  removeAuthCookie,
  getAuthCookie,
  decodeToken,
  isTokenValid,
};
