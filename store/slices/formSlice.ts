import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  createPayment,
  startForm,
  submitAadhar,
  submitAddress,
  submitApplication,
  submitDocuments,
  submitPersonalInfo,
  submitQualification,
  fetchPersonalInfo,
  fetchAddress,
  fetchQualification,
  fetchDocuments,
  fetchAadhar,
  fetchPayment,
  loadExistingFormData,
  loadExistingFormDataSelective,
  verifyPayment,
} from "../actions/newRegAction";
import { parse } from "path";

// API Response Types

export interface ApiResponse<T = any> {
  message: string;
  formId: string;
  stepCompleted?: number;
  nextStep?: number | string;
  data?: T;
}

export interface StartFormResponse {
  message: string;
  formId: string;
  applicationType: string;
  nextStep: string;
  isExisting: boolean;
  practitionerId?: string;
}

export interface DocumentUploadResponse {
  message: string;
  formId: string;
  stepCompleted: number;
  nextStep: number;
  academicDocsCreated: boolean;
  personalDocsCreated: boolean;
  uploadedUrls: {
    [key: string]: string;
  };
}

export interface PaymentResponse {
  razorpay_order_id: null;
  razorpay_payment_id: null;
  message: string;
  paymentId: string;
  formId: string;
  applicationType: string;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "INITIATED" | "REFUNDED";
  requiredSteps: string[];
  nextAction: string;
}

// Personal Info (aligned with API)
export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  dob: string; // API uses "dob" instead of "dateOfBirth"
  nationality: string;
  maritalStatus: "Single" | "Married" | "";
  mobileNo: string; // API uses "mobileNo" instead of "mobileNumber"
  email: string; // API uses "email" instead of "emailAddress"
  motherName: string; // API uses "motherName" instead of "mothersName"
  fatherName: string; // API uses "fatherName" instead of "fathersName"
}

export interface Addresses {
  // API uses different naming convention
  permanent: {
    permanentStreet: string;
    permanentArea: string;
    permanentCity: string;
    permanentDistrict: string;
    permanentState: string;
    permanentPincode: string;
  };
  correspondence: {
    correStreet: string;
    correArea: string;
    correCity: string;
    correDistrict: string;
    correState: string;
    correPincode: string;
  };
  isSameAddress: boolean;
}

// Qualification (aligned with API)
export interface Qualification {
  degreeName: string; // API uses "degreeName" instead of "degree"
  collegeName: string; // API uses "collegeName" instead of "college"
  universityName: string; // API uses "universityName" instead of "university"
  yearOfAdmission: number;
  yearOfPassing: number;
  internship: string; // API uses "internship" instead of "internshipStatus"
  rollNo: string; // API uses "rollNo" instead of "rollNumber"
}

// Documents (aligned with API field names)
export interface Documents {
  tenthMarksheet: File | string | null; // API uses "tenthMarksheet"
  twelfthMarksheet: File | string | null; // API uses "twelfthMarksheet"
  finalYearMarksheet: File | string | null; // API uses "finalYearMarksheet"
  collegeLeaving: File | string | null; // API uses "collegeLeaving"
  attemptCertificate: File | string | null;
  internshipCertificate: File | string | null;
  photo: File | string | null; // API uses "photo"
  signature: File | string | null; // API uses "signature"
  idProof: File | string | null; // API uses "idProof"
  nationalityCertificate: File | string | null; // API uses "nationalityCertificate"
}

// Aadhar Verification (aligned with API)
export interface AadharVerification {
  aadharNo: string; // API uses "aadharNo"
  validAadhar: boolean; // API uses "validAadhar"
  verificationMethod: "aadhar-number" | "virtual-id" | "";
  vid: string | null;
  otp: string;
  isVerified: boolean;
  consentCheckbox: boolean;
}

// Payment
export interface Payment {
  paymentId: string;
  applicationType: string;
  payment_name: string;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "INITIATED" | "REFUNDED";
  paymentMethod: "upi" | "credit-debit-card" | "net-banking" | "digital-wallet";
  receiptId: string;
  razorpay_payment_id?: string | null; // MAKE OPTIONAL
  razorpay_order_id?: string | null; // MAKE OPTIONAL
  payment_date?: string; // ADD
  createdAt?: string; // ADD
  note?: string | null; // ADD
}

