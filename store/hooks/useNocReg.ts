import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../index";
import {
  startNOCForm,
  submitNOCDocuments,
  createNOCPayment,
  submitNOCApplication,
  loadExistingNOCData,
} from "../actions/nocActions";
import {
  updateNOCDocument,
  updateNOCPayment,
  setNOCStep,
  setNOCFormId,
  setNOCSubmitSuccess,
  setNOCFinalConsent,
  clearNOCError,
  resetNOCForm,
  setNewRegistrationFormId,
  selectNOCFormState,
  selectNOCCurrentStep,
  selectNOCSubmitSuccess,
  selectNOCDocuments,
  selectNOCPayment,
  selectNOCFormId,
  selectNOCLoading,
  selectNOCError,
  selectNOCFinalConsent,
  selectNOCSubmittedSteps,
  selectNewRegistrationFormId,
  selectOverviewData,
  NOC_STEP_CONFIG,
  NOCDocuments,
  NOCPayment,
} from "../slices/nocSlice";

export const useNOCForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const formState = useSelector(selectNOCFormState);
  const currentStep = useSelector(selectNOCCurrentStep);
  const submitSuccess = useSelector(selectNOCSubmitSuccess);
  const documents = useSelector(selectNOCDocuments);
  const payment = useSelector(selectNOCPayment);
  const formId = useSelector(selectNOCFormId);
  const loading = useSelector(selectNOCLoading);
  const error = useSelector(selectNOCError);
  const finalConsent = useSelector(selectNOCFinalConsent);
  const submittedSteps = useSelector(selectNOCSubmittedSteps);
  const newRegistrationFormId = useSelector(selectNewRegistrationFormId);
  //  const overviewData = useSelector(selectOverviewData);

  // Actions
  const handleStartForm = useCallback(
    async (nocType: string = "NOC_CERTIFICATE") => {
      try {
        const result = await dispatch(startNOCForm(nocType)).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to start NOC form:", error);
        throw error;
      }
    },
    [dispatch],
  );

  const handleUpdateDocument = useCallback(
    (docType: keyof NOCDocuments, file: File | null) => {
      dispatch(updateNOCDocument({ docType, file }));
    },
    [dispatch],
  );

  const handleSubmitDocuments = useCallback(
    async (docs: Record<string, File>) => {
      try {
        const result = await dispatch(
          submitNOCDocuments({
            formId,
            documents: docs,
          }),
        ).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to submit documents:", error);
        throw error;
      }
    },
    [dispatch, formId],
  );

  const handleUpdatePayment = useCallback(
    (data: Partial<NOCPayment>) => {
      dispatch(updateNOCPayment(data));
    },
    [dispatch],
  );

  const handleCreatePayment = useCallback(
    async (nocType: string) => {
      try {
        const result = await dispatch(
          createNOCPayment({
            nocFormId: formId,
            nocType,
          }),
        ).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to create payment:", error);
        throw error;
      }
    },
    [dispatch, formId],
  );

  const handleSubmitApplication = useCallback(
    async (data: { nocType: string; title: string; reason: string }) => {
      try {
        const result = await dispatch(
          submitNOCApplication({
            nocType: data.nocType,
            nocFormId: formId,
            title: data.title,
            reason: data.reason,
          }),
        ).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to submit application:", error);
        throw error;
      }
    },
    [dispatch, formId],
  );

  const handleLoadExistingData = useCallback(
    async (existingFormId: string) => {
      try {
        const result = await dispatch(
          loadExistingNOCData(existingFormId),
        ).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to load existing data:", error);
        throw error;
      }
    },
    [dispatch],
  );

  const handleSetStep = useCallback(
    (stepId: string, stepNumber?: number) => {
      dispatch(setNOCStep({ stepId, stepNumber }));
    },
    [dispatch],
  );

  const handleNextStep = useCallback(() => {
    const currentConfig =
      NOC_STEP_CONFIG[currentStep as keyof typeof NOC_STEP_CONFIG];
    if (currentConfig && currentConfig.nextStep) {
      const nextConfig =
        NOC_STEP_CONFIG[currentConfig.nextStep as keyof typeof NOC_STEP_CONFIG];
      dispatch(
        setNOCStep({
          stepId: currentConfig.nextStep,
          stepNumber: nextConfig.stepNumber,
        }),
      );
    }
  }, [dispatch, currentStep]);

  const handlePreviousStep = useCallback(() => {
    const steps = Object.values(NOC_STEP_CONFIG);
    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentStepIndex > 0) {
      const previousStep = steps[currentStepIndex - 1];
      dispatch(
        setNOCStep({
          stepId: previousStep.id,
          stepNumber: previousStep.stepNumber,
        }),
      );
    }
  }, [dispatch, currentStep]);

  const handleSetFormId = useCallback(
    (id: string) => {
      dispatch(setNOCFormId(id));
    },
    [dispatch],
  );

  const handleSetNewRegistrationFormId = useCallback(
    (id: string) => {
      dispatch(setNewRegistrationFormId(id));
    },
    [dispatch],
  );

  const handleSetSubmitSuccess = useCallback(
    (success: boolean) => {
      dispatch(setNOCSubmitSuccess(success));
    },
    [dispatch],
  );

  const handleSetFinalConsent = useCallback(
    (consent: boolean) => {
      dispatch(setNOCFinalConsent(consent));
    },
    [dispatch],
  );

  const handleClearError = useCallback(() => {
    dispatch(clearNOCError());
  }, [dispatch]);

  const handleResetForm = useCallback(() => {
    dispatch(resetNOCForm());
  }, [dispatch]);

  // Helper: Check if step is completed
  const isStepCompleted = useCallback(
    (stepId: string) => {
      return submittedSteps.includes(stepId);
    },
    [submittedSteps],
  );

  // Helper: Check if can proceed to next step
  const canProceedToNextStep = useCallback(() => {
    return isStepCompleted(currentStep);
  }, [currentStep, isStepCompleted]);

  return {
    // State
    formState,
    currentStep,
    submitSuccess,
    documents,
    payment,
    formId,
    loading,
    error,
    finalConsent,
    submittedSteps,
    newRegistrationFormId,
    // overviewData,

    // Actions
    startForm: handleStartForm,
    updateDocument: handleUpdateDocument,
    submitDocuments: handleSubmitDocuments,
    updatePayment: handleUpdatePayment,
    createPayment: handleCreatePayment,
    submitApplication: handleSubmitApplication,
    loadExistingData: handleLoadExistingData,
    setStep: handleSetStep,
    nextStep: handleNextStep,
    previousStep: handlePreviousStep,
    setFormId: handleSetFormId,
    setNewRegistrationFormId: handleSetNewRegistrationFormId,
    setSubmitSuccess: handleSetSubmitSuccess,
    setFinalConsent: handleSetFinalConsent,
    clearError: handleClearError,
    resetForm: handleResetForm,

    // Helpers
    isStepCompleted,
    canProceedToNextStep,
    NOC_STEP_CONFIG,
  };
};
