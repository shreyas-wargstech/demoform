/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  Wallet,
  QrCode,
  CheckCircle,
} from "@mui/icons-material";
import NavigationButtons from "@/components/navigationButtons";
import { useAppSelector } from "@/store/hook";

interface PaymentSectionProps {
  formData: { [key: string]: any };
  onChange: (fieldName: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
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
  const paymentData = useAppSelector((state) => state.applicationForm?.payment);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(
    formData.paymentStatus === "completed" ||
      (isExistingForm && dataLoaded && paymentData?.status === "SUCCESSFUL"),
  );

  // Check if payment already completed from existing data
  useEffect(() => {
    if (isExistingForm && dataLoaded && paymentData?.status === "SUCCESSFUL") {
      setPaymentCompleted(true);
      onChange("paymentStatus", "completed");
      onChange(
        "transactionId",
        paymentData.razorpay_payment_id || paymentData.paymentId,
      );
    }
  }, [isExistingForm, dataLoaded, paymentData]);

  const handlePaymentMethodChange = (method: string) => {
    onChange("paymentMethod", method);
  };

  const handlePayment = async () => {
    if (!formData.paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setPaymentProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentCompleted(true);

      // Update form data with payment status
      onChange("paymentStatus", "completed");
      onChange("transactionId", `TXN${Date.now()}`);

      // Auto-proceed to next step after successful payment
      setTimeout(() => {
        onNext();
      }, 2000);
    }, 3000);
  };

  const paymentMethods = [
    {
      value: "upi",
      label: "UPI",
      icon: <QrCode sx={{ fontSize: 40 }} />,
      description: "Pay using UPI ID or QR code",
    },
    {
      value: "credit-debit-card",
      label: "Credit/Debit Card",
      icon: <CreditCard sx={{ fontSize: 40 }} />,
      description: "Visa, Mastercard, RuPay",
    },
    {
      value: "net-banking",
      label: "Net Banking",
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      description: "Pay through your bank account",
    },
    {
      value: "digital-wallet",
      label: "Digital Wallet",
      icon: <Wallet sx={{ fontSize: 40 }} />,
      description: "Paytm, PhonePe, Google Pay",
    },
  ];

  const feeBreakdown = [
    { label: "Application Fee", amount: 500.0 },
    { label: "Processing Fee", amount: 50.0 },
    { label: "GST (18%)", amount: 99.0 },
  ];

  const totalAmount = feeBreakdown.reduce((sum, item) => sum + item.amount, 0);

  if (paymentCompleted) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Transaction ID: {formData.transactionId || paymentData?.paymentId}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Amount Paid: ₹{totalAmount.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Payment method:{" "}
          {formData.paymentMethod?.replace("-", " ").toUpperCase() || "UPI"}
        </Typography>

        {!isExistingForm && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your payment has been processed successfully. You will be redirected
            to the next step shortly.
          </Alert>
        )}

        {isExistingForm && (
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}
          >
            <Button variant="outlined" onClick={onPrevious}>
              Previous
            </Button>
            <Button variant="contained" onClick={onNext}>
              Continue
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  if (paymentProcessing) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Processing Payment...
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please do not close this window or press the back button.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Processing payment of ₹{totalAmount.toFixed(2)} via{" "}
          {formData.paymentMethod?.replace("-", " ").toUpperCase()}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Fee Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          📄 Fee Summary
        </Typography>
        <Grid container spacing={2}>
          {feeBreakdown.map((item, index) => (
            <React.Fragment key={index}>
              <Grid item xs={8}>
                <Typography variant="body2">{item.label}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "right" }}>
                <Typography variant="body2">
                  ₹ {item.amount.toFixed(2)}
                </Typography>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total Amount
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "right" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ₹ {totalAmount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Payment Method Selection */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        💳 Select Payment Method
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {paymentMethods.map((method) => (
          <Grid item xs={12} sm={6} key={method.value}>
            <Card
              sx={{
                cursor: "pointer",
                border:
                  formData.paymentMethod === method.value
                    ? "2px solid"
                    : "1px solid",
                borderColor:
                  formData.paymentMethod === method.value
                    ? "primary.main"
                    : "grey.300",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 2,
                },
              }}
              onClick={() => handlePaymentMethodChange(method.value)}
            >
              <CardContent sx={{ textAlign: "center" }}>
                {method.icon}
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                  {method.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {formData.paymentMethod && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Selected Payment Method:{" "}
            <strong>
              {
                paymentMethods.find((m) => m.value === formData.paymentMethod)
                  ?.label
              }
            </strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You will be redirected to the secure payment gateway to complete
            your transaction.
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={!formData.paymentMethod}
        >
          Pay ₹{totalAmount.toFixed(2)}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentSection;