// Main form state
export interface FormState {
  formId: string;
  practitionerId: string;
  applicationType: string;
  isExistingForm: boolean;
  dataLoaded: boolean;

  // CHANGE: Use array instead of Set (Redux requires serializable data)
  submittedSteps: string[]; // Array of step IDs that have been successfully submitted

  stepId: string;
  currentStep: number;
  personalInfo: PersonalInfo;
  addresses: Addresses;
  qualification: Qualification;
  documents: Documents;
  aadharVerification: AadharVerification;
  payment: Payment;
  uploadedUrls: { [key: string]: string };
  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
  finalConsent: boolean;
}

// Update initial state
const initialState: FormState = {
  formId: "",
  practitionerId: "",
  applicationType: "New_Registration",
  isExistingForm: false,
  dataLoaded: false,

  // Initialize as empty array
  submittedSteps: [],

  stepId: "personal-information",
  currentStep: 1,
  personalInfo: {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    nationality: "",
    maritalStatus: "",
    mobileNo: "",
    email: "",
    motherName: "",
    fatherName: "",
  },
  addresses: {
    permanent: {
      permanentStreet: "",
      permanentArea: "",
      permanentCity: "",
      permanentDistrict: "",
      permanentState: "",
      permanentPincode: "",
    },
    correspondence: {
      correStreet: "",
      correArea: "",
      correCity: "",
      correDistrict: "",
      correState: "",
      correPincode: "",
    },
    isSameAddress: false,
  },
  qualification: {
    degreeName: "",
    collegeName: "",
    universityName: "",
    yearOfAdmission: new Date().getFullYear(),
    yearOfPassing: new Date().getFullYear(),
    internship: "",
    rollNo: "",
  },
  documents: {
    tenthMarksheet: null,
    twelfthMarksheet: null,
    finalYearMarksheet: null,
    collegeLeaving: null,
    attemptCertificate: null,
    internshipCertificate: null,
    photo: null,
    signature: null,
    idProof: null,
    nationalityCertificate: null,
  },
  aadharVerification: {
    aadharNo: "",
    validAadhar: false,
    verificationMethod: "",
    vid: "",
    otp: "",
    isVerified: false,
    consentCheckbox: false,
  },
  payment: {
    paymentId: "",
    applicationType: "New_Registration",
    payment_name: "Medical License Application Fee",
    amount: 1000,
    status: "PENDING",
    paymentMethod: "upi",
    receiptId: "",
    razorpay_payment_id: null, // ADD
    razorpay_order_id: null, // ADD
  },

  submitSuccess: false,
  finalConsent: false,
  loading: false,
  error: null,
  uploadedUrls: {},
};

export const STEP_CONFIG = {
  "personal-information": {
    id: "personal-information",
    stepNumber: 1,
    nextStep: "address",
  },
  address: {
    id: "address",
    stepNumber: 2,
    nextStep: "qualifications",
  },
  qualifications: {
    id: "qualifications",
    stepNumber: 3,
    nextStep: "upload-documents",
  },
  "upload-documents": {
    id: "upload-documents",
    stepNumber: 4,
    nextStep: "aadhar-verification",
  },
  "aadhar-verification": {
    id: "aadhar-verification",
    stepNumber: 5,
    nextStep: "application-summary",
  },
  "application-summary": {
    id: "application-summary",
    stepNumber: 6,
    nextStep: "payment",
  },
  payment: {
    id: "payment",
    stepNumber: 7,
    nextStep: "submit",
  },
  submit: {
    id: "submit",
    stepNumber: 8,
    nextStep: null,
  },
} as const;

