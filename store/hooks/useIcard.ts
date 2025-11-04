import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../index";
import {
  startICARDForm,
  submitICARDDocuments,
  createICARDPayment,
  submitICARDApplication,
  loadExistingICARDData,
} from "../actions/icardActions";
import {
  setNewRegistrationFormId,
  updateNOCDocument,
  updateNOCPayment,
  setNOCStep,
  setNOCFormId,
  setNOCSubmitSuccess,
  setNOCFinalConsent,
  clearNOCError,
  resetNOCForm,
  selectICARDFormState,
  selectICARDCurrentStep,
  selectICARDSubmitSuccess,
  selectICARDDocuments,
  selectICARDPayment,
  selectICARDFormId,
  selectICARDLoading,
  selectICARDError,
  selectICARDFinalConsent,
  selectICARDSubmittedSteps,
  selectICARDNewRegistrationFormId,
  selectOverviewData,
  NOC_STEP_CONFIG,
  NOCDocuments,
  NOCPayment,
} from "../slices/icardSlice";

export const useICard = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const formState = useSelector(selectICARDFormState);
  const currentStep = useSelector(selectICARDCurrentStep);
  const submitSuccess = useSelector(selectICARDSubmitSuccess);
  const documents = useSelector(selectICARDDocuments);
  const payment = useSelector(selectICARDPayment);
  const formId = useSelector(selectICARDFormId);
  const loading = useSelector(selectICARDLoading);
  const error = useSelector(selectICARDError);
  const finalConsent = useSelector(selectICARDFinalConsent);
  const submittedSteps = useSelector(selectICARDSubmittedSteps);
  const newRegistrationFormId = useSelector(selectICARDNewRegistrationFormId);
  const overviewData = useSelector(selectOverviewData);

  // Actions
  const startForm = useCallback(
    async (type: string = "ICARD") => {
      try {
        const result = await dispatch(startICARDForm(type)).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to start iCard form:", err);
        throw err;
      }
    },
    [dispatch],
  );

  const updateDocument = useCallback(
    (docType: keyof NOCDocuments, file: File | null) => {
      dispatch(updateNOCDocument({ docType, file }));
    },
    [dispatch],
  );

  const submitDocuments = useCallback(
    async (docs: Record<string, File>) => {
      try {
        const result = await dispatch(
          submitICARDDocuments({ formId, documents: docs }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to submit documents:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  const updatePayment = useCallback(
    (data: Partial<NOCPayment>) => {
      dispatch(updateNOCPayment(data));
    },
    [dispatch],
  );

  const createPayment = useCallback(
    async (type: string) => {
      try {
        const result = await dispatch(
          createICARDPayment({ icardFormId: formId, type }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to create payment:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  const submitApplication = useCallback(
    async (data: { type: string; title: string; reason: string }) => {
      try {
        const result = await dispatch(
          submitICARDApplication({
            type: data.type,
            icardFormId: formId,
            title: data.title,
            reason: data.reason,
          }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to submit application:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  const loadExistingData = useCallback(
    async (existingFormId: string) => {
      try {
        const result = await dispatch(
          loadExistingICARDData(existingFormId),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to load existing data:", err);
        throw err;
      }
    },
    [dispatch],
  );

  const setStep = useCallback(
    (stepId: string, stepNumber?: number) => {
      dispatch(setNOCStep({ stepId, stepNumber }));
    },
    [dispatch],
  );

  const nextStep = useCallback(() => {
    const currentConfig =
      NOC_STEP_CONFIG[currentStep as keyof typeof NOC_STEP_CONFIG];
    if (currentConfig && currentConfig.nextStep) {
      const nextConfig =
        NOC_STEP_CONFIG[currentConfig.nextStep as keyof typeof NOC_STEP_CONFIG];
      if (nextConfig) {
        dispatch(
          setNOCStep({
            stepId: currentConfig.nextStep,
            stepNumber: nextConfig.stepNumber,
          }),
        );
      }
    }
  }, [dispatch, currentStep]);

  const previousStep = useCallback(() => {
    const steps = Object.values(NOC_STEP_CONFIG);
    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentStepIndex > 0) {
      const previous = steps[currentStepIndex - 1];
      dispatch(
        setNOCStep({ stepId: previous.id, stepNumber: previous.stepNumber }),
      );
    }
  }, [dispatch, currentStep]);

  const setFormId = useCallback(
    (id: string) => dispatch(setNOCFormId(id)),
    [dispatch],
  );
  const setNewRegistrationForm = useCallback(
    (id: string) => dispatch(setNewRegistrationFormId(id)),
    [dispatch],
  );
  const setSubmitSuccess = useCallback(
    (s: boolean) => dispatch(setNOCSubmitSuccess(s)),
    [dispatch],
  );
  const setFinalConsent = useCallback(
    (c: boolean) => dispatch(setNOCFinalConsent(c)),
    [dispatch],
  );
  const clearError = useCallback(() => dispatch(clearNOCError()), [dispatch]);
  const resetForm = useCallback(() => dispatch(resetNOCForm()), [dispatch]);

  const isStepCompleted = useCallback(
    (stepId: string) => submittedSteps.includes(stepId),
    [submittedSteps],
  );
  const canProceedToNextStep = useCallback(
    () => isStepCompleted(currentStep),
    [currentStep, isStepCompleted],
  );

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
    overviewData,

    // Actions
    startForm,
    updateDocument,
    submitDocuments,
    updatePayment,
    createPayment,
    submitApplication,
    loadExistingData: loadExistingData,
    setStep,
    nextStep,
    previousStep,
    setFormId,
    setNewRegistrationFormId: setNewRegistrationForm,
    setSubmitSuccess,
    setFinalConsent,
    clearError,
    resetForm,

    // Helpers
    isStepCompleted,
    canProceedToNextStep,
    NOC_STEP_CONFIG,
  };
};

export default useICard;
