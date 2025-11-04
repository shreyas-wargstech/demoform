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

// Step 1: Start Renewal/Restoration Form
export const startRenewalForm = createAsyncThunk(
  "renewal/start",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/practionear-applications/start");
      return response.data;
      /*
  {
    "message": "Practitioner application form started successfully",
    "formId": "17b3c4b7-e40e-4768-ae29-519d16ecb0fb",
    "newRegistrationFormId": "42f9d0ef-a454-40d5-8ca4-075b9e70b782",
    "isExisting": false,
    "nextStep": "Provide type and reason to save data"
  }
*/
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to start form",
      });
    }
  },
);

// Submit Documents
export const submitRenewalDocuments = createAsyncThunk(
  "renewal/submitDocuments",
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
        "/renewal-restor/forms/step2/documents",
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

// Create Payment
export const createRenewalPayment = createAsyncThunk(
  "renewal/createPayment",
  async (
    data: { practionearFormId: string; type: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/payments/practionear/create", data);
      return response.data;
      /*
{
    "message": "Application for CCMP Certificare payment created successfully",
    "paymentId": "98408e9d-24d8-49a3-a9a8-dd56a7dc2173",
    "practionearFormId": "173ef001-3b1b-49de-b01b-c33f36e4dedd",
    "applicationType": "Application for CCMP Certificare",
    "amount": 500,
    "status": "INITIATED",
    "applicationStatus": "PAYMENT_PENDING",
    "nextAction": "Complete payment to proceed with application"
}

         */
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to create payment",
      });
    }
  },
);

// Submit Application
export const submitRenewalApplication = createAsyncThunk(
  "renewal/submitApplication",
  async (
    data: { type: string; formId: string; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/practionear-applications/save", data);
      return response.data;
      /*
{
  "message": "Application for Reneval/Restoration data saved successfully",
  "formId": "11806b50-302a-4ae3-99bf-387396bf90d0",
  "applicationId": "20acef49-3b60-4685-85e0-c19991165323",
  "applicationType": "Application for Reneval/Restoration",
  "fee": 4000,
  "isNew": true,
  "linkedData": {
      "newRegistrationFormId": "42f9d0ef-a454-40d5-8ca4-075b9e70b782",
      "userPiId": "8d7a7a47-7f03-41ac-a433-345927ce8e8f",
      "userAddressId": "09f6879c-737b-4c08-8d23-35557ef547a6",
      "userQualificationId": "864fb1c1-218c-4d48-8180-3f99c7f89c28",
      "userPersonalDocId": "80903987-d089-44d9-b3e1-58af6a26d575",
      "reason": "I require a certificate of practice to establish my clinic in Mumbai. I have completed all necessary training and examinations as per the council requirements."
  },
  "nextStep": "Complete payment of ₹4000 to proceed"
}

     */
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response)
        return rejectWithValue(err.response.data);
      return rejectWithValue({
        message: err.message || "Failed to submit application",
      });
    }
  },
);

// NEW: Load all existing form data at once
export const loadExistingFormData = createAsyncThunk(
  "form/loadExistingData",
  async (formId: string, { dispatch }) => {
    try {
      // Fetch all step data in parallel
      const [personalInfo, address, qualification] = await Promise.allSettled([
        api.get(`/practitioners/forms/step1/personal-info?formId=${formId}`),
        api.get(`/practitioners/forms/step2/address?formId=${formId}`),
        api.get(`/practitioners/forms/step3/qualification?formId=${formId}`),
      ]);

      return {
        personalInfo:
          personalInfo.status === "fulfilled" ? personalInfo.value.data : null,
        address: address.status === "fulfilled" ? address.value.data : null,
        qualification:
          qualification.status === "fulfilled"
            ? qualification.value.data
            : null,
      };
    } catch (error) {
      throw error;
    }
  },
);
