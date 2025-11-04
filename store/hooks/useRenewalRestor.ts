import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../index";
import {
  startRenewalForm,
  submitRenewalDocuments,
  createRenewalPayment,
  submitRenewalApplication,
} from "../actions/renewalRestorActions";
import { loadExistingFormDataSelective } from "../actions/newRegAction";
import {
  setNewRegistrationFormId,
  updateDocuments,
  updatePayment,
  setStep,
  setFormId,
  setSubmitSuccess,
  setFinalConsent,
  clearError,
  resetForm,
  selectRenewalFormState,
  selectRenewalCurrentStep,
  selectRenewalSubmitSuccess,
  selectRenewalDocuments,
  selectRenewalPayment,
  selectRenewalFormId,
  selectRenewalLoading,
  selectRenewalError,
  selectRenewalFinalConsent,
  selectRenewalSubmittedSteps,
  selectRenewalNewRegistrationFormId,
  selectRenewalOverviewData,
  RENEWAL_STEP_CONFIG,
  RRDocuments,
  RRPayment,
} from "../slices/renewalRestorSlice";

export const useRenewalRestor = () => {
  const dispatch = useDispatch<AppDispatch>();

  // State selectors
  const formState = useSelector(selectRenewalFormState);
  const currentStep = useSelector(selectRenewalCurrentStep);
  const submitSuccess = useSelector(selectRenewalSubmitSuccess);
  const documents = useSelector(selectRenewalDocuments);
  const payment = useSelector(selectRenewalPayment);
  const formId = useSelector(selectRenewalFormId);
  const loading = useSelector(selectRenewalLoading);
  const error = useSelector(selectRenewalError);
  const finalConsent = useSelector(selectRenewalFinalConsent);
  const submittedSteps = useSelector(selectRenewalSubmittedSteps);
  const newRegistrationFormId = useSelector(selectRenewalNewRegistrationFormId);
  const overviewData = useSelector(selectRenewalOverviewData);

  // Actions / thunks
  const startForm = useCallback(async () => {
    try {
      const result = await dispatch(startRenewalForm()).unwrap();
      console.log("Started renewal/restoration form:", result);

      // If the backend indicates there's an existing linked registration,
      // load selective data (personalInfo/addresses/qualification) into
      // the shared `applicationForm` slice so overview selectors return data.
      if (result?.isExisting) {
        const targetFormId = result.newRegistrationFormId || result.formId;
        const nextStepNum =
          typeof result.nextStep === "number" ? result.nextStep : 1;
        try {
          await dispatch(
            loadExistingFormDataSelective({
              formId: targetFormId,
              nextStep: nextStepNum,
            }),
          ).unwrap();
        } catch (loadErr) {
          // non-fatal; log for debugging
          console.error("loadExistingFormDataSelective failed:", loadErr);
        }
      }

      return result;
    } catch (err) {
      console.error("Failed to start renewal/restoration form:", err);
      throw err;
    }
  }, [dispatch]);

  const updateDocument = useCallback(
    (docType: keyof RRDocuments, file: File | null) => {
      dispatch(updateDocuments({ docType, file }));
    },
    [dispatch],
  );

  const submitDocuments = useCallback(
    async (docs: Record<string, File>) => {
      try {
        const result = await dispatch(
          submitRenewalDocuments({ formId, documents: docs }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to submit renewal documents:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  const updatePay = useCallback(
    (data: Partial<RRPayment>) => {
      dispatch(updatePayment(data));
    },
    [dispatch],
  );

  const createPayment = useCallback(
    async (type: string) => {
      try {
        const result = await dispatch(
          createRenewalPayment({ practionearFormId: formId, type }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to create renewal payment:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  const submitApplication = useCallback(
    async (data: { type: string; title: string; reason: string }) => {
      try {
        const result = await dispatch(
          // type: string; formId: string; reason: string
          submitRenewalApplication({
            type: data.type,
            formId,
            reason: data.reason,
          }),
        ).unwrap();
        return result;
      } catch (err) {
        console.error("Failed to submit renewal application:", err);
        throw err;
      }
    },
    [dispatch, formId],
  );

  // Step navigation
  const setRenewalStep = useCallback(
    (stepId: string, stepNumber?: number) =>
      dispatch(setStep({ stepId, stepNumber })),
    [dispatch],
  );

  const nextStep = useCallback(() => {
    const currentConfig =
      RENEWAL_STEP_CONFIG[currentStep as keyof typeof RENEWAL_STEP_CONFIG];
    if (currentConfig && currentConfig.nextStep) {
      const nextConfig =
        RENEWAL_STEP_CONFIG[
          currentConfig.nextStep as keyof typeof RENEWAL_STEP_CONFIG
        ];
      if (nextConfig)
        dispatch(
          setStep({
            stepId: currentConfig.nextStep,
            stepNumber: nextConfig.stepNumber,
          }),
        );
    }
  }, [dispatch, currentStep]);

  const previousStep = useCallback(() => {
    const steps = Object.values(RENEWAL_STEP_CONFIG);
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      const prev = steps[idx - 1];
      dispatch(setStep({ stepId: prev.id, stepNumber: prev.stepNumber }));
    }
  }, [dispatch, currentStep]);

  const setFormIdAction = useCallback(
    (id: string) => dispatch(setFormId(id)),
    [dispatch],
  );
  const setNewRegistration = useCallback(
    (id: string) => dispatch(setNewRegistrationFormId(id)),
    [dispatch],
  );
  const setSubmit = useCallback(
    (s: boolean) => dispatch(setSubmitSuccess(s)),
    [dispatch],
  );
  const setFinal = useCallback(
    (c: boolean) => dispatch(setFinalConsent(c)),
    [dispatch],
  );
  const clearErr = useCallback(() => dispatch(clearError()), [dispatch]);
  const reset = useCallback(() => dispatch(resetForm()), [dispatch]);

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
    updatePay,
    createPayment,
    submitApplication,
    setRenewalStep,
    nextStep,
    previousStep,
    setFormId: setFormIdAction,
    setNewRegistrationFormId: setNewRegistration,
    setSubmitSuccess: setSubmit,
    setFinalConsent: setFinal,
    clearError: clearErr,
    resetForm: reset,

    // Helpers
    isStepCompleted,
    canProceedToNextStep,
    RENEWAL_STEP_CONFIG,
  };
};

export default useRenewalRestor;
