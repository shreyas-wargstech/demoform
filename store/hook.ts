import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./index";

import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
  clearAuth,
} from "./slices/authSlice";

import {
  registerPractitioner,
  loginPractitioner,
  logoutPractitioner,
  checkAuthStatus,
} from "./actions/authActions";
import { useCallback, useEffect } from "react";
import { IUserData } from "@/types";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Initialize auth status on mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const login = useCallback(
    async (credentials: { loginField: string; password: string }) => {
      return dispatch(loginPractitioner(credentials));
    },
    [dispatch],
  );

  /*
        "firstName": "atharva",
        "lastName": "gaikwad",
        "dateOfBirth": "1990-05-15",
        "email": "atharva@example.com",
        "mobileNumber": "9876543211",
        "username": "atharvaun",
        "password": "password",
        "recoveryQuestionId": 1,
        "recoveryAnswer": "pikachu",
        "level": 2,
        "qualification": "MBBS, MD",
        "registrationID": "MED2023101",
        "registeredOn": "2023-01-15",
        "lastRegistration": "2024-01-15",
        "nextRegistration": "2025-01-15",
        "organizationName": "MCH"
    */
  const register = useCallback(
    async (userData: IUserData) => {
      return dispatch(registerPractitioner(userData));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    return dispatch(logoutPractitioner());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAllAuth = useCallback(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    loading,
    error,

    // Actions
    login,
    register,
    logout,
    clearAuthError,
    clearAllAuth,
  };
};

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
