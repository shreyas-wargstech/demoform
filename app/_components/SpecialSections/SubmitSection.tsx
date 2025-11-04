"use client";

import React from "react";
import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import {
  CheckCircle,
  Person,
  Home,
  School,
  CloudUpload,
  Payment,
} from "@mui/icons-material";
import NavigationButtons from "@/components/navigationButtons";
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
  isFirstStep,
}) => {
  // Get data from Redux store for accurate display
  const personalInfo = useAppSelector(
    (state) => state.applicationForm?.personalInfo,
  );
  const addresses = useAppSelector((state) => state.applicationForm?.addresses);
  const qualification = useAppSelector(
    (state) => state.applicationForm?.qualification,
  );
  const documents = useAppSelector((state) => state.applicationForm?.documents);
  const payment = useAppSelector((state) => state.applicationForm?.payment);
  const aadhaar = useAppSelector(
    (state) => state.applicationForm?.aadhaarVerification,
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "personal":
        return <Person color="primary" />;
      case "address":
        return <Home color="primary" />;
      case "education":
        return <School color="primary" />;
      case "documents":
        return <CloudUpload color="primary" />;
      case "payment":
        return <Payment color="primary" />;
      default:
        return <CheckCircle color="primary" />;
    }
  };

  const personalInfoData = [
    {
      label: "Name",
      value: `Dr. ${personalInfo?.firstName || formData.firstName || ""} ${
        personalInfo?.middleName || formData.middleName || ""
      } ${personalInfo?.lastName || formData.lastName || ""}`.trim(),
    },
    {
      label: "Date of Birth",
      value: formatDate(personalInfo?.dob || formData.dob),
    },
    {
      label: "Gender",
      value: personalInfo?.gender || formData.gender || "Not specified",
    },
    {
      label: "Father's Name",
      value: personalInfo?.fatherName || formData.fatherName || "Not provided",
    },
    {
      label: "Mother's Name",
      value: personalInfo?.motherName || formData.motherName || "Not provided",
    },
    {
      label: "Email",
      value: personalInfo?.email || formData.email || "Not provided",
    },
    {
      label: "Mobile Number",
      value: personalInfo?.mobileNo || formData.mobileNo || "Not provided",
    },
  ];

  const addressInfo = [
    {
      label: "Permanent Address",
      value:
        `${addresses?.permanent?.permanentStreet || formData.permanentStreet || ""} ${
          addresses?.permanent?.permanentArea || formData.permanentArea || ""
        } ${addresses?.permanent?.permanentCity || formData.permanentCity || ""}, ${
          addresses?.permanent?.permanentState || formData.permanentState || ""
        } - ${addresses?.permanent?.permanentPincode || formData.permanentPincode || ""}`.trim(),
    },
    {
      label: "Correspondence Address",
      value:
        addresses?.correspondence?.correStreet || formData.correStreet
          ? `${addresses?.correspondence?.correStreet || formData.correStreet} ${
              addresses?.correspondence?.correArea || formData.correArea
            } ${addresses?.correspondence?.correCity || formData.correCity}, ${
              addresses?.correspondence?.correState || formData.correState
            } - ${addresses?.correspondence?.correPincode || formData.correPincode}`
          : "Same as Permanent Address",
    },
  ];

  const educationInfo = [
    {
      label: "Degree",
      value:
        qualification?.degreeName || formData.degreeName || "Not specified",
    },
    {
      label: "College",
      value:
        qualification?.collegeName || formData.collegeName || "Not specified",
    },
    {
      label: "University",
      value:
        qualification?.universityName ||
        formData.universityName ||
        "Not specified",
    },
    {
      label: "Year of Admission",
      value:
        qualification?.yearOfAdmission ||
        formData.yearOfAdmission ||
        "Not specified",
    },
    {
      label: "Year of Passing",
      value:
        qualification?.yearOfPassing ||
        formData.yearOfPassing ||
        "Not specified",
    },
    {
      label: "Roll Number",
      value: qualification?.rollNo || formData.rollNo || "Not specified",
    },
    {
      label: "Internship Status",
      value:
        qualification?.internship || formData.internship || "Not specified",
    },
  ];

  const documentsList = [
    {
      name: "10th Marksheet",
      uploaded: documents?.tenthMarksheet || formData["tenthMarksheet"],
    },
    {
      name: "12th Marksheet",
      uploaded: documents?.twelfthMarksheet || formData["twelthMarksheet"],
    },
    {
      name: "College Leaving Certificate",
      uploaded: documents?.collegeLeaving || formData["collegeLeaving"],
    },
    {
      name: "Final Year Marksheet",
      uploaded: documents?.finalYearMarksheet || formData["finalYearMarksheet"],
    },
    {
      name: "Attempt Certificate",
      uploaded: documents?.attemptCertificate || formData["attemptCertificate"],
    },
    { name: "Passport Photo", uploaded: documents?.photo || formData["photo"] },
    {
      name: "Scanned Signature",
      uploaded: documents?.signature || formData["signature"],
    },
    {
      name: "ID Proof (Aadhaar)",
      uploaded: documents?.idProof || formData["idProof"],
    },
    {
      name: "Domicile/Nationality Certificate",
      uploaded:
        documents?.nationalityCertificate || formData["nationalityCertificate"],
    },
    {
      name: "Internship Certificate",
      uploaded:
        documents?.internshipCertificate || formData["internshipCertificate"],
    },
  ];

  const paymentInfo = [
    { label: "Fee Type", value: "Provisional Registration" },
    { label: "Amount", value: `₹${payment?.amount || "500"}` },
    {
      label: "Payment Method",
      value: payment?.paymentMethod || formData.paymentMethod || "UPI",
    },
    {
      label: "Receipt ID",
      value: payment?.paymentId || formData.transactionId || "MCH20740H01",
    },
    {
      label: "Status",
      value: payment?.status === "SUCCESSFUL" ? "Successful" : "Pending",
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Application Summary
      </Typography>

      {/* Personal Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("personal")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Personal Information
          </Typography>
        </Box>
        {personalInfoData.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            <Typography variant="body1">{item.value}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Address Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("address")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Address Information
          </Typography>
        </Box>
        {addressInfo.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            <Typography variant="body1">{item.value}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Educational Qualifications */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("education")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Educational Qualifications
          </Typography>
        </Box>
        {educationInfo.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            <Typography variant="body1">{item.value}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Documents Uploaded */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("documents")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Documents Uploaded
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {documentsList.map((doc, index) => (
            <Chip
              key={index}
              label={doc.name}
              color={doc.uploaded ? "success" : "default"}
              icon={doc.uploaded ? <CheckCircle /> : undefined}
              size="small"
            />
          ))}
        </Box>
      </Paper>

      {/* Payment Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("payment")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Payment Information
          </Typography>
        </Box>
        {paymentInfo.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            <Typography variant="body1">{item.value}</Typography>
          </Box>
        ))}
      </Paper>

      <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          By submitting this application, I confirm that all the information
          provided is accurate and complete.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          Submit Application
        </Button>
      </Box>
    </Box>
  );
};

export default SubmitSection;
