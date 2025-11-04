import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  startNOCForm,
  submitNOCDocuments,
  createNOCPayment,
  submitNOCApplication,
  loadExistingNOCData,
} from "../actions/nocMMCActions";

// NOC specific types

export interface NOCDocuments {
  supportiveDocument: File | null;
}

export interface NOCPayment {
  paymentId: string;
  applicationType: string;
  payment_name: string;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "INITIATED";
  paymentMethod: "upi" | "credit-debit-card" | "net-banking" | "digital-wallet";
  receiptId: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
}

export interface NOCMMCFormState {
  formId: string;
  practitionerId: string;
  applicationType: string;
  isExistingForm: boolean;
  dataLoaded: boolean;
  submittedSteps: string[];

  stepId: string;
  currentStep: number;

  // NEW: Store reference to New Registration form ID
  // The Overview will fetch data from applicationForm slice using this
  newRegistrationFormId: string;

  documents: NOCDocuments;
  payment: NOCPayment;
  uploadedUrls: { [key: string]: string };

  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
  finalConsent: boolean;
}

const initialState: NOCMMCFormState = {
  formId: "",
  practitionerId: "",
  applicationType: "NOC_Registration",
  isExistingForm: false,
  dataLoaded: false,
  submittedSteps: [],

  stepId: "overview",
  currentStep: 1,

  newRegistrationFormId: "", // NEW: Links to New Registration form
  documents: {
    supportiveDocument: null,
  },

  payment: {
    paymentId: "",
    applicationType: "NOC_Registration",
    payment_name: "NOC Registration Fee",
    amount: 500,
    status: "PENDING",
    paymentMethod: "upi",
    receiptId: "",
    razorpay_payment_id: null,
    razorpay_order_id: null,
  },

  uploadedUrls: {},
  loading: false,
  error: null,
  submitSuccess: false,
  finalConsent: false,
};

export const NOC_STEP_CONFIG = {
  overview: {
    id: "overview",
    stepNumber: 1,
    nextStep: "payment",
  },
  payment: {
    id: "payment",
    stepNumber: 2,
    nextStep: "submit",
  },
  submit: {
    id: "submit",
    stepNumber: 3,
    nextStep: null,
  },
} as const;

