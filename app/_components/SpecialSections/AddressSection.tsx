/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import { FormField, getStepById } from "../data";
import FieldRenderer from "../DynamicForm/FieldRenderer";
import NavigationButtons from "../../_components/navigationButtons";
import { useAppSelector } from "@/store/hook";

interface AddressSectionProps {
  formData: { [key: string]: any };
  onChange: (fieldName: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  formData,
  onChange,
  onNext,
  onPrevious,
  isFirstStep,
}) => {
  const [sameAsPermanent, setSameAsPermanent] = useState(
    formData.isSameAddress || false,
  );

  // Get form state from Redux to check if we're loading existing data
  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false,
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false,
  );

  const addressStep = getStepById("address");
  const addressFields = addressStep?.fields || [];

  // Separate permanent and correspondence fields
  const permanentFields = addressFields.filter((field) =>
    field.name.startsWith("permanent"),
  );

  const correspondenceFields = addressFields.filter((field) =>
    field.name.startsWith("corre"),
  );

  // Initialize sameAsPermanent based on existing data
  useEffect(() => {
    if (isExistingForm && dataLoaded) {
      // Check if correspondence and permanent addresses are the same
      const addressesMatch = permanentFields.every((field) => {
        const correspondenceFieldName = field.name.replace(
          "permanent",
          "corre",
        );
        return formData[field.name] === formData[correspondenceFieldName];
      });

      if (addressesMatch && formData.isSameAddress !== false) {
        setSameAsPermanent(true);
        onChange("isSameAddress", true);
      }
    }
  }, [isExistingForm, dataLoaded]);

  const handleSameAddressToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;
    setSameAsPermanent(checked);
    onChange("isSameAddress", checked);

    if (checked) {
      // Copy permanent address values to correspondence
      permanentFields.forEach((field) => {
        const correspondenceFieldName = field.name.replace(
          "permanent",
          "corre",
        );
        const permanentValue = formData[field.name] || "";
        onChange(correspondenceFieldName, permanentValue);
      });
    } else {
      // Clear correspondence address when unchecked (only if not existing data)
      if (!isExistingForm || !dataLoaded) {
        correspondenceFields.forEach((field) => {
          onChange(field.name, "");
        });
      }
    }
  };

  // Handle field changes with proper correspondence field handling
  const handleFieldChange = (fieldName: string, value: any) => {
    onChange(fieldName, value);

    // If it's a permanent field and sameAsPermanent is true, update corresponding field
    if (fieldName.startsWith("permanent") && sameAsPermanent) {
      const correspondenceFieldName = fieldName.replace("permanent", "corre");
      onChange(correspondenceFieldName, value);
    }
  };

  // Sync correspondence fields when permanent fields change AND sameAsPermanent is true
  useEffect(() => {
    if (sameAsPermanent) {
      permanentFields.forEach((field) => {
        const correspondenceFieldName = field.name.replace(
          "permanent",
          "corre",
        );
        const permanentValue = formData[field.name] || "";
        const correspondenceValue = formData[correspondenceFieldName] || "";

        // Only update if they're different (to avoid infinite loop)
        if (permanentValue !== correspondenceValue) {
          onChange(correspondenceFieldName, permanentValue);
        }
      });
    }
  }, [formData, sameAsPermanent, permanentFields, onChange]);

  const validateAddressSection = () => {
    // Check if all permanent address fields are filled
    const permanentAddressValid = permanentFields
      .filter((field) => field.required)
      .every((field) => {
        const value = formData[field.name];
        return value && value.trim() !== "";
      });

    // If same as permanent, correspondence is automatically valid
    if (sameAsPermanent) {
      return permanentAddressValid;
    }

    // Check correspondence address if not same as permanent
    const correspondenceAddressValid = correspondenceFields
      .filter((field) => field.required)
      .every((field) => {
        const value = formData[field.name];
        return value && value.trim() !== "";
      });

    return permanentAddressValid && correspondenceAddressValid;
  };

  const renderAddressFields = (
    fields: FormField[],
    isCorrespondence: boolean = false,
  ) => {
    return (
      <Grid container spacing={3}>
        {fields.map((field) => {
          const fieldName = field.name;
          const gridSize = getFieldGridSize(fieldName);

          return (
            <Grid size={{ xs: 12, md: gridSize }} key={fieldName}>
              <FieldRenderer
                field={field}
                value={formData[fieldName] || ""}
                onChange={handleFieldChange}
              />
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Function to determine grid size based on field name/type
  const getFieldGridSize = (fieldName: string): number => {
    const baseFieldName = fieldName.replace(/^(permanent|corre)/, "");

    // Common patterns for field sizing
    if (baseFieldName.toLowerCase().includes("street")) {
      return 12; // Full width for street fields
    }

    if (
      baseFieldName.toLowerCase().includes("city") ||
      baseFieldName.toLowerCase().includes("district") ||
      baseFieldName.toLowerCase().includes("area") ||
      baseFieldName.toLowerCase().includes("state") ||
      baseFieldName.toLowerCase().includes("pin") ||
      baseFieldName.toLowerCase().includes("code")
    ) {
      return 6; // Half width for other fields
    }

    return 6; // Default half width
  };

  return (
    <Box>
      {/* Permanent Address Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Permanent Address *
      </Typography>
      {renderAddressFields(permanentFields, false)}

      {/* Checkbox Section */}
      <Box sx={{ my: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={sameAsPermanent}
              onChange={handleSameAddressToggle}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Same as Permanent Address
            </Typography>
          }
        />
      </Box>

      {/* Correspondence Address Section */}
      {!sameAsPermanent && (
        <>
          <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
            Correspondence Address *
          </Typography>
          {renderAddressFields(correspondenceFields, true)}
        </>
      )}

      {/* Navigation Buttons */}

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        showPrevious={!isFirstStep}
        showNext={true}
        canProceed={validateAddressSection()}
        isLastStep={false}
      />
    </Box>
  );
};

export default AddressSection;
