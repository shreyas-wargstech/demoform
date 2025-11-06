"use client";

import React from "react";
import { Box, Typography, Paper, Button, Checkbox, FormControlLabel, Alert } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useAppSelector } from "@/store/hook";

interface SubmitSectionProps {
  formData: { [key: string]: any };
  onChange?: (fieldName: string, value: any) => void;
  onSubmit?: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  formData,
  onChange,
  onSubmit,
  onPrevious,
}) => {
  const finalConsent = useAppSelector(
    (state) => state.applicationForm?.finalConsent || false
  );
  const personalInfo = useAppSelector(
    (state) => state.applicationForm?.personalInfo,
  );

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange("finalConsent", event.target.checked);
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <CheckCircle color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Almost Done!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You're about to submit your application for medical license registration.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          📋 Application Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your application for <strong>New Registration</strong> is ready to be submitted.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Personal Information Completed</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Address Information Completed</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Educational Qualifications Completed</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Documents Uploaded</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Aadhar Verified</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2">Payment Completed</Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300', bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          ⚠️ Declaration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Before submitting your application, please read and accept the following declaration:
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          I, <strong>Dr. {personalInfo?.firstName} {personalInfo?.lastName}</strong>, 
          hereby declare that:
        </Typography>
        
        <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              All information provided in this application is true, accurate, and complete to the best of my knowledge.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              I understand that any false information may result in the rejection of my application or cancellation of my registration.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              I agree to abide by the rules and regulations of the Maharashtra Council of Homoeopathy.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              All documents uploaded are genuine and I can provide original copies when requested.
            </Typography>
          </li>
        </ul>

        <FormControlLabel
          control={
            <Checkbox
              checked={finalConsent}
              onChange={handleConsentChange}
              required
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              I confirm that I have read and accept the above declaration. All information provided is accurate and complete.
            </Typography>
          }
          sx={{ 
            mt: 2,
            alignItems: 'flex-start',
            '& .MuiCheckbox-root': {
              pt: 0
            }
          }}
        />
      </Paper>

      {!finalConsent && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please read and accept the declaration to proceed with submission.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Once submitted, you will receive a confirmation email with your application reference number. 
          You can track your application status using this reference number.
        </Typography>
      </Alert>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSubmit}
          disabled={!finalConsent}
        >
          Submit Application
        </Button>
      </Box>
    </Box>
  );
};

export default SubmitSection;