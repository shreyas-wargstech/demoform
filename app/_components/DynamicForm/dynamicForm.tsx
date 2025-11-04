/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { formStepsData } from "../data";
import AccordionStep from "./accordinanStep";
import StepProgressBar from "../progressBar";
import ApplicationSuccessScreen from "./success";
import useNewReg from "@/store/hooks/useNewReg";
import { Documents } from "@/store/slices/formSlice";

interface FormData {
  [key: string]: any;
}

interface StepErrors {
  [stepId: string]: string | null;
}

const DynamicForm: React.FC = () => {
  const {
    formState,
    currentStep,
    submitSuccess,
    personalInfo,
    addresses,
    qualification,
    documents,
    aadhaarVerification,
    payment,
    loading,
    error,
    actions,
    mutations,
    utils,
  } = useNewReg();

  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Initialize form
  useEffect(() => {
    const initializeForm = async () => {
      if (hasInitialized.current || formState.formId) {
        return;
      }

      hasInitialized.current = true;

      try {
        console.log("Initializing form...");
        const response = await actions.startForm();

        if (response?.isExisting && response?.formId) {
          const nextStepNum =
            typeof response.nextStep === "number"
              ? response.nextStep
              : parseInt(response.nextStep || "1");

          console.log(`Loading existing form. NextStep: ${nextStepNum}`);
          await actions.loadExistingFormDataSelective(
            response.formId,
            nextStepNum,
          );
        }
      } catch (error) {
        console.error("Failed to initialize form:", error);
        hasInitialized.current = false;
      }
    };

    initializeForm();
  }, []);

  const handleFormDataChange = useCallback(
    (fieldName: string, value: any) => {
      if (error) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: null }));
        mutations.clearError();
      }

      if (fieldName in personalInfo) {
        mutations.updatePersonalInfo({ [fieldName]: value });
      } else if (fieldName.startsWith("permanent")) {
        mutations.updatePermanentAddress({ [fieldName]: value });
      } else if (fieldName.startsWith("corre")) {
        mutations.updateCorrespondenceAddress({ [fieldName]: value });
      } else if (fieldName === "isSameAddress") {
        mutations.setSameAddresses(value);
      } else if (fieldName in qualification) {
        mutations.updateQualification({ [fieldName]: value });
      } else if (fieldName in aadhaarVerification) {
        mutations.updateAadhaarVerification({ [fieldName]: value });
      } else if (fieldName in payment) {
        mutations.updatePayment({ [fieldName]: value });
      } else if (fieldName in documents) {
        mutations.updateDocument({
          docType: fieldName as keyof Documents,
          file: value,
        });
      } else if (fieldName === "finalConsent") {
        mutations.setFinalConsent(value);
      }
    },
    [
      personalInfo,
      qualification,
      aadhaarVerification,
      payment,
      documents,
      currentStep,
      error,
      mutations,
    ],
  );

  const handleStepComplete = useCallback(
    (stepId: string, isComplete: boolean) => {
      // Handled by isStepCompleted in useNewReg
    },
    [],
  );

  const handleNext = useCallback(
    async (currentStepId: string) => {
      if (submittingStep) return;

      // VALIDATE FIRST
      if (!utils.isStepCompleted(currentStepId)) {
        setStepErrors((prev) => ({
          ...prev,
          [currentStepId]:
            "Please fill all required fields correctly before proceeding",
        }));
        return;
      }

      setSubmittingStep(currentStepId);
      setStepErrors((prev) => ({ ...prev, [currentStepId]: null }));
      mutations.clearError();

      try {
        console.log(`Submitting step: ${currentStepId}`);

        switch (currentStepId) {
          case "personal-information":
            await actions.submitPersonalInfo({
              formId: formState.formId,
              ...personalInfo,
            });
            break;

          case "address":
            await actions.submitAddress({
              formId: formState.formId,
              ...addresses.permanent,
              ...addresses.correspondence,
            });
            break;

          case "qualifications":
            await actions.submitQualification({
              formId: formState.formId,
              ...qualification,
            });
            break;

          case "upload-documents":
            await actions.submitDocuments({
              formId: formState.formId,
              documents,
            });
            break;

          case "aadhar-verification":
            await actions.submitAadhaar({
              formId: formState.formId,
              aadharNo: aadhaarVerification.aadharNo,
              validAadhar: aadhaarVerification.validAadhar,
            });
            break;

          case "payment":
            await actions.createPayment({
              formId: formState.formId,
              applicationType: formState.applicationType,
              payment_name: "Medical License Application Fee",
            });
            break;

          default:
            break;
        }

        // SUCCESS: API call succeeded - step navigation is handled by Redux
        console.log(
          `Step ${currentStepId} submitted successfully - moving to next step`,
        );
        utils.goToNextStep();
      } catch (error: any) {
        // FAILURE: API call failed - prevent navigation
        console.error("Error submitting step:", error);

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to submit step. Please check all fields and try again.";

        setStepErrors((prev) => ({ ...prev, [currentStepId]: errorMessage }));

        // Do NOT call goToNextStep on error
      } finally {
        setSubmittingStep(null);
      }
    },
    [
      actions,
      formState,
      personalInfo,
      addresses,
      qualification,
      documents,
      aadhaarVerification,
      utils,
      mutations,
      submittingStep,
    ],
  );

  const handlePrevious = useCallback(() => {
    utils.goToPreviousStep();
  }, [utils]);

  const handleAccordionToggle = useCallback(
    (stepId: string) => {
      utils.navigateToStep(stepId);
    },
    [utils],
  );

  const handleFormSubmit = useCallback(async () => {
    if (submittingStep) return;

    try {
      setSubmittingStep("submit");
      setStepErrors((prev) => ({ ...prev, ["submit"]: null }));
      mutations.clearError();

      await actions.submitApplication({
        formId: formState.formId,
        applicationType: formState.applicationType,
        additionalInfo: {},
      });

      alert("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit application";
      setStepErrors((prev) => ({ ...prev, ["submit"]: errorMessage }));
    } finally {
      setSubmittingStep(null);
    }
  }, [actions, formState, mutations, submittingStep]);

  const handleBackToHome = useCallback(() => {
    setStepErrors({});
    mutations.resetForm();
    hasInitialized.current = false;
  }, [mutations]);

  const isStepAccessible = useCallback(
    (stepIndex: number): boolean => {
      const stepId = formStepsData[stepIndex]?.id;
      return stepId ? utils.canNavigateToStep(stepId) : false;
    },
    [utils],
  );

  if (loading && !formState.formId) {
    return (
      <Container>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading form...</Typography>
        </Box>
      </Container>
    );
  }

  if (submitSuccess) {
    return <ApplicationSuccessScreen onBackToHome={handleBackToHome} />;
  }

  const formData: FormData = {
    ...personalInfo,
    ...addresses.permanent,
    ...addresses.correspondence,
    isSameAddress: addresses.isSameAddress,
    ...qualification,
    ...documents,
    ...aadhaarVerification,
    ...payment,
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 4, mb: 4, p: 4 }}>
        {formStepsData && formStepsData.length > 0 && (
          <StepProgressBar
            steps={formStepsData.map((step) => ({
              id: step.id,
              title: step.title,
              stepNumber: step.stepNumber,
            }))}
            completedSteps={
              new Set(
                formStepsData
                  .filter((step) => utils.isStepCompleted(step.id))
                  .map((step) => step.id),
              )
            }
            currentStep={currentStep}
          />
        )}

        {formStepsData?.map((step, index) => (
          <Box key={step.id}>
            <AccordionStep
              step={step}
              formData={formData}
              onChange={handleFormDataChange}
              onStepComplete={handleStepComplete}
              isCompleted={utils.isStepCompleted(step.id)}
              isAccessible={isStepAccessible(index)}
              isExpanded={formState.stepId === step.id}
              onNext={() => handleNext(step.id)}
              onPrevious={handlePrevious}
              isFirstStep={index === 0}
              isLastStep={index === formStepsData.length - 1}
              onSubmit={step.id === "submit" ? handleFormSubmit : undefined}
              onAccordionToggle={handleAccordionToggle}
              isSubmitting={submittingStep === step.id}
            />

            {stepErrors[step.id] && (
              <Alert
                severity="error"
                sx={{ mt: 1, mb: 2 }}
                onClose={() =>
                  setStepErrors((prev) => ({ ...prev, [step.id]: null }))
                }
              >
                {stepErrors[step.id]}
              </Alert>
            )}
          </Box>
        )) || <Typography color="error">No form steps available</Typography>}
      </Paper>
    </Container>
  );
};

export default DynamicForm;
