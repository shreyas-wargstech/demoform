/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Alert, TextField } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { getStepById, STATIC_OTP_CONFIG } from "../data";
import FieldRenderer from "../DynamicForm/FieldRenderer";
import NavigationButtons from "../../_components/navigationButtons";
import { useAppSelector } from "@/store/hook";
import { toast } from "sonner";
import useNewReg from "@/store/hooks/useNewReg";

interface AadharFlowProps {
  formData: { [key: string]: any };
  onChange: (fieldName: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

type FlowStep = "method-selection" | "otp-verification" | "success";

const AadharFlow: React.FC<AadharFlowProps> = ({
  formData,
  onChange,
  onNext,
  onPrevious,
  isFirstStep,
}) => {
  // Get form state from Redux to check if we're loading existing data
  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false,
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false,
  );
  const aadharVerification = useAppSelector(
    (state) => state.applicationForm?.aadharVerification,
  );

  const { actions, formState } = useNewReg();

  // Determine initial step based on existing data
  const getInitialStep = (): FlowStep => {
    console.log(
      "isExistingForm:",
      isExistingForm,
      "dataLoaded:",
      dataLoaded,
      "aadharVerification:",
      aadharVerification,
    );
    if (isExistingForm && dataLoaded && aadharVerification?.isVerified) {
      return "success";
    }
    return "method-selection";
  };

  const [currentStep, setCurrentStep] = useState<FlowStep>(getInitialStep());
  const [otpValue, setOtpValue] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(STATIC_OTP_CONFIG.EXPIRY_TIME);
  const [otpError, setOtpError] = useState("");

  const aadharStep = getStepById("aadhar-verification");
  const aadharFields = aadharStep?.fields || [];

  // Update step if existing data loads
  useEffect(() => {
    if (isExistingForm && dataLoaded && aadharVerification?.isVerified) {
      setCurrentStep("success");
      onChange("aadharVerified", true);
    }
  }, [isExistingForm, dataLoaded, aadharVerification]);

  // Update the aadharInput field based on verification method selection
  const getUpdatedAadharField = () => {
    const aadharField = aadharFields.find(
      (field) => field.name === "aadharNo",
    );

    if (aadharField && formData["verificationMethod"]) {
      console.log("formData", formData);
      return {
        ...aadharField,
        label:
          formData["verificationMethod"] === "virtual-id"
            ? "Virtual ID (VID)"
            : "Aadhar Number",
        placeholder:
          formData["verificationMethod"] === "virtual-id"
            ? "Enter 16-digit Virtual ID"
            : "Enter 12-digit Aadhar number",
        validation: {
          pattern:
            formData["verificationMethod"] === "virtual-id"
              ? /^\d{16}$/
              : /^\d{12}$/,
          message:
            formData["verificationMethod"] === "virtual-id"
              ? "Virtual ID must be 16 digits"
              : "Aadhar number must be 12 digits",
        },
      };
    }

    return aadharField;
  };

  // Update fields with the dynamic aadhar field
  const updatedAadharFields = aadharFields.map((field) => {
    if (field.name === "aadharNo") {
      return getUpdatedAadharField() || field;
    }
    return field;
  });

  useEffect(() => {
    if (currentStep === "otp-verification" && otpExpiry > 0) {
      const timer = setTimeout(() => {
        setOtpExpiry((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, otpExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProceedToVerify = () => {
    const aadharNumber = formData["aadharNo"];
    const consent = formData["consentCheckbox"];

    if (!aadharNumber || !consent) {
      alert("Please fill all required fields and give consent");
      return;
    }

    // Validate based on verification method
    const verificationMethod = formData["verificationMethod"];
    const isValidInput =
      verificationMethod === "virtual-id"
        ? /^\d{16}$/.test(aadharNumber)
        : /^\d{12}$/.test(aadharNumber);

    if (!isValidInput) {
      alert(
        `Please enter a valid ${verificationMethod === "virtual-id"
          ? "16-digit Virtual ID"
          : "12-digit Aadhar number"
        }`,
      );
      return;
    }

    setCurrentStep("otp-verification");
    setOtpExpiry(STATIC_OTP_CONFIG.EXPIRY_TIME);
  };

  const handleOtpSubmit = async () => {
    if (otpValue === STATIC_OTP_CONFIG.OTP_VALUE) {
      try {
        // Call the Aadhar submit API here
        await actions.submitAadhar({
          formId: formState.formId,
          aadharNo: formData.aadharNo,
          validAadhar: true,
        });

        // Update local state
        setCurrentStep("success");
        onChange("aadharVerified", true);
        onChange("validAadhar", true);
        onChange("isVerified", true);

        toast.success("Aadhar verified successfully");
      } catch (error: any) {
        setOtpError(error?.response?.data?.message || "Failed to verify Aadhar");
      }
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };


  const handleChangeNumber = () => {
    setCurrentStep("method-selection");
    setOtpValue("");
    setOtpError("");
  };

  const handleResendOtp = () => {
    setOtpExpiry(STATIC_OTP_CONFIG.EXPIRY_TIME);
    setOtpValue("");
    setOtpError("");
  };

  const handleContinueToSummary = () => {
    if (onNext) onNext();
  };

  const renderMethodSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Aadhar Verification
      </Typography>

      {updatedAadharFields.map((field) => (
        <Box key={field.name} sx={{ mb: 3 }}>
          <FieldRenderer
            field={field}
            value={formData[field.name] || ""}
            onChange={onChange}
          />
        </Box>
      ))}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Important Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          • Your Aadhar information will be used only for verification purposes
          <br />
          • Data will be processed as per UIDAI guidelines and privacy norms
          <br />
          • No biometric or demographic data will be stored permanently
          <br />• Virtual ID (VID) is a 16-digit temporary number mapped to your
          Aadhar
        </Typography>
      </Alert>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleProceedToVerify}
          disabled={!formData["aadharNo"] || !formData["consentCheckbox"]}
        >
          Proceed to Verify
        </Button>
      </Box>
    </Box>
  );

  const renderOtpVerification = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Aadhar Verification
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        OTP sent successfully to your registered mobile number
      </Alert>

      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Enter Verification Code
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Weve sent a 4-digit verification code to the mobile number registered
        with your{" "}
        {formData["verificationMethod"] === "virtual-id"
          ? "Virtual ID"
          : "Aadhar"}
        : {STATIC_OTP_CONFIG.MOBILE_NUMBER}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 2, display: "block" }}
      >
        OTP expires in {formatTime(otpExpiry)}
      </Typography>

      <TextField
        fullWidth
        // placeholder="Enter 4-digit OTP"
        value={otpValue}
        onChange={(e) => {
          setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 4));
          setOtpError("");
        }}
        inputProps={{
          maxLength: 4,
          style: {
            textAlign: "center",
            fontSize: "1.2rem",
            letterSpacing: "0.5rem",
          },
        }}
        error={!!otpError}
        helperText={otpError}
        sx={{ width: 200, mb: 2 }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 3 }}
      >
        OTP valid for 1 minute
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Didnt receive the code?
        </Typography>
        <Button size="small" onClick={handleResendOtp} disabled={otpExpiry > 0}>
          {otpExpiry > 0 ? `Resend in ${otpExpiry}s` : "Resend OTP"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handleChangeNumber}>
          Change Number
        </Button>
        <Button
          variant="contained"
          onClick={handleOtpSubmit}
          disabled={otpValue.length !== 4}
        >
          Submit OTP
        </Button>
      </Box>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        {formData["verificationMethod"] === "virtual-id"
          ? "Virtual ID"
          : "Aadhar"}{" "}
        Verification Successful!
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {formData["verificationMethod"] === "virtual-id"
            ? "Virtual ID"
            : "Aadhar No"}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {formData["verificationMethod"] === "virtual-id"
            ? "XXXX XXXX XXXX 2140"
            : "XXXX XXXX 2140"}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Your{" "}
        {formData["verificationMethod"] === "virtual-id"
          ? "Virtual ID"
          : "Aadhar"}{" "}
        details have been successfully verified. You can now continue with your
        application for registration with the Maharashtra Council of
        Homoeopathy.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant="outlined" onClick={onPrevious}>
          Save & Continue Later
        </Button>
        <Button variant="contained" onClick={handleContinueToSummary}>
          Continue to summary
        </Button>
      </Box>
    </Box>
  );

  switch (currentStep) {
    case "method-selection":
      return renderMethodSelection();
    case "otp-verification":
      return renderOtpVerification();
    case "success":
      return renderSuccess();
    default:
      return renderMethodSelection();
  }
};

export default AadharFlow;
