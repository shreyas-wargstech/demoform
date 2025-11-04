// eslint-disable @typescript-eslint/no-explicit-any
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  Addresses,
  ApiResponse,
  Documents,
  DocumentUploadResponse,
  PaymentResponse,
  PersonalInfo,
  Qualification,
  StartFormResponse,
} from "../slices/formSlice";
import Cookies from "js-cookie";
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
  (error) => {
    return Promise.reject(error);
  },
);

// Async thunks
export const startForm = createAsyncThunk(
  "form/start",
  async (applicationType: string = "New_Registration") => {
    const response = await api.post("/practitioners/forms/start", {
      applicationType,
    });
    return response.data as Promise<StartFormResponse>;
  },
);

// NEW: Fetch existing form data
export const fetchPersonalInfo = createAsyncThunk(
  "form/fetchPersonalInfo",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step1/personal-info?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchAddress = createAsyncThunk(
  "form/fetchAddress",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step2/address?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchQualification = createAsyncThunk(
  "form/fetchQualification",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step3/qualification?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchDocuments = createAsyncThunk(
  "form/fetchDocuments",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step4/documents?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchAadhaar = createAsyncThunk(
  "form/fetchAadhaar",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step5/aadhaar?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchPayment = createAsyncThunk(
  "form/fetchPayment",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/step6/payment?formId=${formId}`,
    );
    return response.data;
  },
);

export const fetchFormSummary = createAsyncThunk(
  "form/fetchSummary",
  async (formId: string) => {
    const response = await api.get(
      `/practitioners/forms/summary?formId=${formId}`,
    );
    return response.data;
  },
);

export const submitPersonalInfo = createAsyncThunk(
  "form/submitPersonalInfo",
  async (data: { formId: string } & PersonalInfo) => {
    const response = await api.post(
      "/practitioners/forms/step1/personal-info",
      data,
    );
    return response.data as Promise<ApiResponse<PersonalInfo>>;
  },
);

export const submitAddress = createAsyncThunk(
  "form/submitAddress",
  async (
    data: { formId: string } & Addresses["permanent"] &
      Addresses["correspondence"],
  ) => {
    const response = await api.post("/practitioners/forms/step2/address", data);
    return response.data as Promise<ApiResponse>;
  },
);

export const submitQualification = createAsyncThunk(
  "form/submitQualification",
  async (data: { formId: string } & Qualification) => {
    const response = await api.post(
      "/practitioners/forms/step3/qualification",
      data,
    );
    return response.data as Promise<ApiResponse<Qualification>>;
  },
);

export const submitDocuments = createAsyncThunk(
  "form/submitDocuments",
  async (data: { formId: string; documents: Documents }) => {
    const formData = new FormData();
    formData.append("formId", data.formId);

    // Append files with API expected names
    Object.entries(data.documents).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    const response = await api.post(
      "/practitioners/forms/step4/documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data as Promise<DocumentUploadResponse>;
  },
);

export const submitAadhaar = createAsyncThunk(
  "form/submitAadhaar",
  async (data: { formId: string; aadharNo: string; validAadhar: boolean }) => {
    const response = await api.post("/practitioners/forms/step5/aadhaar", data);
    return response.data;
  },
);

export const createPayment = createAsyncThunk(
  "form/createPayment",
  async (data: {
    formId: string;
    applicationType: string;
    payment_name: string;
  }) => {
    const response = await api.post("/payments/form-payment", data);
    return response.data as Promise<PaymentResponse>;
  },
);

export const submitApplication = createAsyncThunk(
  "form/submit",
  async (data: {
    formId: string;
    applicationType: string;
    additionalInfo: {
      specialization?: string;
      experience?: string;
      preferredLocation?: string;
      comment?: string;
    };
  }) => {
    const response = await api.post("/practitioners/forms/submit", data);
    return response.data;
  },
);

// NEW: Load all existing form data at once
export const loadExistingFormData = createAsyncThunk(
  "form/loadExistingData",
  async (formId: string, { dispatch }) => {
    try {
      // Fetch all step data in parallel
      const [
        personalInfo,
        address,
        qualification,
        documents,
        aadhaar,
        payment,
      ] = await Promise.allSettled([
        api.get(`/practitioners/forms/step1/personal-info?formId=${formId}`),
        api.get(`/practitioners/forms/step2/address?formId=${formId}`),
        api.get(`/practitioners/forms/step3/qualification?formId=${formId}`),
        api.get(`/practitioners/forms/step4/documents?formId=${formId}`),
        api.get(`/practitioners/forms/step5/aadhaar?formId=${formId}`),
        api.get(`/practitioners/forms/step6/payment?formId=${formId}`),
      ]);

      return {
        personalInfo:
          personalInfo.status === "fulfilled" ? personalInfo.value.data : null,
        address: address.status === "fulfilled" ? address.value.data : null,
        qualification:
          qualification.status === "fulfilled"
            ? qualification.value.data
            : null,
        documents:
          documents.status === "fulfilled" ? documents.value.data : null,
        aadhaar: aadhaar.status === "fulfilled" ? aadhaar.value.data : null,
        payment: payment.status === "fulfilled" ? payment.value.data : null,
      };
    } catch (error) {
      throw error;
    }
  },
);

// Load existing form data selectively based on completed steps
export const loadExistingFormDataSelective = createAsyncThunk(
  "form/loadExistingDataSelective",
  async ({ formId, nextStep }: { formId: string; nextStep: number }) => {
    try {
      // Map of step numbers to API endpoints
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepEndpoints: { [key: number]: () => Promise<any> } = {
        1: () =>
          api.get(`/practitioners/forms/step1/personal-info?formId=${formId}`),
        2: () => api.get(`/practitioners/forms/step2/address?formId=${formId}`),
        3: () =>
          api.get(`/practitioners/forms/step3/qualification?formId=${formId}`),
        4: () =>
          api.get(`/practitioners/forms/step4/documents?formId=${formId}`),
        5: () => api.get(`/practitioners/forms/step5/aadhaar?formId=${formId}`),
        6: () => api.get(`/practitioners/forms/step6/payment?formId=${formId}`),
      };

      // Calculate completed steps (nextStep - 1)
      const completedSteps = nextStep > 1 ? nextStep - 1 : 0;

      console.log(`Loading data for completed steps 1-${completedSteps}`);

      // Fetch only completed steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promises: Promise<any>[] = [];
      for (let i = 1; i <= completedSteps; i++) {
        if (stepEndpoints[i]) {
          promises.push(stepEndpoints[i]());
        }
      }

      // Execute all fetch requests in parallel
      const results = await Promise.allSettled(promises);

      // Map results
      const stepMapping = [
        "personalInfo",
        "address",
        "qualification",
        "documents",
        "aadhaar",
        "payment",
      ];

      const data = {
        personalInfo: null,
        address: null,
        qualification: null,
        documents: null,
        aadhaar: null,
        payment: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as any;

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          const stepName = stepMapping[index];
          data[stepName] = result.value.data;
          console.log(
            `Loaded step ${index + 1} (${stepName}):`,
            result.value.data,
          );
        } else if (result.status === "rejected") {
          console.warn(`Failed to load step ${index + 1}:`, result.reason);
        }
      });

      return data;
    } catch (error) {
      console.error("Error loading selective data:", error);
      throw error;
    }
  },
);
