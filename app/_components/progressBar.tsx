import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface Step {
  id: string;
  title: string;
  stepNumber: number;
}

interface StepProgressBarProps {
  steps?: Step[];
  completedSteps?: Set<string>;
  currentStep?: string;
  className?: string;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps = [],
  completedSteps = new Set<string>(),
  currentStep = "",
  className,
}) => {
  const theme = useTheme();

  // Early return if no steps are provided
  if (!steps || steps.length === 0) {
    return null;
  }

  const getStepStatus = (stepId: string, index: number) => {
    if (completedSteps.has(stepId)) {
      return "completed";
    } else if (stepId === currentStep) {
      return "active";
    } else {
      // Check if step is accessible (all previous steps are completed)
      const isAccessible =
        index === 0 ||
        steps.slice(0, index).every((step) => completedSteps.has(step.id));
      return isAccessible ? "accessible" : "disabled";
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircleIcon
            sx={{ fontSize: 24, color: theme.palette.primary.main }}
          />
        );
      case "active":
        return (
          <FiberManualRecordIcon
            sx={{ fontSize: 24, color: theme.palette.primary.main }}
          />
        );
      case "accessible":
        return (
          <RadioButtonUncheckedIcon
            sx={{ fontSize: 24, color: theme.palette.primary.main }}
          />
        );
      default:
        return (
          <RadioButtonUncheckedIcon
            sx={{ fontSize: 24, color: theme.palette.grey[400] }}
          />
        );
    }
  };

  const getConnectorColor = (index: number) => {
    const currentStepStatus = getStepStatus(steps[index].id, index);
    const nextStepStatus =
      index < steps.length - 1
        ? getStepStatus(steps[index + 1].id, index + 1)
        : "disabled";

    if (
      currentStepStatus === "completed" &&
      (nextStepStatus === "completed" || nextStepStatus === "active")
    ) {
      return theme.palette.primary.main;
    }
    return theme.palette.grey[300];
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return theme.palette.text.primary;
      case "accessible":
        return theme.palette.text.secondary;
      default:
        return theme.palette.grey[400];
    }
  };

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 4,
        px: 2,
        py: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
      }}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(step.id, index);
        const isLastStep = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: isLastStep ? "0 0 auto" : "1 1 0",
                minWidth: 0,
              }}
            >
              {/* Step Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  transition: "all 0.3s ease-in-out",
                  transform: status === "active" ? "scale(1.1)" : "scale(1)",
                }}
              >
                {getStepIcon(status)}
              </Box>

              {/* Step Label */}
              <Typography
                variant="caption"
                sx={{
                  color: getTextColor(status),
                  fontWeight:
                    status === "active" || status === "completed" ? 600 : 400,
                  textAlign: "center",
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                  transition: "color 0.3s ease-in-out",
                }}
              >
                {step.title}
              </Typography>
            </Box>

            {/* Connector Line */}
            {!isLastStep && (
              <Box
                sx={{
                  flex: "1 1 0",
                  height: 2,
                  backgroundColor: getConnectorColor(index),
                  mx: 2,
                  transition: "background-color 0.3s ease-in-out",
                  borderRadius: 1,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default StepProgressBar;
