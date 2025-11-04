/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { FormField } from "../../../../../../Data/data";
import TextInput from "../FormFields/TextInput";
import SelectField from "../FormFields/SelectField";
import FileUpload from "../FormFields/FileUpload";
import RadioGroup from "../FormFields/RadioGroup";
import CheckboxField from "../FormFields/CheckboxField";
import DateField from "../FormFields/DateField";

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldName: string, value: any) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
}) => {
  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return <TextInput field={field} value={value} onChange={handleChange} />;

    case "select":
      return (
        <SelectField field={field} value={value} onChange={handleChange} />
      );

    case "file":
      return <FileUpload field={field} value={value} onChange={handleChange} />;

    case "radio":
      return <RadioGroup field={field} value={value} onChange={handleChange} />;

    case "checkbox":
      return (
        <CheckboxField field={field} value={value} onChange={handleChange} />
      );

    case "date":
      return <DateField field={field} value={value} onChange={handleChange} />;

    default:
      console.warn(`Unknown field type: ${field.type}`);
      return null;
  }
};

export default FieldRenderer;
