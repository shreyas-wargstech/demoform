import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  startRenewalForm,
  submitRenewalDocuments,
  createRenewalPayment,
  submitRenewalApplication,
} from "../actions/renewalRestorActions";

export interface RRDocuments {
  supportiveDocument: File | null;
}

export interface RRPayment {
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

export interface RenewalRestorState {
  formId: string;
  practitionerId: string;
  applicationType: string;
  isExistingForm: boolean;
  dataLoaded: boolean;
  submittedSteps: string[];

  stepId: string;
  currentStep: number;

  newRegistrationFormId: string;

  documents: RRDocuments;
  payment: RRPayment;
  uploadedUrls: { [key: string]: string };

  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
  finalConsent: boolean;
}

const initialState: RenewalRestorState = {
  formId: "",
  practitionerId: "",
  applicationType: "RENEWAL_RESTORATION",
  isExistingForm: false,
  dataLoaded: false,
  submittedSteps: [],

  stepId: "overview",
  currentStep: 1,

  newRegistrationFormId: "",

  documents: { supportiveDocument: null },

  payment: {
    paymentId: "",
    applicationType: "RENEWAL_RESTORATION",
    payment_name: "Renewal/Restoration Fee",
    amount: 0,
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

export const RENEWAL_STEP_CONFIG = {
  overview: { id: "overview", stepNumber: 1, nextStep: "upload-documents" },
  "upload-documents": {
    id: "upload-documents",
    stepNumber: 2,
    nextStep: "payment",
  },
  payment: { id: "payment", stepNumber: 3, nextStep: "submit" },
  submit: { id: "submit", stepNumber: 4, nextStep: null },
} as const;

export const RENEWAL_STEP_BY_NUMBER: Record<number, string> = Object.values(
  RENEWAL_STEP_CONFIG,
).reduce(
  (acc, s) => {
    acc[s.stepNumber] = s.id;
    return acc;
  },
  {} as Record<number, string>,
);

export const renewalRestorSlice = createSlice({
  name: "renewalRestorForm",
  initialState,
  reducers: {
    setNewRegistrationFormId: (state, action: PayloadAction<string>) => {
      state.newRegistrationFormId = action.payload;
    },
    updateDocuments: (
      state,
      action: PayloadAction<{ docType: keyof RRDocuments; file: File | null }>,
    ) => {
      const { docType, file } = action.payload;
      state.documents[docType] = file;
    },
    updatePayment: (state, action: PayloadAction<Partial<RRPayment>>) => {
      state.payment = { ...state.payment, ...action.payload };
    },
    setStep: (
      state,
      action: PayloadAction<{ stepId: string; stepNumber?: number }>,
    ) => {
      state.stepId = action.payload.stepId;
      if (action.payload.stepNumber !== undefined)
        state.currentStep = action.payload.stepNumber;
    },
    setFormId: (state, action: PayloadAction<string>) => {
      state.formId = action.payload;
    },
    setSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
    },
    setFinalConsent: (state, action: PayloadAction<boolean>) => {
      state.finalConsent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(startRenewalForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRenewalForm.fulfilled, (state, action) => {
        state.loading = false;
        state.formId = action.payload.formId;
        state.practitionerId = action.payload.practitionerId || "";
        state.applicationType =
          action.payload.applicationType || state.applicationType;
        state.isExistingForm = action.payload.isExisting;
        state.dataLoaded = !action.payload.isExisting;
        if (action.payload.newRegistrationFormId)
          state.newRegistrationFormId = action.payload.newRegistrationFormId;
        if (action.payload.isExisting && action.payload.nextStep) {
          const nextStepNum =
            typeof action.payload.nextStep === "number"
              ? action.payload.nextStep
              : 1;
          state.currentStep = nextStepNum;
          state.stepId = RENEWAL_STEP_BY_NUMBER[nextStepNum] || "overview";
        }
      })
      .addCase(startRenewalForm.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to start form";
      })

      .addCase(submitRenewalDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRenewalDocuments.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("upload-documents"))
          state.submittedSteps.push("upload-documents");
        if (action.payload?.uploadedUrls)
          state.uploadedUrls = action.payload.uploadedUrls;
      })
      .addCase(submitRenewalDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to upload documents";
      })

      .addCase(createRenewalPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRenewalPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("payment"))
          state.submittedSteps.push("payment");
        state.payment = {
          ...state.payment,
          paymentId: action.payload?.paymentId || "",
          amount: action.payload?.amount || 0,
          status: action.payload?.status || "PENDING",
          razorpay_payment_id: action.payload?.razorpay_payment_id || null,
          razorpay_order_id: action.payload?.razorpay_order_id || null,
        };
      })
      .addCase(createRenewalPayment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to create payment";
      })

      .addCase(submitRenewalApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRenewalApplication.fulfilled, (state, action) => {
        state.loading = false;
        if ((action.payload as any)?.error) {
          state.error = (action.payload as any).error;
        } else {
          if (!state.submittedSteps.includes("submit"))
            state.submittedSteps.push("submit");
          state.submitSuccess = true;
        }
      })
      .addCase(submitRenewalApplication.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to submit application";
      });
  },
});

export const {
  setNewRegistrationFormId,
  updateDocuments,
  updatePayment,
  setStep,
  setFormId,
  setSubmitSuccess,
  setFinalConsent,
  clearError,
  resetForm,
} = renewalRestorSlice.actions;

export const selectRenewalFormState = (state: RootState) =>
  state.renewalRestorForm;
export const selectRenewalCurrentStep = (state: RootState) =>
  state.renewalRestorForm.stepId;
export const selectRenewalSubmitSuccess = (state: RootState) =>
  state.renewalRestorForm.submitSuccess;
export const selectRenewalDocuments = (state: RootState) =>
  state.renewalRestorForm.documents;
export const selectRenewalPayment = (state: RootState) =>
  state.renewalRestorForm.payment;
export const selectRenewalFormId = (state: RootState) =>
  state.renewalRestorForm.formId;
export const selectRenewalLoading = (state: RootState) =>
  state.renewalRestorForm.loading;
export const selectRenewalError = (state: RootState) =>
  state.renewalRestorForm.error;
export const selectRenewalFinalConsent = (state: RootState) =>
  state.renewalRestorForm.finalConsent;
export const selectRenewalSubmittedSteps = (state: RootState) =>
  state.renewalRestorForm.submittedSteps;
export const selectRenewalNewRegistrationFormId = (state: RootState) =>
  state.renewalRestorForm.newRegistrationFormId;

export interface RenewalOverviewData {
  personalInfo: any | null;
  addresses: any | null;
  qualification: any | null;
  practitionerId: any | null;
}

export const selectRenewalOverviewData = (
  state: RootState,
): RenewalOverviewData => ({
  personalInfo: state.applicationForm?.personalInfo ?? null,
  addresses: state.applicationForm?.addresses ?? null,
  qualification: state.applicationForm?.qualification ?? null,
  practitionerId: state.applicationForm?.practitionerId ?? null,
});

export default renewalRestorSlice.reducer;
