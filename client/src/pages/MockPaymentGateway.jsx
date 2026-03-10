import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  AccountBalanceWallet,
  QrCode2
} from '@mui/icons-material';

const MockPaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract payment parameters from URL
  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const customerName = searchParams.get('customerName');
  const customerEmail = searchParams.get('customerEmail');
  const customerPhone = searchParams.get('customerPhone');
  const callbackUrl = searchParams.get('callbackUrl');
  const merchantId = searchParams.get('merchantId');
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Mock card details (for visual purposes only)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    // Validate required parameters
    if (!transactionId || !amount || !callbackUrl) {
      setError('Missing required payment parameters');
    }
  }, [transactionId, amount, callbackUrl]);

  const handlePayment = async (status) => {
    setProcessing(true);
    setError('');

    // Simulate processing delay (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate mock gateway transaction ID
    const gatewayTransactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate mock signature
    const mockSignature = `mock_sig_${transactionId}_${status}`;

    // Build callback URL with parameters
    const callbackUrlObj = new URL(callbackUrl, window.location.origin);
    callbackUrlObj.searchParams.set('transactionId', transactionId);
    callbackUrlObj.searchParams.set('status', status);
    callbackUrlObj.searchParams.set('gatewayTransactionId', gatewayTransactionId);
    callbackUrlObj.searchParams.set('signature', mockSignature);
    callbackUrlObj.searchParams.set('amount', amount);
    
    if (status === 'failed') {
      callbackUrlObj.searchParams.set('errorCode', 'MOCK_ERROR_001');
      callbackUrlObj.searchParams.set('errorMessage', 'Payment declined by mock gateway');
    }

    // Redirect to callback URL
    window.location.href = callbackUrlObj.toString();
  };

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#1976d2', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold">
            HDFC SmartGateway
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Secure Payment Gateway (TEST MODE)
          </Typography>
        </Paper>

        {/* Transaction Details */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Transaction Details
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Transaction ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {transactionId}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Merchant ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {merchantId || 'TEST_MERCHANT'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Customer Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {customerName || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {customerEmail || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {customerPhone || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Amount to Pay
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatAmount(amount)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Payment Method Selection */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Select Payment Method
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      border: paymentMethod === 'card' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CardContent>
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCard />
                            <Typography>Credit/Debit Card</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: paymentMethod === 'upi' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <CardContent>
                      <FormControlLabel
                        value="upi"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QrCode2 />
                            <Typography>UPI</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: paymentMethod === 'netbanking' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <CardContent>
                      <FormControlLabel
                        value="netbanking"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance />
                            <Typography>Net Banking</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: paymentMethod === 'wallet' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <CardContent>
                      <FormControlLabel
                        value="wallet"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceWallet />
                            <Typography>Wallet</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Card Details Form (shown only for card payment) */}
        {paymentMethod === 'card' && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Card Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16)))}
                  InputProps={{
                    endAdornment: <CreditCard color="action" />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setExpiryDate(value);
                  }}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  inputProps={{ maxLength: 3 }}
                />
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              This is a mock payment gateway. Card details are for visual purposes only and are not validated or stored.
            </Alert>
          </Paper>
        )}

        {/* Action Buttons */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Simulate Payment Outcome (Test Mode)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={() => handlePayment('success')}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processing ? 'Processing...' : 'Simulate Success'}
            </Button>
            
            <Button
              variant="contained"
              color="error"
              size="large"
              fullWidth
              onClick={() => handlePayment('failed')}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processing ? 'Processing...' : 'Simulate Failure'}
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Click either button to simulate the payment outcome and return to the application
          </Typography>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Secured by HDFC SmartGateway (Mock Test Environment)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