export const formSlice = createSlice({
  name: "applicationForm",
  initialState,
  reducers: {
    // Personal Info
    updatePersonalInfo: (
      state,
      action: PayloadAction<Partial<PersonalInfo>>,
    ) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },

    // Address
    updatePermanentAddress: (
      state,
      action: PayloadAction<Partial<Addresses["permanent"]>>,
    ) => {
      state.addresses.permanent = {
        ...state.addresses.permanent,
        ...action.payload,
      };
      if (state.addresses.isSameAddress) {
        const correUpdates: Partial<Addresses["correspondence"]> = {};
        Object.keys(action.payload).forEach((key) => {
          const correKey = key.replace(
            "permanent",
            "corre",
          ) as keyof Addresses["correspondence"];
          correUpdates[correKey] =
            action.payload[key as keyof Addresses["permanent"]]!;
        });
        state.addresses.correspondence = {
          ...state.addresses.correspondence,
          ...correUpdates,
        };
      }
    },
    updateCorrespondenceAddress: (
      state,
      action: PayloadAction<Partial<Addresses["correspondence"]>>,
    ) => {
      state.addresses.correspondence = {
        ...state.addresses.correspondence,
        ...action.payload,
      };
    },
    setSameAddresses: (state, action: PayloadAction<boolean>) => {
      state.addresses.isSameAddress = action.payload;
      if (action.payload) {
        // Copy permanent to correspondence with proper field mapping
        state.addresses.correspondence = {
          correStreet: state.addresses.permanent.permanentStreet,
          correArea: state.addresses.permanent.permanentArea,
          correCity: state.addresses.permanent.permanentCity,
          correDistrict: state.addresses.permanent.permanentDistrict,
          correState: state.addresses.permanent.permanentState,
          correPincode: state.addresses.permanent.permanentPincode,
        };
      }
    },

    // Qualification
    updateQualification: (
      state,
      action: PayloadAction<Partial<Qualification>>,
    ) => {
      state.qualification = { ...state.qualification, ...action.payload };
    },

    // Documents
    updateDocument: (
      state,
      action: PayloadAction<{ docType: keyof Documents; file: File | null }>,
    ) => {
      const { docType, file } = action.payload;
      state.documents[docType] = file;
    },

    // Aadhar Verification
    updateAadharVerification: (
      state,
      action: PayloadAction<Partial<AadharVerification>>,
    ) => {
      state.aadharVerification = {
        ...state.aadharVerification,
        ...action.payload,
      };
    },

    // Payment
    updatePayment: (state, action: PayloadAction<Partial<Payment>>) => {
      state.payment = { ...state.payment, ...action.payload };
    },

    // General
    setStep: (
      state,
      action: PayloadAction<{ stepId: string; stepNumber?: number }>,
    ) => {
      state.stepId = action.payload.stepId;
      if (action.payload.stepNumber !== undefined) {
        state.currentStep = action.payload.stepNumber;
      }
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
    resetForm: () => initialState,
    setSubmittedSteps: (state, action: PayloadAction<string[]>) => {
      state.submittedSteps = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Start Form
    builder
      .addCase(startForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In formSlice.ts - Update the startForm.fulfilled case
      .addCase(startForm.fulfilled, (state, action) => {
        state.loading = false;
        state.formId = action.payload.formId;
        state.practitionerId = action.payload.practitionerId || "";
        state.applicationType = action.payload.applicationType;
        state.isExistingForm = action.payload.isExisting;

        // IMPORTANT: Only mark data as loaded if it's a new form
        // If existing, wait for loadExistingFormData to complete
        // state.dataLoaded = !action.payload.isExisting;

        if (action.payload.isExisting && action.payload.nextStep) {
          const nextStepNum =
            typeof action.payload.nextStep === "number"
              ? action.payload.nextStep
              : parseInt(action.payload.nextStep);
          // state.currentStep = nextStepNum;

          const stepIdMap: { [key: number]: string } = {
            1: "personal-information",
            2: "address",
            3: "qualifications",
            4: "upload-documents",
            5: "aadhar-verification",
            6: "application-summary",
            7: "payment",
            8: "submit",
          };
          // state.stepId = stepIdMap[nextStepNum] || "personal-information";
          for (let i = 1; i < nextStepNum; i++) {
            const stepId = stepIdMap[i];
            if (stepId && !state.submittedSteps.includes(stepId)) {
              state.submittedSteps.push(stepId);
            }
          }
          state.currentStep = nextStepNum;
          state.stepId = stepIdMap[nextStepNum] || "personal-information";
        } else {
          state.stepId = "personal-information";
          state.currentStep = 1;
        }
        state.dataLoaded = !action.payload.isExisting;
      })

      .addCase(startForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to start form";
      });

    // Load all existing form data
    builder
      .addCase(loadExistingFormData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExistingFormData.fulfilled, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;

        // Personal Info
        if (action.payload.personalInfo?.data) {
          const data = action.payload.personalInfo.data;
          state.personalInfo = {
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            dob: data.dob || "",
            nationality: data.nationality || "",
            maritalStatus: data.maritalStatus || "",
            mobileNo: data.mobileNo || "",
            email: data.email || "",
            motherName: data.motherName || "",
            fatherName: data.fatherName || "",
          };
        }

        // Address
        if (action.payload.address?.data) {
          const data = action.payload.address.data;
          state.addresses = {
            permanent: {
              permanentStreet: data.permanentStreet || "",
              permanentArea: data.permanentArea || "",
              permanentCity: data.permanentCity || "",
              permanentDistrict: data.permanentDistrict || "",
              permanentState: data.permanentState || "",
              permanentPincode: data.permanentPincode || "",
            },
            correspondence: {
              correStreet: data.correStreet || "",
              correArea: data.correArea || "",
              correCity: data.correCity || "",
              correDistrict: data.correDistrict || "",
              correState: data.correState || "",
              correPincode: data.correPincode || "",
            },
            isSameAddress: false,
          };
        }

        // Qualification
        if (action.payload.qualification?.data) {
          const data = action.payload.qualification.data;
          state.qualification = {
            degreeName: data.degreeName || "",
            collegeName: data.collegeName || "",
            universityName: data.universityName || "",
            yearOfAdmission: data.yearOfAdmission || new Date().getFullYear(),
            yearOfPassing: data.yearOfPassing || new Date().getFullYear(),
            internship: data.internship || "",
            rollNo: data.rollNo || "",
          };
        }

        // Documents (store URLs)
        if (action.payload.documents?.data) {
          const academicDocs = action.payload.documents.data.academicDocuments;
          const personalDocs = action.payload.documents.data.personalDocuments;

          if (academicDocs) {
            state.uploadedUrls = {
              ...state.uploadedUrls,
              tenthMarksheet: academicDocs.tenthMarksheet || "",
              twelfthMarksheet: academicDocs.twelthMarksheet || "",
              finalYearMarksheet: academicDocs.finalYearMarksheet || "",
              collegeLeaving: academicDocs.collegeLeaving || "",
              attemptCertificate: academicDocs.attemptCertificate || "",
              internshipCertificate: academicDocs.internshipCertificate || "",
            };

            state.documents.tenthMarksheet = academicDocs.tenthMarksheet || null;
            state.documents.twelfthMarksheet = academicDocs.twelthMarksheet || null;
            state.documents.finalYearMarksheet = academicDocs.finalYearMarksheet || null;
            state.documents.collegeLeaving = academicDocs.collegeLeaving || null;
            state.documents.attemptCertificate = academicDocs.attemptCertificate || null;
            state.documents.internshipCertificate = academicDocs.internshipCertificate || null;
          }

          if (personalDocs) {
            state.uploadedUrls = {
              ...state.uploadedUrls,
              photo: personalDocs.photo || "",
              signature: personalDocs.signature || "",
              idProof: personalDocs.idProof || "",
              nationalityCertificate: personalDocs.nationalityCertificate || "",
            };

            state.documents.photo = personalDocs.photo || null;
            state.documents.signature = personalDocs.signature || null;
            state.documents.idProof = personalDocs.idProof || null;
            state.documents.nationalityCertificate = personalDocs.nationalityCertificate || null;
          }
        }

        // Aadhar
        if (action.payload.aadhar?.data) {
          const data = action.payload.aadhar.data;
          state.aadharVerification = {
            ...state.aadharVerification,
            aadharNo: data.aadharNo || "",
            validAadhar: data.validAadhar || false,
            isVerified: data.isVerified || false,
          };
          if (data.isVerified && data.validAadhar) {
            if (!state.submittedSteps.includes('aadhar-verification')) {
              state.submittedSteps.push('aadhar-verification');
            }
          }
        }

        // Payment
        if (action.payload.payment?.data?.currentPayment) {
          const data = action.payload.payment.data.currentPayment;
          state.payment = {
            ...state.payment,
            paymentId: data.paymentId || "",
            amount: parseFloat(data.amount) || 0,
            status: data.status || "PENDING",
          };
        }
      })
      .addCase(loadExistingFormData.rejected, (state, action) => {
        state.loading = false;
        state.dataLoaded = true; // Mark as loaded even on error to prevent infinite loading
        state.error = action.error.message || "Failed to load existing data";
      });

    builder
      .addCase(loadExistingFormDataSelective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExistingFormDataSelective.fulfilled, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;

        console.log("Selective data loaded:", action.payload);

        // Personal Info (Step 1)
        if (action.payload.personalInfo?.data) {
          const data = action.payload.personalInfo.data;
          state.personalInfo = {
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            dob: data.dob || "",
            nationality: data.nationality || "",
            maritalStatus: data.maritalStatus || "",
            mobileNo: data.mobileNo || "",
            email: data.email || "",
            motherName: data.motherName || "",
            fatherName: data.fatherName || "",
          };
          console.log("Personal info loaded into state:", state.personalInfo);
        }

        // Address (Step 2)
        if (action.payload.address?.data) {
          const data = action.payload.address.data;
          state.addresses = {
            permanent: {
              permanentStreet: data.permanentStreet || "",
              permanentArea: data.permanentArea || "",
              permanentCity: data.permanentCity || "",
              permanentDistrict: data.permanentDistrict || "",
              permanentState: data.permanentState || "",
              permanentPincode: data.permanentPincode || "",
            },
            correspondence: {
              correStreet: data.correStreet || "",
              correArea: data.correArea || "",
              correCity: data.correCity || "",
              correDistrict: data.correDistrict || "",
              correState: data.correState || "",
              correPincode: data.correPincode || "",
            },
            isSameAddress: false,
          };
          console.log("Address loaded into state:", state.addresses);
        }

        // Qualification (Step 3)
        if (action.payload.qualification?.data) {
          const data = action.payload.qualification.data;
          state.qualification = {
            degreeName: data.degreeName || "",
            collegeName: data.collegeName || "",
            universityName: data.universityName || "",
            yearOfAdmission: data.yearOfAdmission || new Date().getFullYear(),
            yearOfPassing: data.yearOfPassing || new Date().getFullYear(),
            internship: data.internship || "",
            rollNo: data.rollNo || "",
          };
          console.log("Qualification loaded into state:", state.qualification);
        }

        // Documents (Step 4) - Store URLs
        if (action.payload.documents?.data) {
          const academicDocs = action.payload.documents.data.academicDocuments;
          const personalDocs = action.payload.documents.data.personalDocuments;
          const uploadStatus = action.payload.documents.data.uploadStatus;
          if (uploadStatus?.allDocumentsUploaded) {
            if (!state.submittedSteps.includes("upload-documents")) {
              state.submittedSteps.push("upload-documents");
            }
          }

          if (academicDocs) {
            state.uploadedUrls = {
              ...state.uploadedUrls,
              tenthMarksheet: academicDocs.tenthMarksheet || "",
              twelfthMarksheet: academicDocs.twelthMarksheet || "",
              finalYearMarksheet: academicDocs.finalYearMarksheet || "",
              collegeLeaving: academicDocs.collegeLeaving || "",
              attemptCertificate: academicDocs.attemptCertificate || "",
              internshipCertificate: academicDocs.internshipCertificate || "",
            };
            state.documents.tenthMarksheet = academicDocs.tenthMarksheet || null;
            state.documents.twelfthMarksheet = academicDocs.twelthMarksheet || null;
            state.documents.finalYearMarksheet = academicDocs.finalYearMarksheet || null;
            state.documents.collegeLeaving = academicDocs.collegeLeaving || null;
            state.documents.attemptCertificate = academicDocs.attemptCertificate || null;
            state.documents.internshipCertificate = academicDocs.internshipCertificate || null;
          }

          if (personalDocs) {
            state.uploadedUrls = {
              ...state.uploadedUrls,
              photo: personalDocs.photo || "",
              signature: personalDocs.signature || "",
              idProof: personalDocs.idProof || "",
              nationalityCertificate: personalDocs.nationalityCertificate || "",
            };

            state.documents.photo = personalDocs.photo || null;
            state.documents.signature = personalDocs.signature || null;
            state.documents.idProof = personalDocs.idProof || null;
            state.documents.nationalityCertificate = personalDocs.nationalityCertificate || null;
          }
          console.log("Documents loaded into state:", state.uploadedUrls);
        }

        // Aadhar (Step 5)
        if (action.payload.aadhar?.data) {
          const data = action.payload.aadhar.data;
          state.aadharVerification = {
            ...state.aadharVerification,
            aadharNo: data.aadharNo || "",
            validAadhar: data.validAadhar || false,
            isVerified: data.isVerified || false,
          };

          if (data.isVerified && data.validAadhar) {
            if (!state.submittedSteps.includes('aadhar-verification')) {
              state.submittedSteps.push('aadhar-verification');
            }
          }
          console.log("Aadhar loaded into state:", state.aadharVerification);
        }

        // Payment (Step 6)
        if (action.payload.payment?.data?.currentPayment) {
          const data = action.payload.payment.data.currentPayment;
          state.payment = {
            ...state.payment,
            paymentId: data.paymentId || "",
            amount: parseFloat(data.amount) || 0,
            status: data.status || "PENDING",
          };

          if (data.status === "SUCCESSFUL") {
            if (!state.submittedSteps.includes('payment')) {
              state.submittedSteps.push('payment');
            }
          }
          console.log("Payment loaded into state:", state.payment);
        }
      })
      .addCase(loadExistingFormDataSelective.rejected, (state, action) => {
        state.loading = false;
        state.dataLoaded = true;
        state.error = action.error.message || "Failed to load existing data";
        console.error("Failed to load selective data:", action.error);
      });

    // Individual fetch handlers (optional - for fetching specific steps)
    builder.addCase(fetchPersonalInfo.fulfilled, (state, action) => {
      if (action.payload.data) {
        const data = action.payload.data;
        state.personalInfo = {
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          dob: data.dob || "",
          nationality: data.nationality || "",
          maritalStatus: data.maritalStatus || "",
          mobileNo: data.mobileNo || "",
          email: data.email || "",
          motherName: data.motherName || "",
          fatherName: data.fatherName || "",
        };
      }
    });

    // Personal Info
    // Personal Info
    builder
      .addCase(submitPersonalInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPersonalInfo.fulfilled, (state, action) => {
        state.loading = false;

        // Add to array if not already present
        if (!state.submittedSteps.includes("personal-information")) {
          state.submittedSteps.push("personal-information");
        }

        if (action.payload.data) {
          state.personalInfo = {
            ...state.personalInfo,
            ...action.payload.data,
          };
        }
      })
      .addCase(submitPersonalInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit personal info";
      });

    // Address
    builder
      .addCase(submitAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAddress.fulfilled, (state, action) => {
        state.loading = false;

        // Add to array if not already present (FIXED: changed .add to .push)
        if (!state.submittedSteps.includes("address")) {
          state.submittedSteps.push("address");
        }

        // Update data if needed
        if (action.payload.data) {
          const data = action.payload.data;
          state.addresses.permanent = {
            permanentStreet: data.permanentStreet || "",
            permanentArea: data.permanentArea || "",
            permanentCity: data.permanentCity || "",
            permanentDistrict: data.permanentDistrict || "",
            permanentState: data.permanentState || "",
            permanentPincode: data.permanentPincode || "",
          };
          state.addresses.correspondence = {
            correStreet: data.correStreet || "",
            correArea: data.correArea || "",
            correCity: data.correCity || "",
            correDistrict: data.correDistrict || "",
            correState: data.correState || "",
            correPincode: data.correPincode || "",
          };
        }
      })
      .addCase(submitAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit address";
      });

    // Qualification
    builder
      .addCase(submitQualification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQualification.fulfilled, (state, action) => {
        state.loading = false;

        // Add to array if not already present (FIXED: changed .add to .push)
        if (!state.submittedSteps.includes("qualifications")) {
          state.submittedSteps.push("qualifications");
        }

        // Update data if returned
        if (action.payload.data) {
          state.qualification = {
            ...state.qualification,
            ...action.payload.data,
          };
        }
      })
      .addCase(submitQualification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit qualification";
      });

    // Documents
    builder
      .addCase(submitDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDocuments.fulfilled, (state, action) => {
        state.loading = false;

        // Add to array if not already present (FIXED: changed .add to .push)
        if (!state.submittedSteps.includes("upload-documents")) {
          state.submittedSteps.push("upload-documents");
        }

        // Update uploaded URLs
        if (action.payload.uploadedUrls) {
          state.uploadedUrls = action.payload.uploadedUrls;
        }
      })
      .addCase(submitDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to upload documents";
      });

    // Aadhar
    builder
      .addCase(submitAadhar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAadhar.fulfilled, (state, action) => {
        state.loading = false;

        // Update Aadhar data
        state.aadharVerification.aadharNo = action.payload.aadharNo || "";
        state.aadharVerification.validAadhar =
          action.payload.validAadhar || false;
        state.aadharVerification.isVerified = true;
      })
      .addCase(submitAadhar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to verify Aadhar";
      });

    // Payment
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;

        // Add to array if not already present (FIXED: changed .add to .push)
        if (!state.submittedSteps.includes("payment")) {
          state.submittedSteps.push("payment");
        }

        // Update payment data
        state.payment.paymentId = action.payload.paymentId || "";
        state.payment.amount = action.payload.amount || 0;
        state.payment.status = action.payload.status || "INITIATED";
        state.payment.razorpay_payment_id =
          action.payload.razorpay_payment_id || null;
        state.payment.razorpay_order_id =
          action.payload.razorpay_order_id || null;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;

        // With rejectWithValue, the error data is in action.payload
        const errorData = action.payload as any;

        // Check if payment was already completed (status 400 with SUCCESSFUL status)
        if (errorData?.status === "SUCCESSFUL") {
          // Payment already exists and is successful - update the state
          if (!state.submittedSteps.includes("payment")) {
            state.submittedSteps.push("payment");
          }

          state.payment.paymentId = errorData.paymentId;
          state.payment.status = "SUCCESSFUL";

          // Don't set error message for successful payments
          state.error = null;
        } else {
          // Actual error occurred
          state.error = errorData?.error || action.error.message || "Failed to create payment";
        }
      });

    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;

        // Update payment status to SUCCESSFUL
        state.payment.status = action.payload.status;
        state.payment.paymentId = action.payload.paymentId;
        state.payment.razorpay_payment_id = action.payload.paymentId;
        if(action.payload.nextStep === 'You can now submit your application') {
          state.stepId = 'submit';
        }

        // Mark payment step as completed
        if (action.payload.status === 'SUCCESSFUL') {
          if (!state.submittedSteps.includes('payment')) {
            state.submittedSteps.push('payment');
          }
          
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to verify payment';
        const errorData = action.payload as any;
        if(errorData.error === "Payment already verified") {
          state.payment.status = 'SUCCESSFUL';
          if(!state.submittedSteps.includes('payment')) {
            state.submittedSteps.push('payment');
          }
        } else {
          state.payment.status = 'FAILED';
        }
      });

    // Submit Application
    builder
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.error) {
          state.error = action.payload.error;
        } else {
          // Add to array if not already present (FIXED: changed .add to .push)
          if (!state.submittedSteps.includes("submit")) {
            state.submittedSteps.push("submit");
          }
          state.submitSuccess = true;
        }
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit application";
      });
  }, // ADD THIS CLOSING BRACE for extraReducers
});

