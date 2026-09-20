# PAYRESCUE NG — Frontend Integration Guide

This guide describes how to connect a modern **React (Vite / Next.js)** frontend application to the PayRescue backend.

---

## 1. Base Configuration

### Environment Variables
In your frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
# In production:
# VITE_API_BASE_URL=https://api.payrescue.ng/api/v1
```

### Axios / Fetch Setup
Authentication uses secure, `httpOnly` cookies. You **must** enable credentials in your HTTP client:

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // REQUIRED: Sends and receives httpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 2. Standard API Response Structure

Every PayRescue endpoint returns a uniform envelope:

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Rescue case opened successfully.",
  "requestId": "req_839df012-3214-4112"
}
```

### Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "claimAmount", "message": "Claim amount must be greater than zero" }
    ]
  },
  "requestId": "req_839df012-3214-4112"
}
```

---

## 3. Core Frontend Flows

### A. Consumer User Registration & Login
```typescript
// 1. Register
const registerResponse = await apiClient.post('/auth/register', {
  email: 'chidi.okafor@example.ng',
  password: 'Password123!',
  firstName: 'Chidi',
  lastName: 'Okafor',
  phone: '08031234567',
});

// 2. Fetch Active Session
const meResponse = await apiClient.get('/auth/me');
const userProfile = meResponse.data.data;
```

### B. Filing a Rescue Case
```typescript
const caseResponse = await apiClient.post('/cases', {
  title: 'Debited ₦15,000 for NIP transfer without beneficiary credit',
  description: 'Transferred funds from GTBank to Access Bank on 20th Sept. Account was debited but recipient has not received value.',
  category: 'DEBITED_NOT_CREDITED',
  claimAmount: 15000,
  currency: 'NGN',
  expectedResolution: 'REVERSAL',
  providerId: 'gtbank-provider-uuid',
  transactionDetails: {
    publicReference: '999001234567890123456789012345',
    transactionType: 'BANK_TRANSFER',
    transactionTimestamp: '2026-09-20T08:30:00Z',
  },
});
const newCase = caseResponse.data.data;
```

### C. Uploading Evidence to Vault
```typescript
const formData = new FormData();
formData.append('caseId', newCase.id);
formData.append('documentType', 'DEBIT_ALERT');
formData.append('file', fileInput.files[0]);

const evidenceResponse = await apiClient.post('/evidence/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### D. Generating Standardized Regulatory Complaint Package
```typescript
const complaintResponse = await apiClient.post(`/complaints/generate/${newCase.id}`);
const { subject, contentBody, structuredSummary } = complaintResponse.data.data;
// Present formatted complaint to user for 1-click copying or email dispatch
```

### E. Multi-Tenant Merchant Reconciliation (CSV Upload)
```typescript
const csvFormData = new FormData();
csvFormData.append('file', settlementCsvFile);

const reconResponse = await apiClient.post(`/reconciliation/${businessId}/csv`, csvFormData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
const { summary, job } = reconResponse.data.data;
// Renders reconciliation rate (e.g. 98.4%), matched lines, and discrepancy warnings
```

---

## 4. TypeScript Contracts Import
All TypeScript interfaces and endpoint mappings can be imported directly into the frontend from:
`src/contracts/payrescue-api-client.ts`
