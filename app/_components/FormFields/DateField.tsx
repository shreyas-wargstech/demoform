"use client";

import React, { useState } from "react";
import { TextField } from "@mui/material";
import { FormField } from "@/Data/data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface DateFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const DateField: React.FC<DateFieldProps> = ({ field, value, onChange }) => {
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
    onChange(event.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <TextField
        fullWidth
        type="date"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={Boolean(error)}
        helperText={error}
        required={field.required}
        disabled={field.disabled}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </FormFieldWrapper>
  );
};

export default DateField;