export const {
  updatePersonalInfo,
  updatePermanentAddress,
  updateCorrespondenceAddress,
  setSameAddresses,
  updateQualification,
  updateDocument,
  updateAadharVerification,
  updatePayment,
  setStep,
  setFormId,
  setSubmitSuccess,
  setFinalConsent,
  clearError,
  resetForm,
  setSubmittedSteps
} = formSlice.actions;

// Selectors
export const selectFormState = (state: RootState) => state.applicationForm;
export const selectCurrentStep = (state: RootState) =>
  state.applicationForm.stepId;
export const selectSubmitSuccess = (state: RootState) =>
  state.applicationForm.submitSuccess;
export const selectPersonalInfo = (state: RootState) =>
  state.applicationForm.personalInfo;
export const selectAddresses = (state: RootState) =>
  state.applicationForm.addresses;
export const selectQualification = (state: RootState) =>
  state.applicationForm.qualification;
export const selectDocuments = (state: RootState) =>
  state.applicationForm.documents;
export const selectAadharVerification = (state: RootState) =>
  state.applicationForm.aadharVerification;
export const selectPayment = (state: RootState) =>
  state.applicationForm.payment;
export const selectFormId = (state: RootState) => state.applicationForm.formId;
export const selectLoading = (state: RootState) =>
  state.applicationForm.loading;
export const selectError = (state: RootState) => state.applicationForm.error;
export const selectFinalConsent = (state: RootState) =>
  state.applicationForm.finalConsent;
export const selectApplicationType = (state: RootState) =>
  state.applicationForm.applicationType;
export const selectIsExistingForm = (state: RootState) =>
  state.applicationForm.isExistingForm;
export const selectDataLoaded = (state: RootState) =>
  state.applicationForm.dataLoaded;
export const selectSubmittedSteps = (state: RootState) =>
  state.applicationForm.submittedSteps;

// ADD THIS LINE - Default export
export default formSlice.reducer;
