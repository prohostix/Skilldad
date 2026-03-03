# Implementation Plan: Razorpay Payment Migration

## Overview

This implementation plan covers the complete migration from Stripe to Razorpay payment gateway in the SKILLDAD application. The migration involves removing all Stripe dependencies, implementing Razorpay order creation and verification, updating frontend checkout integration, and ensuring secure backend validation with webhook handling. The implementation follows a modular architecture with the RazorpayGatewayService as the core payment service, maintaining all existing payment functionality while supporting INR currency with multiple payment methods (UPI, Cards, Netbanking, Wallets).

## Tasks

- [x] 1. Set up Razorpay configuration and environment
  - Add Razorpay credentials to `.env` file (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
  - Update `server/.env.example` with Razorpay environment variables
  - Install `razorpay` npm package in server directory
  - Remove Stripe environment variables from documentation
  - _Requirements: Secure configuration management, environment-based credentials_

- [x] 2. Implement RazorpayGatewayService
  - [x] 2.1 Create RazorpayGatewayService class
    - Create `server/services/payment/RazorpayGatewayService.js`
    - Initialize Razorpay instance with key_id and key_secret
    - Implement constructor with config validation
    - Add error handling for missing credentials
    - _Requirements: Modular service architecture, secure credential handling_
  
  - [x] 2.2 Implement createOrder method
    - Accept amount (in paise), currency (INR), receipt, notes
    - Call Razorpay Orders API to create order
    - Return order_id, amount, currency, receipt
    - Handle API errors with proper error messages
    - Add logging for order creation
    - _Requirements: Order creation API, INR currency support, receipt generation_
  
  - [x] 2.3 Implement verifyPaymentSignature method
    - Accept order_id, payment_id, signature from webhook/callback
    - Generate expected signature using HMAC SHA256
    - Compare expected signature with received signature using crypto.timingSafeEqual
    - Return boolean verification result
    - Add security logging for verification attempts
    - _Requirements: Signature validation, HMAC SHA256, secure comparison_
  
  - [x] 2.4 Implement fetchPaymentDetails method
    - Accept payment_id as parameter
    - Call Razorpay Payments API to fetch payment details
    - Return payment status, method, amount, order_id
    - Handle API errors gracefully
    - _Requirements: Payment status checking, API integration_
  
  - [ ]* 2.5 Write unit tests for RazorpayGatewayService
    - Test createOrder with valid and invalid inputs
    - Test verifyPaymentSignature with correct and incorrect signatures
    - Test fetchPaymentDetails with valid payment_id
    - Mock Razorpay API calls
    - Test error handling scenarios
    - _Requirements: Service reliability, error handling validation_

- [x] 3. Update payment controller for Razorpay
  - [x] 3.1 Replace StripeGatewayService with RazorpayGatewayService
    - Update imports in `server/controllers/paymentController.js`
    - Replace getStripeService() with getRazorpayService()
    - Update service initialization with Razorpay config
    - _Requirements: Service layer replacement, backward compatibility_
  
  - [x] 3.2 Update initiatePayment endpoint
    - Remove Stripe PaymentIntent creation logic
    - Implement Razorpay order creation using RazorpayGatewayService
    - Return order_id, key_id (publishable key), amount, currency
    - Update transaction record with razorpay_order_id
    - Maintain existing GST calculation and validation logic
    - _Requirements: Order creation flow, transaction tracking_
  
  - [x] 3.3 Implement handleCallback endpoint for Razorpay
    - Accept razorpay_order_id, razorpay_payment_id, razorpay_signature
    - Verify payment signature using RazorpayGatewayService
    - Update transaction status to 'completed' on success
    - Unlock course enrollment on successful payment
    - Handle verification failures with proper error responses
    - Add security logging for all callback attempts
    - _Requirements: Payment verification, course unlocking, security logging_
  
  - [x] 3.4 Update handleWebhook endpoint for Razorpay
    - Verify webhook signature using Razorpay webhook secret
    - Handle 'payment.captured' event
    - Handle 'payment.failed' event
    - Update transaction status based on webhook event
    - Implement idempotency to prevent duplicate processing
    - Add comprehensive logging for webhook events
    - _Requirements: Webhook handling, signature verification, idempotency_
  
  - [ ]* 3.5 Write integration tests for payment controller
    - Test initiatePayment with valid course and user
    - Test handleCallback with valid signature
    - Test handleCallback with invalid signature
    - Test handleWebhook with payment.captured event
    - Test handleWebhook with payment.failed event
    - _Requirements: End-to-end payment flow validation_

- [x] 4. Checkpoint - Ensure backend tests pass
  - Run all payment controller tests
  - Verify RazorpayGatewayService integration
  - Check error handling and logging
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Update frontend payment integration
  - [-] 5.1 Remove Stripe dependencies from client
    - Uninstall `@stripe/stripe-js` and `@stripe/react-stripe-js` packages
    - Remove Stripe imports from `client/src/pages/student/PaymentInitiation.jsx`
    - Remove StripePaymentForm component file
    - _Requirements: Clean dependency removal_
  
  - [ ] 5.2 Install and configure Razorpay checkout
    - Add Razorpay checkout script to `client/index.html` or load dynamically
    - Create utility function to load Razorpay script
    - _Requirements: Razorpay SDK integration_
  
  - [ ] 5.3 Update PaymentInitiation component
    - Remove Stripe Elements and stripePromise state
    - Update initiatePayment API call to handle Razorpay response
    - Implement Razorpay checkout modal initialization
    - Configure Razorpay options (key, amount, currency, order_id, name, description)
    - Add payment success handler to call backend callback endpoint
    - Add payment failure handler with user feedback
    - Update UI text from "Stripe" to "Razorpay" or generic "Secure Payment"
    - _Requirements: Razorpay checkout integration, payment flow handling_
  
  - [ ] 5.4 Create RazorpayCheckout component
    - Create `client/src/components/payment/RazorpayCheckout.jsx`
    - Implement Razorpay checkout initialization
    - Handle payment success callback
    - Handle payment failure callback
    - Add loading states and error handling
    - Implement modal close handling
    - _Requirements: Modular checkout component, user experience_
  
  - [ ]* 5.5 Write frontend tests for payment flow
    - Test PaymentInitiation component rendering
    - Test Razorpay checkout initialization
    - Test payment success flow
    - Test payment failure flow
    - Mock Razorpay API calls
    - _Requirements: Frontend reliability, user flow validation_

- [ ] 6. Update transaction model and database
  - [ ] 6.1 Add Razorpay fields to transaction schema
    - Add `razorpay_order_id` field to transaction model
    - Add `razorpay_payment_id` field to transaction model
    - Add `razorpay_signature` field to transaction model
    - Remove or deprecate Stripe-specific fields (stripe_payment_intent_id, stripe_client_secret)
    - Update indexes if necessary
    - _Requirements: Data model updates, backward compatibility_
  
  - [ ] 6.2 Create database migration script
    - Create migration to add Razorpay fields
    - Create migration to remove Stripe fields (optional, can be deprecated)
    - Test migration on development database
    - _Requirements: Database schema evolution, data integrity_

- [ ] 7. Update payment routes and middleware
  - [ ] 7.1 Update payment routes
    - Review `server/routes/paymentRoutes.js` for any Stripe-specific routes
    - Ensure callback route accepts Razorpay parameters
    - Ensure webhook route is configured for Razorpay
    - Update route documentation/comments
    - _Requirements: API endpoint compatibility_
  
  - [ ] 7.2 Update webhook endpoint configuration
    - Configure webhook URL in Razorpay dashboard (manual step, document in code comments)
    - Add webhook signature verification middleware
    - Test webhook endpoint with Razorpay test events
    - _Requirements: Webhook security, event handling_

- [ ] 8. Remove Stripe code and dependencies
  - [ ] 8.1 Remove Stripe service file
    - Delete `server/services/payment/StripeGatewayService.js`
    - Remove any Stripe utility functions
    - _Requirements: Code cleanup_
  
  - [ ] 8.2 Remove Stripe dependencies from package.json
    - Remove `stripe` package from `server/package.json`
    - Remove `@stripe/stripe-js` from `client/package.json`
    - Remove `@stripe/react-stripe-js` from `client/package.json`
    - Run `npm install` in both directories to update lock files
    - _Requirements: Dependency cleanup_
  
  - [ ] 8.3 Remove Stripe environment variables
    - Remove STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET from `.env`
    - Update environment documentation
    - _Requirements: Configuration cleanup_
  
  - [ ] 8.4 Update payment-related documentation
    - Update any README or documentation files mentioning Stripe
    - Add Razorpay setup instructions
    - Document Razorpay webhook configuration
    - Document supported payment methods (UPI, Cards, Netbanking, Wallets)
    - _Requirements: Documentation accuracy_

- [ ] 9. Testing and validation
  - [ ]* 9.1 Test payment initiation flow
    - Test order creation with valid course
    - Test order creation with invalid course
    - Verify transaction record creation
    - Verify order_id and key_id returned correctly
    - _Requirements: Order creation validation_
  
  - [ ]* 9.2 Test payment completion flow
    - Test successful payment with valid signature
    - Test payment with invalid signature
    - Verify course unlocking after successful payment
    - Verify transaction status updates
    - Verify enrollment record creation
    - _Requirements: Payment verification, course access_
  
  - [ ]* 9.3 Test webhook handling
    - Send test webhook events from Razorpay dashboard
    - Verify payment.captured event handling
    - Verify payment.failed event handling
    - Test webhook signature verification
    - Test idempotency (duplicate webhook events)
    - _Requirements: Webhook reliability, event processing_
  
  - [ ]* 9.4 Test error scenarios
    - Test payment with insufficient funds
    - Test payment cancellation by user
    - Test network failures during payment
    - Test invalid order_id scenarios
    - Verify error messages and user feedback
    - _Requirements: Error handling, user experience_
  
  - [ ]* 9.5 Test payment methods
    - Test UPI payment flow
    - Test card payment flow
    - Test netbanking payment flow
    - Test wallet payment flow
    - Verify all methods work correctly
    - _Requirements: Payment method support_

- [ ] 10. Final checkpoint and deployment preparation
  - Ensure all tests pass (backend and frontend)
  - Verify no Stripe references remain in codebase
  - Review security logging and monitoring
  - Verify error handling and user feedback
  - Document Razorpay configuration steps for production
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation tasks reference the design document architecture
- Razorpay uses paise (smallest currency unit), so amounts must be multiplied by 100
- Signature verification is critical for security - use crypto.timingSafeEqual for comparison
- Webhook endpoint must be publicly accessible for Razorpay to send events
- Test mode and live mode use different API keys in Razorpay
- Maintain existing GST calculation, discount logic, and transaction management
- Do NOT modify course unlocking logic, enrollment creation, or other application features
- Focus only on payment gateway migration from Stripe to Razorpay
