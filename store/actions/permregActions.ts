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

// Step 1: Start Perm Reg Form
export const startPermRegForm = createAsyncThunk(
  "permreg/start",
  async (type: string = "PERM_REGISTRATION", { rejectWithValue }) => {
    try {
      const response = await api.post("/permreg/start", { type });
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to start perm reg form",
      });
    }
  },
);

// Submit Perm Reg Documents
export const submitPermRegDocuments = createAsyncThunk(
  "permreg/submitDocuments",
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

      const response = await api.post(
        "/PERMREG/forms/step2/documents",
        formData,
      );

      if (response?.data) {
        if (response.data.uploadedUrls)
          return { uploadedUrls: response.data.uploadedUrls };
        return { uploadedUrls: response.data };
      }

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

// Create Payment for Perm Reg
export const createPermRegPayment = createAsyncThunk(
  "permreg/createPayment",
  async (
    data: { permRegFormId: string; type: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/payments/permreg-payment", data);
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

// Submit Final Perm Reg Application
export const submitPermRegApplication = createAsyncThunk(
  "permreg/submitApplication",
  async (
    data: {
      type: string;
      permRegFormId: string;
      title: string;
      reason: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/PERMREG/forms/submit", data);
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

// Load existing Perm Reg data
export const loadExistingPermRegData = createAsyncThunk(
  "PERMREG/loadExistingData",
  async (formId: string, { rejectWithValue }) => {
    try {
      const [documents, payment] = await Promise.allSettled([
        api.get(`/PERMREG/forms/step2/documents`, { params: { formId } }),
        api.get(`/PERMREG/forms/step3/payment`, { params: { formId } }),
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
