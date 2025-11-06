/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import NavigationButtons from '../../_components/navigationButtons';
import { useAppSelector } from '@/store/hook';
import { useNewReg } from '@/store/hooks/useNewReg';
import { toast } from 'sonner';

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
  const { actions, formState } = useNewReg();

  const isExistingForm = useAppSelector(
    (state) => state.applicationForm?.isExistingForm || false
  );
  const dataLoaded = useAppSelector(
    (state) => state.applicationForm?.dataLoaded || false
  );
  const paymentData = useAppSelector(
    (state) => state.applicationForm?.payment
  );

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(
    formData.paymentStatus === 'SUCCESSFUL' ||
    (isExistingForm && dataLoaded && paymentData?.status === 'SUCCESSFUL')
  );
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');
  const [paymentTime, setPaymentTime] = useState<string>('');

  // Load existing payment status
  useEffect(() => {
    if (isExistingForm && dataLoaded && paymentData?.status === 'SUCCESSFUL') {
      setPaymentCompleted(true);
      onChange('paymentStatus', 'completed');
      onChange('transactionId', paymentData.razorpay_payment_id || paymentData.paymentId);
    }
  }, [isExistingForm, dataLoaded, paymentData]);

  // Step 1: Call createPayment API (/api/v1/payments/form-payment)
  const handlePayment = async () => {
    setPaymentProcessing(true);
    setPaymentFailed(false);

    try {
      const response = await actions.createPayment({
        formId: formState.formId,
        applicationType: formState.applicationType,
        payment_name: 'Medical License Application Fee',
      });

      console.log('Payment creation response:', response);

      setPaymentId(response.paymentId);

      if (response.status === "SUCCESSFUL") {
        setPaymentFailed(false);
        setPaymentId(response.paymentId);
        setPaymentTime(response.completedAt);
        setPaymentCompleted(true);
        setPaymentProcessing(false);

        onChange('paymentStatus', 'SUCCESSFUL');
        onChange('transactionId', response.paymentId);
      } else if (response.status === "FAILED") {
        setPaymentProcessing(false);
        setPaymentFailed(true);
      }

      setTimeout(async () => {
        await handlePaymentVerification(response.paymentId);
      }, 2000);

    } catch (error: any) {
      console.error('Payment creation failed:', error);

      setPaymentProcessing(false);

      // FIXED: Now you can directly access the rejected value
      // When using rejectWithValue, the error IS the data you returned
      console.log('Error data:', error);

      if (error?.status === "SUCCESSFUL") {
        // Payment already completed
        setPaymentCompleted(true);
        setPaymentFailed(false);
        setPaymentId(error.paymentId);
        setPaymentTime(error.completedAt);

        onChange('paymentStatus', 'SUCCESSFUL');
        onChange('transactionId', error.paymentId);

        setTimeout(async () => {
          await handlePaymentVerification(error.paymentId);
        }, 2000);

        toast.success('Payment already completed');
      } else {
        // Actual failure
        setPaymentFailed(true);
        toast.error(error?.error || 'Failed to initiate payment');
      }
    }
  };


  // Step 2: Call verifyPayment API (/api/v1/payments/form-payment/verify)
  const handlePaymentVerification = async (createdPaymentId: string) => {
    try {
      // In production, these values would come from your payment gateway callback
      const mockPaymentReference = 'PAY_MOCK_REF_' + Date.now();
      const mockTransactionId = 'TXN_MOCK_ID_' + Date.now();

      // Call the verifyPayment API
      const verifyResponse = await actions.verifyPayment({
        formId: formState.formId,
        paymentReference: mockPaymentReference,
        transactionId: mockTransactionId,
      });

      console.log('Payment verification response:', verifyResponse);

      if (verifyResponse.status === 'SUCCESSFUL') {
        setPaymentCompleted(true);
        setPaymentProcessing(false);

        // Update form data
        onChange('paymentStatus', 'SUCCESSFUL');
        onChange('transactionId', verifyResponse.paymentId);

        toast.success('Payment successful!');

        // Auto-proceed to next step after successful payment
        setTimeout(() => {
          onNext();
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error: any) {
      // console.error('Payment verification failed:', error);
      if(error.error === "Payment already verified") {
        setPaymentCompleted(true);
        setPaymentProcessing(false);
        setPaymentTime(error.completedAt);
        onChange('paymentStatus', 'SUCCESSFUL');
        toast.success('Payment already verified');
      } else {
        setPaymentProcessing(false);
        setPaymentFailed(true);
        toast.error(error?.message || 'Payment verification failed. Please try again.');
      }
    }
  };

  const handleRetryPayment = () => {
    setPaymentFailed(false);
  };

  const feeBreakdown = [
    { label: 'Application Fee', amount: 500.0 },
    { label: 'Processing Fee', amount: 50.0 },
    { label: 'GST (18%)', amount: 99.0 },
  ];

  const totalAmount = feeBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Payment Success Screen
  if (paymentCompleted) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
          Payment Successful!
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.300',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Transaction ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formData.transactionId || paymentData?.paymentId}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Amount Paid
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body2">
                {new Date().toLocaleDateString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {!isExistingForm && (
          <Alert severity="success" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Your payment has been processed successfully. You will be redirected to the final step shortly.
          </Alert>
        )}

        {isExistingForm && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
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

  // Payment Failed Screen
  if (paymentFailed) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <ErrorOutline color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
          Payment Failed
        </Typography>

        <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          Your payment could not be processed. This may be due to insufficient funds, incorrect card details, or a network issue. Please try again.
        </Alert>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.300',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Amount to be paid: <strong>₹{totalAmount.toFixed(2)}</strong>
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={onPrevious}>
            Previous
          </Button>
          <Button variant="contained" onClick={handleRetryPayment}>
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Payment Processing Screen
  if (paymentProcessing) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Processing Payment...
        </Typography>
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>
          Please do not close this window or press the back button.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Processing payment of ₹{totalAmount.toFixed(2)}
        </Typography>
      </Box>
    );
  }

  // Payment Selection Screen
  return (
    <Box>
      {/* Fee Summary */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.300' }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Fee Summary
        </Typography>

        <Grid container spacing={2}>
          {feeBreakdown.map((item, index) => (
            <React.Fragment key={index}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2">{item.label}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">₹{item.amount.toFixed(2)}</Typography>
              </Grid>
            </React.Fragment>
          ))}

          <Grid size={{ xs: 6 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total Amount
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
        >
          Pay ₹{totalAmount.toFixed(2)}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentSection;
