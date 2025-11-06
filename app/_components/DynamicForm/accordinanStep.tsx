/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import { AccordionStep as AccordionStepType } from "../data";
import FieldRenderer from "./FieldRenderer";
import AddressSection from "../SpecialSections/AddressSection";
import AadharFlow from "../SpecialSections/AadharFlow";
import ApplicationSummarySection from "../SpecialSections/ApplicationSummarySection";
import PaymentSection from "../SpecialSections/PaymentSection";
import SubmitSection from "../SpecialSections/SubmitSection";
import NavigationButtons from "../../_components/navigationButtons";

interface AccordionStepProps {
  step: AccordionStepType;
  formData: { [key: string]: any };
  onChange: (fieldName: string, value: any) => void;
  // onStepComplete: (stepId: string, isComplete: boolean) => void;
  isCompleted: boolean;
  isAccessible: boolean;
  isExpanded: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onSubmit?: () => void;
  onAccordionToggle: (stepId: string) => void;
  isSubmitting?: boolean;
}

const AccordionStep: React.FC<AccordionStepProps> = ({
  step,
  formData,
  onChange,
  // onStepComplete,
  isCompleted,
  isAccessible,
  isExpanded,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  onSubmit,
  onAccordionToggle,
  isSubmitting = false,
}) => {
  const handleAccordionChange = (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    if (isAccessible) {
      onAccordionToggle(step.id);
    }
  };

  // const validateStep = (): boolean => {
  //   const requiredFields = step.fields.filter((field) => field.required);
  //   return requiredFields.every((field) => {
  //     const value = formData[field.name];
  //     if (field.type === "checkbox") {
  //       return value === true;
  //     }
  //     return value !== undefined && value !== null && value !== "";
  //   });
  // };

  // useEffect(() => {
  //   const isValid = validateStep();
  //   // onStepComplete(step.id, isValid);
  // }, [formData, step.fields, step.id, onStepComplete]);

  const renderSpecialSection = () => {
    switch (step.id) {
      case "address":
        return (
          <AddressSection
            formData={formData}
            onChange={onChange}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
          />
        );

      case "aadhar-verification":
        return (
          <AadharFlow
            formData={formData}
            onChange={onChange}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
          />
        );

      case "application-summary":
        return (
          <ApplicationSummarySection
            formData={formData}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
          />
        );

      case "payment":
        return (
          <PaymentSection
            formData={formData}
            onChange={onChange}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
          />
        );

      case "submit":
        return (
          <SubmitSection
            formData={formData}
            onChange={onChange}
            onSubmit={onSubmit}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
          />
        );

      default:
        return null;
    }
  };

  const renderStandardFields = () => {
    // Special sections handle their own fields and navigation
    if (
      step.id === "address" ||
      step.id === "aadhar-verification" ||
      step.id === "application-summary" ||
      step.id === "payment" ||
      step.id === "submit"
    ) {
      return null;
    }

    // Standard fields with navigation
    return (
      <Box sx={{ mb: 3 }}>
        {/* Two-column grid layout for form fields */}
        <Grid container spacing={3}>
          {step.fields.map((field, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={field.name}>
              <FieldRenderer
                field={field}
                value={formData[field.name]}
                onChange={onChange}
              />
            </Grid>
          ))}
        </Grid>

        {/* Navigation Buttons - ONLY FOR STANDARD FIELDS */}
        <NavigationButtons
          onNext={onNext}
          onPrevious={onPrevious}
          showPrevious={!isFirstStep}
          showNext={true}
          canProceed={isCompleted}
          nextDisabled={!isCompleted || isSubmitting}
          isLastStep={isLastStep}
          onSubmit={onSubmit}
        />
      </Box>
    );
  };

  const getBackgroundColor = () => {
    if (!isAccessible) return "grey.100";
    if (isExpanded) return "primary.50";
    return "grey.50";
  };

  const isDisabled = !isAccessible;

  return (
    <Accordion
      expanded={isExpanded}
      onChange={handleAccordionChange}
      disabled={isDisabled}
      sx={{ mb: 2, border: '1px solid', borderColor: 'grey.300' }}
      elevation={0}
    >
      <AccordionSummary
        expandIcon={isAccessible ? <ExpandMoreIcon /> : <LockIcon />}
        sx={{
          backgroundColor: getBackgroundColor(),
          "&:hover": {
            backgroundColor: isAccessible ? "primary.100" : "grey.100",
          },
          cursor: isAccessible ? "pointer" : "not-allowed",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            mr: 2,
          }}
        >
          <Typography variant="h6">{step.title}</Typography>
          {isCompleted && <CheckCircleIcon color="success" />}
        </Box>
      </AccordionSummary>

      {isAccessible && (
        <AccordionDetails>
          {renderStandardFields()}
          {renderSpecialSection()}
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default AccordionStep;