export const ICARDFormSlice = createSlice({
  name: "ICARDForm",
  initialState,
  reducers: {
    // NEW: Set the New Registration form ID for Overview reference
    setNewRegistrationFormId: (state, action: PayloadAction<string>) => {
      state.newRegistrationFormId = action.payload;
    },

    updateNOCDocument: (
      state,
      action: PayloadAction<{
        docType: keyof NOCDocuments;
        file: File | null;
      }>,
    ) => {
      const { docType, file } = action.payload;
      state.documents[docType] = file;
    },

    updateNOCPayment: (state, action: PayloadAction<Partial<NOCPayment>>) => {
      state.payment = { ...state.payment, ...action.payload };
    },

    setNOCStep: (
      state,
      action: PayloadAction<{ stepId: string; stepNumber?: number }>,
    ) => {
      state.stepId = action.payload.stepId;
      if (action.payload.stepNumber !== undefined) {
        state.currentStep = action.payload.stepNumber;
      }
    },

    setNOCFormId: (state, action: PayloadAction<string>) => {
      state.formId = action.payload;
    },

    setNOCSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
    },

    setNOCFinalConsent: (state, action: PayloadAction<boolean>) => {
      state.finalConsent = action.payload;
    },

    clearNOCError: (state) => {
      state.error = null;
    },

    resetNOCForm: () => initialState,
  },

  extraReducers: (builder) => {
    // Start Form
    builder
      .addCase(startNOCForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startNOCForm.fulfilled, (state, action) => {
        state.loading = false;
        state.formId = action.payload.formId;
        state.practitionerId = action.payload.practitionerId || "";
        state.applicationType = action.payload.applicationType;
        state.isExistingForm = action.payload.isExisting;
        state.dataLoaded = !action.payload.isExisting;

        // NEW: Store New Registration form ID if provided
        if (action.payload.newRegistrationFormId) {
          state.newRegistrationFormId = action.payload.newRegistrationFormId;
        }

        if (action.payload.isExisting && action.payload.nextStep) {
          const nextStepNum =
            typeof action.payload.nextStep === "number"
              ? action.payload.nextStep
              : 1;
          state.currentStep = nextStepNum;

          const stepIdMap: { [key: number]: string } = {
            1: "overview",
            2: "payment",
            3: "submit",
          };
          state.stepId = stepIdMap[nextStepNum] || "overview";
        }
      })
      .addCase(startNOCForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to start NOC form";
      });

    // Documents
    builder
      .addCase(submitNOCDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitNOCDocuments.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("upload-documents")) {
          state.submittedSteps.push("upload-documents");
        }
        if (action.payload.uploadedUrls) {
          state.uploadedUrls = action.payload.uploadedUrls;
        }
      })
      .addCase(submitNOCDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to upload documents";
      });

    // Payment
    builder
      .addCase(createNOCPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNOCPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("payment")) {
          state.submittedSteps.push("payment");
        }
        state.payment = {
          ...state.payment,
          paymentId: action.payload.paymentId || "",
          amount: action.payload.amount || 0,
          status: action.payload.status || "PENDING",
          razorpay_payment_id: action.payload.razorpay_payment_id || null,
          razorpay_order_id: action.payload.razorpay_order_id || null,
        };
      })
      .addCase(createNOCPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create payment";
      });

    // Submit Application
    builder
      .addCase(submitNOCApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitNOCApplication.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.error) {
          state.error = action.payload.error;
        } else {
          if (!state.submittedSteps.includes("submit")) {
            state.submittedSteps.push("submit");
          }
          state.submitSuccess = true;
        }
      })
      .addCase(submitNOCApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit application";
      });

    // Load Existing Data
    builder
      .addCase(loadExistingNOCData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExistingNOCData.fulfilled, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;

        if (action.payload.documents?.data) {
          state.uploadedUrls = action.payload.documents.data;
        }

        if (action.payload.payment?.data) {
          state.payment = {
            ...state.payment,
            ...action.payload.payment.data,
          };
        }
      })
      .addCase(loadExistingNOCData.rejected, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;
        state.error = action.error.message || "Failed to load existing data";
      });
  },
});

export const {
  setNewRegistrationFormId,
  updateNOCDocument,
  updateNOCPayment,
  setNOCStep,
  setNOCFormId,
  setNOCSubmitSuccess,
  setNOCFinalConsent,
  clearNOCError,
  resetNOCForm,
} = ICARDFormSlice.actions;

// Selectors
export const selectICARDFormState = (state: RootState) => state.ICARDForm;
export const selectICARDCurrentStep = (state: RootState) =>
  state.ICARDForm.stepId;
export const selectICARDSubmitSuccess = (state: RootState) =>
  state.ICARDForm.submitSuccess;
export const selectICARDDocuments = (state: RootState) =>
  state.ICARDForm.documents;
export const selectICARDPayment = (state: RootState) => state.ICARDForm.payment;
export const selectICARDFormId = (state: RootState) => state.ICARDForm.formId;
export const selectICARDLoading = (state: RootState) => state.ICARDForm.loading;
export const selectICARDError = (state: RootState) => state.ICARDForm.error;
export const selectICARDFinalConsent = (state: RootState) =>
  state.ICARDForm.finalConsent;
export const selectICARDSubmittedSteps = (state: RootState) =>
  state.ICARDForm.submittedSteps;
export const selectICARDNewRegistrationFormId = (state: RootState) =>
  state.ICARDForm.newRegistrationFormId;

// NEW: Selector to get Overview data from New Registration form
export const selectOverviewData = (state: RootState) => {
  return {
    personalInfo: state.applicationForm.personalInfo,
    addresses: state.applicationForm.addresses,
    qualification: state.applicationForm.qualification,
    practitionerId: state.applicationForm.practitionerId,
  };
};

export default ICARDFormSlice.reducer;
