"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  isLastStep?: boolean;
  onSubmit?: () => void;
  canProceed?: boolean; // ADD THIS LINE
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
  nextDisabled = false,
  previousDisabled = false,
  nextLabel = "Next",
  previousLabel = "Previous",
  isLastStep = false,
  onSubmit,
  canProceed = true, // ADD THIS LINE WITH DEFAULT
}) => {
  const handleNext = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
      }}
    >
      {showPrevious ? (
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onPrevious}
          disabled={previousDisabled}
          sx={{ minWidth: 120 }}
        >
          {previousLabel}
        </Button>
      ) : (
        <Box sx={{ minWidth: 120 }} />
      )}

      {showNext && (
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={nextDisabled || !canProceed} // This line should be correct
          sx={{ minWidth: 120 }}
        >
          {isLastStep ? "Submit" : nextLabel}
        </Button>
      )}
    </Box>
  );
};

export default NavigationButtons;
