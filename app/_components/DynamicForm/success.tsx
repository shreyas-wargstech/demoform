import React from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Container,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { useAuth } from "@/store/hook";



export interface ApplicationData {
  // applicantName: string;
  submissionDate: string | null;
  applicationType: string;
  referenceNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface ApplicationSuccessScreenProps {
  applicationData?: ApplicationData;
  onBackToHome: () => void;
}

const ApplicationSuccessScreen: React.FC<ApplicationSuccessScreenProps> = ({
  applicationData,
  onBackToHome,
}) => {

  const {user} = useAuth();

  // const { personalInfo, formState, applicationType, submittedAt, status } = useNewReg();

  // const realApplicationData = {
  //   applicantName: `${personalInfo.firstName} ${personalInfo.middleName} ${personalInfo.lastName}`.trim(),
  //   submissionDate: formState.submittedAt 
  //     && submittedAt,
  //     // : new Date().toLocaleDateString('en-GB', { 
  //     //     day: '2-digit', 
  //     //     month: 'short', 
  //     //     year: 'numeric' 
  //     //   }),
  //   applicationType: applicationType,
  //   referenceNumber: formState.formId,
  //   status: status === 'PENDING' ? "Pending" : (status === 'APPROVED' ? "Approved" : "Rejected"),
  const applicantName = `${user?.details.firstName} ${user?.details.lastName}`.trim();

  return (
    <Container maxWidth="md">
      <Box className="success-screen-container">
        <Box className="success-screen-content">
          {/* Success Icon */}
          <Box className="success-icon-wrapper">
            <Image
              src="/assets/success.svg"
              alt="Success"
              width={80}
              height={80}
              className="success-icon"
            />
          </Box>

          {/* Success Message */}
          <Typography variant="h4" component="h1" className="success-title">
            Application Submitted!
          </Typography>

          {/* Application Summary Card */}
          <Card className="application-summary-card">
            <CardContent className="card-content">
              <Box className="card-header">
                <Box component="span" className="document-icon">
                  <Description />
                </Box>
                <Typography variant="h6" className="card-title">
                  Application Summary
                </Typography>
                <Chip
                  label={applicationData?.status}
                  size="small"
                  className="status-chip"
                />
              </Box>

              {/* Application Details */}
              <Box>
                <Grid container className="info-row">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" className="field-label">
                      Applicant Name
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {applicantName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" className="field-label">
                      Submission Date
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {applicationData?.submissionDate}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container className="info-row">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" className="field-label">
                      Application Type
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {applicationData?.applicationType}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" className="field-label">
                      Reference Number
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {applicationData?.referenceNumber}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ApplicationSuccessScreen;
