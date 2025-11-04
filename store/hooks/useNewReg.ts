/* eslint-disable */
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  // Sync actions
  updatePersonalInfo,
  updatePermanentAddress,
  updateCorrespondenceAddress,
  setSameAddresses,
  updateQualification,
  updateDocument,
  updateAadhaarVerification,
  updatePayment,
  setStep,
  setFormId,
  setSubmitSuccess,
  setFinalConsent,
  clearError,
  resetForm,

  // Selectors
  selectFormState,
  selectCurrentStep,
  selectSubmitSuccess,
  selectPersonalInfo,
  selectAddresses,
  selectQualification,
  selectDocuments,
  selectAadhaarVerification,
  selectPayment,
  selectFormId,
  selectLoading,
  selectError,
  selectFinalConsent,
  selectApplicationType,
  selectSubmittedSteps,
} from "@/store/slices/formSlice";

import {
  startForm,
  submitPersonalInfo,
  submitAddress,
  submitQualification,
  submitDocuments,
  submitAadhaar,
  createPayment,
  submitApplication,
  fetchPersonalInfo,
  fetchAddress,
  fetchQualification,
  fetchDocuments,
  fetchAadhaar,
  fetchPayment,
  loadExistingFormData,
  loadExistingFormDataSelective,
} from "@/store/actions/newRegAction";

import { STEP_CONFIG } from "@/store/slices/formSlice";

// Types for the hook return value
interface UseFormReturn {
  // State
  formState: ReturnType<typeof selectFormState>;
  currentStep: string;
  submitSuccess: boolean;
  personalInfo: ReturnType<typeof selectPersonalInfo>;
  addresses: ReturnType<typeof selectAddresses>;
  qualification: ReturnType<typeof selectQualification>;
  documents: ReturnType<typeof selectDocuments>;
  aadhaarVerification: ReturnType<typeof selectAadhaarVerification>;
  payment: ReturnType<typeof selectPayment>;
  formId: string;
  loading: boolean;
  error: string | null;
  finalConsent: boolean;
  applicationType: string;

  // ADD THIS LINE
  submittedSteps: string[];

  // Async Actions
  actions: {
    startForm: (applicationType?: string) => Promise<any>;
    loadExistingFormData: (formId: string) => Promise<any>;
    loadExistingFormDataSelective: (
      formId: string,
      nextStep: number,
    ) => Promise<any>;
    fetchPersonalInfo: (formId: string) => Promise<any>;
    fetchAddress: (formId: string) => Promise<any>;
    fetchQualification: (formId: string) => Promise<any>;
    fetchDocuments: (formId: string) => Promise<any>;
    fetchAadhaar: (formId: string) => Promise<any>;
    fetchPayment: (formId: string) => Promise<any>;
    submitPersonalInfo: (
      data: Parameters<typeof submitPersonalInfo>[0],
    ) => Promise<any>;
    submitAddress: (data: Parameters<typeof submitAddress>[0]) => Promise<any>;
    submitQualification: (
      data: Parameters<typeof submitQualification>[0],
    ) => Promise<any>;
    submitDocuments: (
      data: Parameters<typeof submitDocuments>[0],
    ) => Promise<any>;
    submitAadhaar: (data: Parameters<typeof submitAadhaar>[0]) => Promise<any>;
    createPayment: (data: Parameters<typeof createPayment>[0]) => Promise<any>;
    submitApplication: (
      data: Parameters<typeof submitApplication>[0],
    ) => Promise<any>;
  };

  // Sync Actions
  mutations: {
    updatePersonalInfo: (
      data: Parameters<typeof updatePersonalInfo>[0],
    ) => void;
    updatePermanentAddress: (
      data: Parameters<typeof updatePermanentAddress>[0],
    ) => void;
    updateCorrespondenceAddress: (
      data: Parameters<typeof updateCorrespondenceAddress>[0],
    ) => void;
    setSameAddresses: (isSame: boolean) => void;
    updateQualification: (
      data: Parameters<typeof updateQualification>[0],
    ) => void;
    updateDocument: (data: Parameters<typeof updateDocument>[0]) => void;
    updateAadhaarVerification: (
      data: Parameters<typeof updateAadhaarVerification>[0],
    ) => void;
    updatePayment: (data: Parameters<typeof updatePayment>[0]) => void;
    setStep: (data: Parameters<typeof setStep>[0]) => void;
    setFormId: (id: string) => void;
    setSubmitSuccess: (success: boolean) => void;
    setFinalConsent: (consent: boolean) => void;
    clearError: () => void;
    resetForm: () => void;
  };

  // Utility functions
  utils: {
    isStepCompleted: (stepId: string) => boolean;
    canNavigateToStep: (stepId: string) => boolean;
    getCurrentStepNumber: () => number;
    getNextStepId: () => string | null;
    getPreviousStepId: () => string | null;
    validateCurrentStep: () => boolean;
    getFormProgress: () => number;
    isFormValid: () => boolean;
    navigateToStep: (stepId: string) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
  };
}

