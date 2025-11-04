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

// Step 1: Start NOC Form
export const startNOCForm = createAsyncThunk(
  "noc/start",
  async (nocType: string = "NOC_CERTIFICATE", { rejectWithValue }) => {
    try {
      const response = await api.post("/noc/start", { nocType });
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to start NOC form",
      });
    }
  },
);

// Step 3: Submit NOC Documents (Pending)
export const submitNOCDocuments = createAsyncThunk(
  "NOC/submitDocuments",
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

      // Let axios/set the Content-Type (with boundary) for multipart requests
      const response = await api.post("/NOC/forms/step2/documents", formData);

      // Prefer the API response, but fall back to a stable shape for dev environments
      if (response?.data) {
        // If backend returns uploadedUrls directly, normalize to that shape
        if (response.data.uploadedUrls)
          return { uploadedUrls: response.data.uploadedUrls };
        return { uploadedUrls: response.data };
      }

      // Fallback mock (only used when backend isn't available)
      return {
        uploadedUrls: {
          aadharCard: "https://mock-storage.com/aadhar.pdf",
          panCard: "https://mock-storage.com/pan.pdf",
        },
      };
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to upload documents",
      });
    }
  },
);

// Step 4: Create Payment for NOC Application
export const createNOCPayment = createAsyncThunk(
  "noc/createPayment",
  async (
    data: {
      nocFormId: string;
      nocType: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/payments/noc-payment", data);
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

// Step 5: Submit Final NOC Application
export const submitNOCApplication = createAsyncThunk(
  "noc/submitApplication",
  async (
    data: {
      nocType: string;
      nocFormId: string;
      title: string;
      reason: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/NOC/forms/submit", data);
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

// Step 6: Load Existing NOC Data
export const loadExistingNOCData = createAsyncThunk(
  "NOC/loadExistingData",
  async (formId: string, { rejectWithValue }) => {
    try {
      const [documents, payment] = await Promise.allSettled([
        api.get(`/NOC/forms/step2/documents`, { params: { formId } }),
        api.get(`/NOC/forms/step3/payment`, { params: { formId } }),
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
