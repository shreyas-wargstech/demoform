import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthCookie } from "../utils";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
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
  async (nocType: string = "NOC_CERTIFICATE") => {
    const response = await api.post("/noc/start", { nocType });
    return response.data;
  },
);

// Step 3: Submit NOC Documents (Pending)
export const submitNOCDocuments = createAsyncThunk(
  "NOC/submitDocuments",
  async (data: { formId: string; documents: Record<string, File> }) => {
    const formData = new FormData();
    formData.append("formId", data.formId);

    Object.entries(data.documents).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    const response = await api.post("/NOC/forms/step2/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      uploadedUrls: {
        aadharCard: "https://mock-storage.com/aadhar.pdf",
        panCard: "https://mock-storage.com/pan.pdf",
      },
    };
  },
);

// Step 4: Create Payment for NOC Application
export const createNOCPayment = createAsyncThunk(
  "noc/createPayment",
  async (data: { nocFormId: string; nocType: string }) => {
    const response = await api.post("/payments/noc-payment", data);
    return response.data;
  },
);

// Step 5: Submit Final NOC Application
export const submitNOCApplication = createAsyncThunk(
  "noc/submitApplication",
  async (data: {
    nocType: string;
    nocFormId: string;
    title: string;
    reason: string;
  }) => {
    const response = await api.post("/NOC/forms/submit", data);
    return response.data;
  },
);

// Step 6: Load Existing NOC Data
export const loadExistingNOCData = createAsyncThunk(
  "NOC/loadExistingData",
  async (formId: string) => {
    try {
      const [documents, payment] = await Promise.allSettled([
        api.get(`/NOC/forms/step2/documents?formId=${formId}`),
        api.get(`/NOC/forms/step3/payment?formId=${formId}`),
      ]);

      return {
        documents:
          documents.status === "fulfilled" ? documents.value.data : null,
        payment: payment.status === "fulfilled" ? payment.value.data : null,
      };
    } catch (error) {
      throw error;
    }
  },
);
