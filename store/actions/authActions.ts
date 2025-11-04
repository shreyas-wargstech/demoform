// eslint-disable @typescript-eslint/no-explicit-any
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthCookie, removeAuthCookie } from "../utils";
import { jwtDecode } from "jwt-decode";
import { IUserData } from "@/types";
import { isTokenValid } from "../utils";

export interface IDecodedToken {
  practitionerId: string;
  details: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    level: number;
    qualification: string;
    registrationId: string;
    isVerified: boolean;
    profilePicture?: string;
    lastRegistration?: string;
    nextRegistration?: string;
  };
  iat: number;
  exp: number;
}

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/practitioners`;

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

export const registerPractitioner = createAsyncThunk(
  "auth/register",
  async (userData: IUserData, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", userData);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error registering practitioner:", error);
      const serverMessage =
        error.response?.data?.error || error.message || "Network error";

      return rejectWithValue(serverMessage);
    }
  },
);

export const loginPractitioner = createAsyncThunk(
  "auth/login",
  async (
    userData: { loginField: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      // console.log(baseUrl);
      const response = await api.post("/login", userData);
      console.log(response);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error logging in practitioner:", error);
      // return rejectWithValue(error.message || "Network error occurred");
      const serverMessage =
        error.response?.data?.error || error.message || "Network error";

      return rejectWithValue(serverMessage);
    }
  },
);

export const logoutPractitioner = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    removeAuthCookie();
    return null;
  },
);

export const checkAuthStatus = createAsyncThunk(
  "/auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // console.log("Checking auth status...");
      const token = getAuthCookie();
      if (!token) {
        removeAuthCookie();
        return rejectWithValue("No token found");
      }

      if (!isTokenValid(token)) {
        removeAuthCookie();
        return rejectWithValue("Token expired");
      }
      const decodedToken: IDecodedToken = jwtDecode(token);

      return {
        token,
        user: {
          id: decodedToken.practitionerId,
          details: {
            firstName: decodedToken.details.firstName,
            lastName: decodedToken.details.lastName,
            email: decodedToken.details.email,
            username: decodedToken.details.username,
            level: decodedToken.details.level,
            qualification: decodedToken.details.qualification,
            registrationId: decodedToken.details.registrationId,
            isVerified: decodedToken.details.isVerified,
            profilePicture: decodedToken.details.profilePicture,
            lastRegistration: decodedToken.details.lastRegistration,
            nextRegistration: decodedToken.details.nextRegistration,
          },
        },
      };
    } catch (error) {
      removeAuthCookie();
      return rejectWithValue("Invalid token");
    }
  },
);
