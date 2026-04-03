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
import ApplicationSuccessScreen, { ApplicationData } from "./success";
import useNewReg from "@/store/hooks/useNewReg";
import { Documents, setSubmitSuccess, setSubmittedSteps, STEP_CONFIG } from "@/store/slices/formSlice";
import { toast } from "sonner";

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
    aadharVerification,
    payment,
    loading,
    error,
    actions,
    mutations,
    utils,
    submittedSteps,
    submittedAt,
    applicationType,
    status,
  } = useNewReg();

  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const applicationData : ApplicationData = {
    submissionDate: submittedAt,
      // : new Date().toLocaleDateString('en-GB', { 
      //     day: '2-digit', 
      //     month: 'short', 
      //     year: 'numeric' 
      //   }),
    applicationType: applicationType,
    referenceNumber: formState.existingApplicationId || `MCH-REF_${Date.now()}`,
    status: status === 'PENDING' ? "Pending" : (status === 'APPROVED' ? "Approved" : "Rejected"),
  };

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
        console.log("nextStep during initialization", response);


        if (response?.isExisting && response?.formId) {
          const nextStepNum =
            typeof response.nextStep === 'number' ? response.nextStep : (response.nextStep === "ready_to_submit" ? 8 : parseInt(response.nextStep));

          console.log(`Loading existing form. NextStep: ${nextStepNum}`);
          await actions.loadExistingFormDataSelective(
            response.formId,
            nextStepNum,
          );
        }
        toast.success("Form initialized successfully");
      } catch (error: any) {

        if (error.error === "You already have a New_Registration application that has been submitted") {
          setSubmittedSteps(["personal-information", "address", "qualifications", "upload-documents", "aadhar-verification", "application-summary", "payment", "submit"]);
          mutations.setSubmitSuccess(true);
          toast.warning(error.error);
          console.log("You already have a New_Registration application that has been submitted", "submitSuccess", submitSuccess);
        } else {
          console.error("Failed to initialize form:", error);
          toast.error("Failed to initialize form");
        }
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
      } else if (fieldName in aadharVerification) {
        mutations.updateAadharVerification({ [fieldName]: value });
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
      aadharVerification,
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
        const errorMsg = "Please fill all required fields correctly before proceeding";
        setStepErrors((prev) => ({
          ...prev,
          [currentStepId]: errorMsg,
        }));
        toast.error(errorMsg + currentStepId);
        return;
      }

      setSubmittingStep(currentStepId);
      setStepErrors((prev) => ({ ...prev, [currentStepId]: null }));
      mutations.clearError();

      try {

        switch (currentStepId) {
          case "personal-information":
            await actions.submitPersonalInfo({
              formId: formState.formId,
              ...personalInfo,
            });
            toast.success("Personal information saved successfully");
            break;

          case "address":
            await actions.submitAddress({
              formId: formState.formId,
              ...addresses.permanent,
              ...addresses.correspondence,
            });
            toast.success("Address information saved successfully");
            break;

          case "qualifications":
            await actions.submitQualification({
              formId: formState.formId,
              ...qualification,
            });
            toast.success("Qualification information saved successfully");
            break;

          case "upload-documents":
            await actions.submitDocuments({
              formId: formState.formId,
              documents,
            });
            toast.success("Documents uploaded successfully");
            break;

          case "aadhar-verification":
            if (!submittedSteps.includes("aadhar-verification")) {
              mutations.setSubmittedSteps([...submittedSteps, "aadhar-verification"]);
            }
            toast.success("Aadhar verified successfully");
            break;

          case "application-summary":
            if (!submittedSteps.includes("application-summary")) {
              mutations.setSubmittedSteps([...submittedSteps, "application-summary"]);
            }
            toast.success("Application reviewed successfully");
            break;

          default:
            break;
        }

        // SUCCESS: API call succeeded - step navigation is handled by Redux
        // console.log(
        //   `Step ${currentStepId} submitted successfully - moving to next step`,
        // );
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const nextStepId = utils.getNextStepId();
        console.log(`nextStepId: ${nextStepId}`);
        if (nextStepId) {
          const stepConfig = STEP_CONFIG[nextStepId as keyof typeof STEP_CONFIG];
          if (stepConfig) {
            mutations.setStep({
              stepId: nextStepId,
              stepNumber: stepConfig.stepNumber,
            });
          }
        }
      } catch (error: any) {
        // FAILURE: API call failed - prevent navigation
        console.error("Error submitting step:", error);

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to submit step. Please check all fields and try again.";

        setStepErrors((prev) => ({ ...prev, [currentStepId]: errorMessage }));
        toast.error(errorMessage);

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
      aadharVerification,
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

    if (!formState.finalConsent) {
      toast.error("Please provide your consent to submit the application");
      return;
    }

    try {
      setSubmittingStep("submit");
      setStepErrors((prev) => ({ ...prev, ["submit"]: null }));
      mutations.clearError();

      await actions.submitApplication({
        formId: formState.formId,
        applicationType: formState.applicationType,
        additionalInfo: {},
      });

      toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit application";
      setStepErrors((prev) => ({ ...prev, ["submit"]: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setSubmittingStep(null);
    }
  }, [actions, formState, mutations, submittingStep]);

  const handleBackToHome = useCallback(() => {
    setStepErrors({});
    mutations.resetForm();
    hasInitialized.current = false;
    toast.success("Form reset successfully");
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
    return <ApplicationSuccessScreen
      applicationData={applicationData}
      onBackToHome={handleBackToHome}
    />;
  }

  const formData: FormData = {
    ...personalInfo,
    ...addresses.permanent,
    ...addresses.correspondence,
    isSameAddress: addresses.isSameAddress,
    ...qualification,
    ...documents,
    ...aadharVerification,
    ...payment,
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ mt: 4, mb: 4, p: 4, border: '1px solid', borderColor: 'grey.300' }}>
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
              // onStepComplete={handleStepComplete}
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