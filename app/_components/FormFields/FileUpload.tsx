"use client";

import React, { useRef, useState } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { CloudUpload, Delete, InsertDriveFile } from "@mui/icons-material";
import { FormField } from "@/Data/data";
import FormFieldWrapper from "../UI/FormFieldWrapper";
import useFieldValidation from "@/hooks/useFieldValidation";
import { useAppSelector } from "@/store/hook";

interface FileUploadProps {
  field: FormField;
  value: File | string | null;
  onChange: (value: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ field, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);

  // Get form state from Redux
  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false,
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false,
  );

  // Check if field has existing data (file or URL string)
  const hasExistingData = isExistingForm && dataLoaded && Boolean(value);

  const { error } = useFieldValidation(field, value, {
    validateOnMount: false,
    enabled: true,
    hasExistingData: hasExistingData || touched,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    const file = event.target.files?.[0] || null;

    if (file && field.maxSize) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > field.maxSize) {
        alert(`File size should not exceed ${field.maxSize}MB`);
        return;
      }
    }

    onChange(file);
  };

  const handleButtonClick = () => {
    setTouched(true);
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setTouched(true);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileName = () => {
    if (value instanceof File) {
      return value.name;
    } else if (typeof value === "string") {
      // Extract filename from URL
      return value.split("/").pop() || "Uploaded file";
    }
    return "";
  };

  const getFileSize = () => {
    if (value instanceof File) {
      return formatFileSize(value.size);
    } else if (typeof value === "string") {
      return "Previously uploaded";
    }
    return "";
  };

  return (
    <FormFieldWrapper field={field} error={error}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          borderColor: error ? "error.main" : "grey.300",
          "&:hover": {
            borderColor: error ? "error.dark" : "primary.main",
            backgroundColor: "action.hover",
          },
        }}
        onClick={!value ? handleButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={field.accept}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {!value ? (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Click to upload document
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {field.accept?.split(",").join(", ").toUpperCase()}
              {field.maxSize && ` (Max ${field.maxSize}MB)`}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InsertDriveFile color="primary" />
              <Box sx={{ textAlign: "left" }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {getFileName()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getFileSize()}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleRemoveFile} size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        )}
      </Paper>
    </FormFieldWrapper>
  );
};

export default FileUpload;
