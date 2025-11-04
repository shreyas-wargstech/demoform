import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  startCCMPForm,
  submitAdditionalQualifications,
  submitCCMPDocuments,
  createCCMPPayment,
  submitCCMPApplication,
  loadExistingCCMPData,
} from "../actions/ccmpActions";

// CCMP specific types
export interface AdditionalQualifications {
  additionalQualifications: string;
  prnNo: string;
  seatNo: string;
  university: string;
  college: string;
  examinationYear: string;
  monthOfExamination: string;
}

export interface CCMPDocuments {
  supportiveDocument: File | null;
}

export interface CCMPPayment {
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

export interface CCMPFormState {
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

  additionalQualifications: AdditionalQualifications;
  documents: CCMPDocuments;
  payment: CCMPPayment;
  uploadedUrls: { [key: string]: string };

  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
  finalConsent: boolean;
}

const initialState: CCMPFormState = {
  formId: "",
  practitionerId: "",
  applicationType: "CCMP_Registration",
  isExistingForm: false,
  dataLoaded: false,
  submittedSteps: [],

  stepId: "overview",
  currentStep: 1,

  newRegistrationFormId: "", // NEW: Links to New Registration form

  additionalQualifications: {
    additionalQualifications: "",
    prnNo: "",
    seatNo: "",
    university: "",
    college: "",
    examinationYear: "",
    monthOfExamination: "",
  },

  documents: {
    supportiveDocument: null,
  },

  payment: {
    paymentId: "",
    applicationType: "CCMP_Registration",
    payment_name: "CCMP Registration Fee",
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

export const CCMP_STEP_CONFIG = {
  overview: {
    id: "overview",
    stepNumber: 1,
    nextStep: "additional-qualifications",
  },
  "additional-qualifications": {
    id: "additional-qualifications",
    stepNumber: 2,
    nextStep: "upload-documents",
  },
  "upload-documents": {
    id: "upload-documents",
    stepNumber: 3,
    nextStep: "payment",
  },
  payment: {
    id: "payment",
    stepNumber: 4,
    nextStep: "submit",
  },
  submit: {
    id: "submit",
    stepNumber: 5,
    nextStep: null,
  },
} as const;

export const ccmpFormSlice = createSlice({
  name: "ccmpForm",
  initialState,
  reducers: {
    // NEW: Set the New Registration form ID for Overview reference
    setNewRegistrationFormId: (state, action: PayloadAction<string>) => {
      state.newRegistrationFormId = action.payload;
    },

    updateAdditionalQualifications: (
      state,
      action: PayloadAction<Partial<AdditionalQualifications>>,
    ) => {
      state.additionalQualifications = {
        ...state.additionalQualifications,
        ...action.payload,
      };
    },

    updateCCMPDocument: (
      state,
      action: PayloadAction<{
        docType: keyof CCMPDocuments;
        file: File | null;
      }>,
    ) => {
      const { docType, file } = action.payload;
      state.documents[docType] = file;
    },

    updateCCMPPayment: (state, action: PayloadAction<Partial<CCMPPayment>>) => {
      state.payment = { ...state.payment, ...action.payload };
    },

    setCCMPStep: (
      state,
      action: PayloadAction<{ stepId: string; stepNumber?: number }>,
    ) => {
      state.stepId = action.payload.stepId;
      if (action.payload.stepNumber !== undefined) {
        state.currentStep = action.payload.stepNumber;
      }
    },

    setCCMPFormId: (state, action: PayloadAction<string>) => {
      state.formId = action.payload;
    },

    setCCMPSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
    },

    setCCMPFinalConsent: (state, action: PayloadAction<boolean>) => {
      state.finalConsent = action.payload;
    },

    clearCCMPError: (state) => {
      state.error = null;
    },

    resetCCMPForm: () => initialState,
  },

  extraReducers: (builder) => {
    // Start Form
    builder
      .addCase(startCCMPForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startCCMPForm.fulfilled, (state, action) => {
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
            2: "additional-qualifications",
            3: "upload-documents",
            4: "payment",
            5: "submit",
          };
          state.stepId = stepIdMap[nextStepNum] || "overview";
        }
      })
      .addCase(startCCMPForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to start CCMP form";
      });

    // Additional Qualifications
    builder
      .addCase(submitAdditionalQualifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAdditionalQualifications.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("additional-qualifications")) {
          state.submittedSteps.push("additional-qualifications");
        }
        if (action.payload.data) {
          state.additionalQualifications = {
            ...state.additionalQualifications,
            ...action.payload.data,
          };
        }
      })
      .addCase(submitAdditionalQualifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit qualifications";
      });

    // Documents
    builder
      .addCase(submitCCMPDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCCMPDocuments.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.submittedSteps.includes("upload-documents")) {
          state.submittedSteps.push("upload-documents");
        }
        if (action.payload.uploadedUrls) {
          state.uploadedUrls = action.payload.uploadedUrls;
        }
      })
      .addCase(submitCCMPDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to upload documents";
      });

    // Payment
    builder
      .addCase(createCCMPPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCCMPPayment.fulfilled, (state, action) => {
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
      .addCase(createCCMPPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create payment";
      });

    // Submit Application
    builder
      .addCase(submitCCMPApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCCMPApplication.fulfilled, (state, action) => {
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
      .addCase(submitCCMPApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit application";
      });

    // Load Existing Data
    builder
      .addCase(loadExistingCCMPData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExistingCCMPData.fulfilled, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;

        if (action.payload.qualifications?.data) {
          state.additionalQualifications = {
            ...state.additionalQualifications,
            ...action.payload.qualifications.data,
          };
        }

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
      .addCase(loadExistingCCMPData.rejected, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;
        state.error = action.error.message || "Failed to load existing data";
      });
  },
});

export const {
  setNewRegistrationFormId,
  updateAdditionalQualifications,
  updateCCMPDocument,
  updateCCMPPayment,
  setCCMPStep,
  setCCMPFormId,
  setCCMPSubmitSuccess,
  setCCMPFinalConsent,
  clearCCMPError,
  resetCCMPForm,
} = ccmpFormSlice.actions;

// Selectors
export const selectCCMPFormState = (state: RootState) => state.ccmpForm;
export const selectCCMPCurrentStep = (state: RootState) =>
  state.ccmpForm.stepId;
export const selectCCMPSubmitSuccess = (state: RootState) =>
  state.ccmpForm.submitSuccess;
export const selectCCMPQualifications = (state: RootState) =>
  state.ccmpForm.additionalQualifications;
export const selectCCMPDocuments = (state: RootState) =>
  state.ccmpForm.documents;
export const selectCCMPPayment = (state: RootState) => state.ccmpForm.payment;
export const selectCCMPFormId = (state: RootState) => state.ccmpForm.formId;
export const selectCCMPLoading = (state: RootState) => state.ccmpForm.loading;
export const selectCCMPError = (state: RootState) => state.ccmpForm.error;
export const selectCCMPFinalConsent = (state: RootState) =>
  state.ccmpForm.finalConsent;
export const selectCCMPSubmittedSteps = (state: RootState) =>
  state.ccmpForm.submittedSteps;
export const selectNewRegistrationFormId = (state: RootState) =>
  state.ccmpForm.newRegistrationFormId;

// NEW: Selector to get Overview data from New Registration form
export const selectOverviewData = (state: RootState) => {
  return {
    personalInfo: state.applicationForm.personalInfo,
    addresses: state.applicationForm.addresses,
    qualification: state.applicationForm.qualification,
    practitionerId: state.applicationForm.practitionerId,
  };
};

export default ccmpFormSlice.reducer;
