"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Visibility,
  CheckCircle,
  Refresh,
} from "@mui/icons-material";
import { FormField } from "../data";
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get form state from Redux
  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false
  );

  // Check if field has existing data (file or URL string)
  const hasExistingData = isExistingForm && dataLoaded && Boolean(value);
  const isUploaded = Boolean(value);

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

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTouched(true);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (value instanceof File) {
      // Create preview URL for File object
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      setViewerOpen(true);
    } else if (typeof value === "string") {
      // Use existing URL
      setPreviewUrl(value);
      setViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    // Clean up object URL if it was created
    if (previewUrl && value instanceof File) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
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
      const parts = value.split("/");
      const fileName = parts[parts.length - 1];
      return decodeURIComponent(fileName);
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

  const isImage = () => {
    const fileName = getFileName().toLowerCase();
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(fileName);
  };

  const isPDF = () => {
    const fileName = getFileName().toLowerCase();
    return fileName.endsWith(".pdf");
  };

  return (
    <>
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
            <Box>
              {/* Status Chip */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <Chip
                  icon={<CheckCircle />}
                  label="Uploaded"
                  color="success"
                  size="small"
                />
              </Box>

              {/* File Info */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
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

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {/* View Button */}
                  <IconButton
                    onClick={handleViewFile}
                    size="small"
                    color="primary"
                    title="View document"
                  >
                    <Visibility />
                  </IconButton>

                  {/* Replace Button */}
                  <IconButton
                    onClick={handleButtonClick}
                    size="small"
                    color="info"
                    title="Replace document"
                  >
                    <Refresh />
                  </IconButton>

                  {/* Delete Button */}
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    color="error"
                    title="Remove document"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </FormFieldWrapper>

      {/* Document Viewer Modal */}
      <Dialog
        open={viewerOpen}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">{getFileName()}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box sx={{ width: "100%", height: "70vh", overflow: "auto" }}>
              {isImage() ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              ) : isPDF() ? (
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="PDF Viewer"
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <InsertDriveFile sx={{ fontSize: 64, color: "grey.500", mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    href={previewUrl}
                    download={getFileName()}
                    sx={{ mt: 2 }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewer}>Close</Button>
          {previewUrl && (
            <Button
              variant="contained"
              href={previewUrl}
              download={getFileName()}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUpload;
