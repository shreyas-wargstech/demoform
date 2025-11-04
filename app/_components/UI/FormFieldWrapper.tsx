"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { FormField } from "@/Data/data";

interface FormFieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  field?: FormField;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  required,
  error,
  children,
  field,
}) => {
  // Use field.label and field.required if field is provided
  const displayLabel = field?.label || label;
  const isRequired = field?.required ?? required;

  return (
    <Box sx={{ mb: 2 }}>
      {displayLabel && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 0.5,
            fontWeight: 500,
            color: error ? "error.main" : "text.primary",
          }}
        >
          {displayLabel} {isRequired && <span style={{ color: "red" }}>*</span>}
        </Typography>
      )}
      {children}
      {/* Error is now shown by the field components themselves (TextField, etc.) */}
    </Box>
  );
};

export default FormFieldWrapper;
