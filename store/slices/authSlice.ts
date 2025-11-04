import { createSlice } from "@reduxjs/toolkit";
import { removeAuthCookie, setAuthCookie } from "../utils";
import {
  checkAuthStatus,
  IDecodedToken,
  loginPractitioner,
  logoutPractitioner,
  registerPractitioner,
} from "../actions/authActions";
import { jwtDecode } from "jwt-decode";

interface IInitialState {
  user: {
    id: string;
    details: {
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      level: number;
      qualification?: string;
      registrationId?: string;
      isVerified: boolean;
      profilePicture?: string;
      lastRegistration?: string;
      nextRegistration?: string;
    };
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: IInitialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      removeAuthCookie();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPractitioner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        if (action.payload.token) {
          const decodedToken: IDecodedToken = jwtDecode(action.payload.token);

          if (decodedToken) {
            state.user = {
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
            };
          }

          setAuthCookie(action.payload.token);
        }
      })
      .addCase(registerPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        removeAuthCookie();
      })
      .addCase(loginPractitioner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginPractitioner.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        if (action.payload.token) {
          const decodedToken: IDecodedToken = jwtDecode(action.payload.token);
          console.log("decodedToken", decodedToken);
          if (decodedToken) {
            state.user = {
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
            };
          }

          setAuthCookie(action.payload.token);
        }
      })
      .addCase(loginPractitioner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        removeAuthCookie();
      })
      .addCase(logoutPractitioner.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: IInitialState }) => state.auth;
export const selectUser = (state: { auth: IInitialState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: IInitialState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: IInitialState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: IInitialState }) =>
  state.auth.error;

export default authSlice.reducer;
