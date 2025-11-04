"use client";

import React, { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { FormField } from "@/Data/data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface TextInputProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ field, value, onChange }) => {
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

  const { error, isValid } = useFieldValidation(field, value, {
    validateOnMount: false,
    enabled: true,
    hasExistingData: hasExistingData || touched,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    // Format phone numbers
    if (field.type === "tel") {
      // Remove non-digits and limit to 10 digits
      newValue = newValue.replace(/\D/g, "").slice(0, 10);
    }

    // Format PIN codes
    if (
      field.name.toLowerCase().includes("pincode") ||
      field.name.toLowerCase().includes("pin")
    ) {
      newValue = newValue.replace(/\D/g, "").slice(0, 6);
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getInputType = () => {
    switch (field.type) {
      case "email":
        return "email";
      case "tel":
        return "tel";
      default:
        return "text";
    }
  };

  const getStartAdornment = () => {
    if (field.type === "tel") {
      return <InputAdornment position="start">+91</InputAdornment>;
    }
    return undefined;
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <TextField
        fullWidth
        type={getInputType()}
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        error={Boolean(error)}
        helperText={error}
        placeholder={field.placeholder}
        required={field.required}
        disabled={field.disabled}
        InputProps={{
          startAdornment: getStartAdornment(),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-error": {
              "& fieldset": {
                borderColor: "error.main",
              },
            },
          },
        }}
      />
    </FormFieldWrapper>
  );
};

export default TextInput;
