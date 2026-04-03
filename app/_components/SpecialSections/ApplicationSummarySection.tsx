"use client";

import React from "react";
import { Box, Typography, Paper, Chip, Grid } from "@mui/material";
import {
  CheckCircle,
  Person,
  Home,
  School,
  CloudUpload,
  CreditCard,
} from "@mui/icons-material";
import NavigationButtons from "../navigationButtons";
import { useAppSelector } from "@/store/hook";

interface ApplicationSummarySectionProps {
  formData: { [key: string]: any };
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

const ApplicationSummarySection: React.FC<ApplicationSummarySectionProps> = ({
  formData,
  onNext,
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
  const aadhar = useAppSelector(
    (state) => state.applicationForm?.aadharVerification,
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
      case "aadhar":
        return <CreditCard color="primary" />;
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
      uploaded: documents?.twelfthMarksheet || formData["twelfthMarksheet"],
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
      name: "ID Proof (Aadhar)",
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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Application Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review your application details before proceeding to payment.
      </Typography>

      {/* Personal Information */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("personal")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Personal Information
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {personalInfoData.map((item, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2">{item.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Address Information */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("address")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Address Information
          </Typography>
        </Box>
        {addressInfo.map((item, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2">{item.value}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Educational Qualifications */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("education")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Educational Qualifications
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {educationInfo.map((item, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2">{item.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Documents Uploaded */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
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
              color={doc.uploaded ? "primary" : "default"}
              icon={doc.uploaded ? <CheckCircle className="text-white" /> : undefined}
              size="small"
            />
          ))}
        </Box>
      </Paper>

      {/* Aadhar Verification */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getSectionIcon("aadhar")}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Aadhar Verification
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Verification Status:
          </Typography>
          <Chip
            label={aadhar?.isVerified ? "Verified" : "Pending"}
            color={aadhar?.isVerified ? "primary" : "warning"}
            size="small"
            icon={aadhar?.isVerified ? <CheckCircle className="text-white" /> : undefined}
          />
        </Box>
      </Paper>

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        showPrevious={!isFirstStep}
        showNext={true}
        canProceed={true}
        isLastStep={false}
        nextLabel="Proceed to Payment"
      />
    </Box>
  );
};

export default ApplicationSummarySection;