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

// Step 1: Start CCMP Form
export const startCCMPForm = createAsyncThunk(
  "ccmp/start",
  async (applicationType: string = "CCMP_Registration") => {
    const response = await api.post("/api/v1/practionear-applications/start", {
      applicationType,
    });
    return response.data;
  },
);

// Step 2: Submit Additional Qualifications
export const submitAdditionalQualifications = createAsyncThunk(
  "ccmp/submitAdditionalQualifications",
  async (data: {
    formId: string;
    qualifications: {
      qualificationName: string;
      instituteName: string;
      yearOfPassing: string;
      certificateNumber?: string;
    }[];
  }) => {
    const response = await api.post("/ccmp/forms/step1/qualifications", data);
    return response.data;
  },
);

// Step 3: Submit CCMP Documents
export const submitCCMPDocuments = createAsyncThunk(
  "ccmp/submitDocuments",
  async (data: { formId: string; documents: Record<string, File> }) => {
    const formData = new FormData();
    formData.append("formId", data.formId);

    Object.entries(data.documents).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    const response = await api.post("/ccmp/forms/step2/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },
);

// Step 4: Create Payment for CCMP Application
export const createCCMPPayment = createAsyncThunk(
  "ccmp/createPayment",
  async (data: {
    formId: string;
    applicationType: string;
    payment_name: string;
  }) => {
    const response = await api.post("/payments/ccmp-payment", data);
    return response.data;
  },
);

// Step 5: Submit Final CCMP Application
export const submitCCMPApplication = createAsyncThunk(
  "ccmp/submitApplication",
  async (data: {
    formId: string;
    applicationType: string;
    additionalInfo?: {
      specialization?: string;
      experience?: string;
      preferredLocation?: string;
      comments?: string;
    };
  }) => {
    const response = await api.post("/ccmp/forms/submit", data);
    return response.data;
  },
);

// Step 6: Load Existing CCMP Data
export const loadExistingCCMPData = createAsyncThunk(
  "ccmp/loadExistingData",
  async (formId: string) => {
    try {
      const [qualifications, documents, payment] = await Promise.allSettled([
        api.get(`/ccmp/forms/step1/qualifications?formId=${formId}`),
        api.get(`/ccmp/forms/step2/documents?formId=${formId}`),
        api.get(`/ccmp/forms/step3/payment?formId=${formId}`),
      ]);

      return {
        qualifications:
          qualifications.status === "fulfilled"
            ? qualifications.value.data
            : null,
        documents:
          documents.status === "fulfilled" ? documents.value.data : null,
        payment: payment.status === "fulfilled" ? payment.value.data : null,
      };
    } catch (error) {
      throw error;
    }
  },
);
