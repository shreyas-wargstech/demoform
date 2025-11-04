import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthCookie } from "../utils";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = getAuthCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Step 1: Start iCard Form
export const startICARDForm = createAsyncThunk(
  "icard/start",
  async (type: string = "ICARD", { rejectWithValue }) => {
    try {
      const response = await api.post("/icard/start", { type });
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to start iCard form",
      });
    }
  },
);

// Submit iCard Documents
export const submitICARDDocuments = createAsyncThunk(
  "icard/submitDocuments",
  async (
    data: { formId: string; documents: Record<string, File> },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("formId", data.formId);

      Object.entries(data.documents).forEach(([key, file]) => {
        if (file) formData.append(key, file as File);
      });

      const response = await api.post("/ICARD/forms/step2/documents", formData);

      if (response?.data) {
        if (response.data.uploadedUrls)
          return { uploadedUrls: response.data.uploadedUrls };
        return { uploadedUrls: response.data };
      }

      // Dev fallback
      return { uploadedUrls: {} };
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to upload documents",
      });
    }
  },
);

// Create Payment for iCard
export const createICARDPayment = createAsyncThunk(
  "icard/createPayment",
  async (data: { icardFormId: string; type: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/payments/icard-payment", data);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to create payment",
      });
    }
  },
);

// Submit Final iCard Application
export const submitICARDApplication = createAsyncThunk(
  "icard/submitApplication",
  async (
    data: { type: string; icardFormId: string; title: string; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/ICARD/forms/submit", data);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to submit application",
      });
    }
  },
);

// Load existing iCard data
export const loadExistingICARDData = createAsyncThunk(
  "ICARD/loadExistingData",
  async (formId: string, { rejectWithValue }) => {
    try {
      const [documents, payment] = await Promise.allSettled([
        api.get(`/ICARD/forms/step2/documents`, { params: { formId } }),
        api.get(`/ICARD/forms/step3/payment`, { params: { formId } }),
      ]);

      return {
        documents:
          documents.status === "fulfilled" ? documents.value.data : null,
        payment: payment.status === "fulfilled" ? payment.value.data : null,
      };
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to load existing data",
      });
    }
  },
);
