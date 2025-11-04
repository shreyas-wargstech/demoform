/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";
import { FormField } from "@/Data/data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface SelectFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
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

  const handleChange = (event: any) => {
    onChange(event.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <FormControl fullWidth error={Boolean(error)}>
        <Select
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          displayEmpty
          required={field.required}
          disabled={field.disabled}
        >
          <MenuItem value="" disabled>
            {field.placeholder || `Select ${field.label}`}
          </MenuItem>
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FormFieldWrapper>
  );
};

export default SelectField;
