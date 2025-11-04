"use client";

import React, { useState } from "react";
import { FormControlLabel, Checkbox, Typography } from "@mui/material";
import { FormField } from "../data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface CheckboxFieldProps {
  field: FormField;
  value: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const [touched, setTouched] = useState(false);

  // Get form state from Redux
  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false,
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false,
  );

  // Check if field has existing data
  const hasExistingData = isExistingForm && dataLoaded && Boolean(value);

  const { error } = useFieldValidation(field, value, {
    validateOnMount: false,
    enabled: true,
    hasExistingData: hasExistingData || touched,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    onChange(event.target.checked);
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <FormControlLabel
        control={
          <Checkbox
            checked={value || false}
            onChange={handleChange}
            required={field.required}
            disabled={field.disabled}
          />
        }
        label={
          <Typography variant="body2" color={error ? "error" : "textPrimary"}>
            {field.label}
          </Typography>
        }
        sx={{ mt: 1, alignItems: "flex-start" }}
      />
    </FormFieldWrapper>
  );
};

export default CheckboxField;
