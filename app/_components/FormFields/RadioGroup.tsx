"use client";

import React, { useState } from "react";
import {
  FormControl,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { FormField } from "@/Data/data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface RadioGroupProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ field, value, onChange }) => {
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
    onChange(event.target.value);
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <FormControl component="fieldset" error={Boolean(error)}>
        <MuiRadioGroup value={value || ""} onChange={handleChange} row>
          {field.options?.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={field.disabled}
            />
          ))}
        </MuiRadioGroup>
      </FormControl>
    </FormFieldWrapper>
  );
};

export default RadioGroup;