// Step order for navigation
const STEP_ORDER = [
  "personal-information",
  "address",
  "qualifications",
  "upload-documents",
  "aadhar-verification",
  "payment",
  "submit",
];

export const useNewReg = (): UseFormReturn => {
  const dispatch = useAppDispatch();

  // Select all state
  const formState = useAppSelector(selectFormState);
  const currentStep = useAppSelector(selectCurrentStep);
  const submitSuccess = useAppSelector(selectSubmitSuccess);
  const personalInfo = useAppSelector(selectPersonalInfo);
  const addresses = useAppSelector(selectAddresses);
  const qualification = useAppSelector(selectQualification);
  const documents = useAppSelector(selectDocuments);
  const aadhaarVerification = useAppSelector(selectAadhaarVerification);
  const payment = useAppSelector(selectPayment);
  const formId = useAppSelector(selectFormId);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const finalConsent = useAppSelector(selectFinalConsent);
  const applicationType = useAppSelector(selectApplicationType);

  // Async actions
  const actions = {
    startForm: useCallback(
      (applicationType: string = "New_Registration") =>
        dispatch(startForm(applicationType)).unwrap(),
      [dispatch],
    ),

    // NEW: Load all existing form data
    loadExistingFormData: useCallback(
      (formId: string) => dispatch(loadExistingFormData(formId)).unwrap(),
      [dispatch],
    ),

    //Selective loading based on nextStep
    loadExistingFormDataSelective: useCallback(
      (formId: string, nextStep: number) =>
        dispatch(loadExistingFormDataSelective({ formId, nextStep })).unwrap(),
      [dispatch],
    ),
    // NEW: Individual fetch actions
    fetchPersonalInfo: useCallback(
      (formId: string) => dispatch(fetchPersonalInfo(formId)).unwrap(),
      [dispatch],
    ),

    fetchAddress: useCallback(
      (formId: string) => dispatch(fetchAddress(formId)).unwrap(),
      [dispatch],
    ),

    fetchQualification: useCallback(
      (formId: string) => dispatch(fetchQualification(formId)).unwrap(),
      [dispatch],
    ),

    fetchDocuments: useCallback(
      (formId: string) => dispatch(fetchDocuments(formId)).unwrap(),
      [dispatch],
    ),

    fetchAadhaar: useCallback(
      (formId: string) => dispatch(fetchAadhaar(formId)).unwrap(),
      [dispatch],
    ),

    fetchPayment: useCallback(
      (formId: string) => dispatch(fetchPayment(formId)).unwrap(),
      [dispatch],
    ),

    submitPersonalInfo: useCallback(
      (data: Parameters<typeof submitPersonalInfo>[0]) =>
        dispatch(submitPersonalInfo(data)).unwrap(),
      [dispatch],
    ),

    submitAddress: useCallback(
      (data: Parameters<typeof submitAddress>[0]) =>
        dispatch(submitAddress(data)).unwrap(),
      [dispatch],
    ),

    submitQualification: useCallback(
      (data: Parameters<typeof submitQualification>[0]) =>
        dispatch(submitQualification(data)).unwrap(),
      [dispatch],
    ),

    submitDocuments: useCallback(
      (data: Parameters<typeof submitDocuments>[0]) =>
        dispatch(submitDocuments(data)).unwrap(),
      [dispatch],
    ),

    submitAadhaar: useCallback(
      (data: Parameters<typeof submitAadhaar>[0]) =>
        dispatch(submitAadhaar(data)).unwrap(),
      [dispatch],
    ),

    createPayment: useCallback(
      (data: Parameters<typeof createPayment>[0]) =>
        dispatch(createPayment(data)).unwrap(),
      [dispatch],
    ),

    submitApplication: useCallback(
      (data: Parameters<typeof submitApplication>[0]) =>
        dispatch(submitApplication(data)).unwrap(),
      [dispatch],
    ),
  };

  // Sync mutations
  const mutations = {
    updatePersonalInfo: useCallback(
      (data: Parameters<typeof updatePersonalInfo>[0]) =>
        dispatch(updatePersonalInfo(data)),
      [dispatch],
    ),

    updatePermanentAddress: useCallback(
      (data: Parameters<typeof updatePermanentAddress>[0]) =>
        dispatch(updatePermanentAddress(data)),
      [dispatch],
    ),

    updateCorrespondenceAddress: useCallback(
      (data: Parameters<typeof updateCorrespondenceAddress>[0]) =>
        dispatch(updateCorrespondenceAddress(data)),
      [dispatch],
    ),

    setSameAddresses: useCallback(
      (isSame: boolean) => dispatch(setSameAddresses(isSame)),
      [dispatch],
    ),

    updateQualification: useCallback(
      (data: Parameters<typeof updateQualification>[0]) =>
        dispatch(updateQualification(data)),
      [dispatch],
    ),

    updateDocument: useCallback(
      (data: Parameters<typeof updateDocument>[0]) =>
        dispatch(updateDocument(data)),
      [dispatch],
    ),

    updateAadhaarVerification: useCallback(
      (data: Parameters<typeof updateAadhaarVerification>[0]) =>
        dispatch(updateAadhaarVerification(data)),
      [dispatch],
    ),

    updatePayment: useCallback(
      (data: Parameters<typeof updatePayment>[0]) =>
        dispatch(updatePayment(data)),
      [dispatch],
    ),

    setStep: useCallback(
      (data: Parameters<typeof setStep>[0]) => dispatch(setStep(data)),
      [dispatch],
    ),

    setFormId: useCallback((id: string) => dispatch(setFormId(id)), [dispatch]),

    setSubmitSuccess: useCallback(
      (success: boolean) => dispatch(setSubmitSuccess(success)),
      [dispatch],
    ),

    setFinalConsent: useCallback(
      (consent: boolean) => dispatch(setFinalConsent(consent)),
      [dispatch],
    ),

    clearError: useCallback(() => dispatch(clearError()), [dispatch]),

    resetForm: useCallback(() => dispatch(resetForm()), [dispatch]),
  };

  // Define utility functions with proper dependencies
  const isStepCompleted = useCallback(
    (stepId: string): boolean => {
      switch (stepId) {
        case "personal-information":
          // CHECK ALL 11 REQUIRED FIELDS FROM data.ts
          return !!(
            personalInfo.firstName &&
            personalInfo.firstName.trim() !== "" &&
            personalInfo.lastName &&
            personalInfo.lastName.trim() !== "" &&
            personalInfo.gender &&
            personalInfo.dob &&
            personalInfo.nationality &&
            personalInfo.maritalStatus &&
            personalInfo.mobileNo &&
            /^\d{10}$/.test(personalInfo.mobileNo) && // Validate 10 digits
            personalInfo.email &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email) && // Validate email format
            personalInfo.motherName &&
            personalInfo.motherName.trim() !== "" &&
            personalInfo.fatherName &&
            personalInfo.fatherName.trim() !== ""
          );

        case "address":
          // Check ALL required permanent address fields
          const permanentAddressValid = !!(
            addresses.permanent.permanentStreet &&
            addresses.permanent.permanentStreet.trim() !== "" &&
            addresses.permanent.permanentArea &&
            addresses.permanent.permanentArea.trim() !== "" &&
            addresses.permanent.permanentCity &&
            addresses.permanent.permanentCity.trim() !== "" &&
            addresses.permanent.permanentDistrict &&
            addresses.permanent.permanentDistrict.trim() !== "" &&
            addresses.permanent.permanentState &&
            addresses.permanent.permanentState.trim() !== "" &&
            addresses.permanent.permanentPincode &&
            /^\d{6}$/.test(addresses.permanent.permanentPincode) // Validate 6 digits
          );

          // If same as permanent, correspondence is automatically valid
          if (addresses.isSameAddress) {
            return permanentAddressValid;
          }

          // Check ALL required correspondence address fields
          const correspondenceAddressValid = !!(
            addresses.correspondence.correStreet &&
            addresses.correspondence.correStreet.trim() !== "" &&
            addresses.correspondence.correArea &&
            addresses.correspondence.correArea.trim() !== "" &&
            addresses.correspondence.correCity &&
            addresses.correspondence.correCity.trim() !== "" &&
            addresses.correspondence.correDistrict &&
            addresses.correspondence.correDistrict.trim() !== "" &&
            addresses.correspondence.correState &&
            addresses.correspondence.correState.trim() !== "" &&
            addresses.correspondence.correPincode &&
            /^\d{6}$/.test(addresses.correspondence.correPincode) // Validate 6 digits
          );

          return permanentAddressValid && correspondenceAddressValid;

        case "qualifications":
          // Check ALL 7 required fields
          return !!(
            qualification.degreeName &&
            qualification.degreeName.trim() !== "" &&
            qualification.collegeName &&
            qualification.collegeName.trim() !== "" &&
            qualification.universityName &&
            qualification.universityName.trim() !== "" &&
            qualification.yearOfAdmission &&
            qualification.yearOfPassing &&
            qualification.rollNo &&
            qualification.rollNo.trim() !== "" &&
            qualification.internship &&
            qualification.internship.trim() !== ""
          );

        case "upload-documents":
          // According to data.ts, documents are NOT required (commented out)
          // But if you want to enforce them, check specific ones
          return !!(
            documents.tenthMarksheet ||
            documents.twelfthMarksheet ||
            documents.photo ||
            documents.signature ||
            documents.idProof
          );

        case "aadhar-verification":
          return !!(
            aadhaarVerification.isVerified &&
            aadhaarVerification.consentCheckbox &&
            aadhaarVerification.aadharNo &&
            /^\d{12}$/.test(aadhaarVerification.aadharNo) // Validate 12 digits
          );

        case "payment":
          return (
            payment.status === "SUCCESSFUL" || payment.status === "INITIATED"
          );

        case "submit":
          return submitSuccess && formState.finalConsent;

        default:
          return false;
      }
    },
    [
      personalInfo,
      addresses,
      qualification,
      documents,
      aadhaarVerification,
      payment,
      submitSuccess,
      formState.finalConsent,
    ],
  );

  const submittedSteps = useAppSelector(selectSubmittedSteps);

  const canNavigateToStep = useCallback(
    (stepId: string): boolean => {
      const stepIndex = STEP_ORDER.indexOf(stepId);
      if (stepIndex === -1) return false;
      if (stepIndex === 0) return true;

      for (let i = 0; i < stepIndex; i++) {
        const prevStepId = STEP_ORDER[i];

        const isStepValid = isStepCompleted(prevStepId);
        // Use .includes() for array instead of .has() for Set
        const isStepSubmitted = submittedSteps.includes(prevStepId);

        console.log(
          `Step ${prevStepId}: valid=${isStepValid}, submitted=${isStepSubmitted}`,
        );

        if (!isStepValid || !isStepSubmitted) {
          return false;
        }
      }
      return true;
    },
    [isStepCompleted, submittedSteps],
  );

  const getCurrentStepNumber = useCallback((): number => {
    const stepConfig = Object.values(STEP_CONFIG).find(
      (config) => config.id === currentStep,
    );
    return stepConfig?.stepNumber || 1;
  }, [currentStep]);

  const getNextStepId = useCallback((): string | null => {
    const currentStepConfig = Object.values(STEP_CONFIG).find(
      (config) => config.id === currentStep,
    );
    return currentStepConfig?.nextStep || null;
  }, [currentStep]);

  const getPreviousStepId = useCallback((): string | null => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === 0) {
      return null;
    }
    return STEP_ORDER[currentIndex - 1];
  }, [currentStep]);

  const validateCurrentStep = useCallback((): boolean => {
    return isStepCompleted(currentStep);
  }, [currentStep, isStepCompleted]);

  const getFormProgress = useCallback((): number => {
    const completedSteps = STEP_ORDER.filter((stepId) =>
      isStepCompleted(stepId),
    ).length;
    return (completedSteps / STEP_ORDER.length) * 100;
  }, [isStepCompleted]);

  const isFormValid = useCallback((): boolean => {
    return STEP_ORDER.every((stepId) => isStepCompleted(stepId));
  }, [isStepCompleted]);

  const navigateToStep = useCallback(
    (stepId: string) => {
      if (canNavigateToStep(stepId)) {
        const stepConfig = Object.values(STEP_CONFIG).find(
          (config) => config.id === stepId,
        );
        if (stepConfig) {
          mutations.setStep({ stepId, stepNumber: stepConfig.stepNumber });
        }
      }
    },
    [mutations.setStep, canNavigateToStep],
  );

  const goToNextStep = useCallback(() => {
    const nextStepId = getNextStepId();
    if (nextStepId && canNavigateToStep(nextStepId)) {
      const stepConfig = STEP_CONFIG[nextStepId as keyof typeof STEP_CONFIG];
      if (stepConfig) {
        mutations.setStep({
          stepId: nextStepId,
          stepNumber: stepConfig.stepNumber,
        });
      }
    }
  }, [mutations.setStep, getNextStepId, canNavigateToStep]);

  const goToPreviousStep = useCallback(() => {
    const previousStepId = getPreviousStepId();
    if (previousStepId) {
      const stepConfig =
        STEP_CONFIG[previousStepId as keyof typeof STEP_CONFIG];
      if (stepConfig) {
        mutations.setStep({
          stepId: previousStepId,
          stepNumber: stepConfig.stepNumber,
        });
      }
    }
  }, [mutations.setStep, getPreviousStepId]);

  // Create utils object after all functions are defined
  const utils = {
    isStepCompleted,
    canNavigateToStep,
    getCurrentStepNumber,
    getNextStepId,
    getPreviousStepId,
    validateCurrentStep,
    getFormProgress,
    isFormValid,
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
  };

  return {
    // State
    formState,
    currentStep,
    submitSuccess,
    personalInfo,
    addresses,
    qualification,
    documents,
    aadhaarVerification,
    payment,
    formId,
    loading,
    error,
    finalConsent,
    applicationType,

    submittedSteps,

    // Actions
    actions,
    mutations,
    utils,
  };
};

export default useNewReg;
