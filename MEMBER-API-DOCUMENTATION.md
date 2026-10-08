# Member Management API Documentation

Complete documentation for Member Registration and Management System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Member Model Schema](#member-model-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Authorization](#authentication--authorization)
5. [Request & Response Examples](#request--response-examples)
6. [Validation Rules](#validation-rules)
7. [Error Handling](#error-handling)

---

## Overview

The Member Management System allows:
- **Users**: Register, Login, and View their own profile
- **Admins**: Full CRUD operations, status management, and analytics

---

## Member Model Schema

### Required Fields
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `fullName` | String | Member's full name | ✅ Yes |
| `phoneNumber` | String | Unique phone number | ✅ Yes |
| `memberCategory` | String | Gold/Silver/Platinum/Basic/Premium | ✅ Yes |
| `state` | String | State name | ✅ Yes |
| `city` | String | City name | ✅ Yes |
| `pincode` | String | PIN code | ✅ Yes |
| `idProof.idName` | String | ID type (Aadhaar/PAN/etc) | ✅ Yes |
| `idProof.idImage` | String | ID proof image URL | ✅ Yes |

### Optional Fields
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `companyName` | String | Company name | - |
| `whatsappNo` | String | WhatsApp number | - |
| `profilePhoto` | String | Profile photo URL | - |
| `country` | String | Country | "India" |
| `referrer.name` | String | Referrer's name | - |
| `referrer.mobileNo` | String | Referrer's mobile | - |
| `upiId` | String | UPI ID for payments | - |
| `isChecked` | Boolean | Verification checkbox | false |
| `status` | String | pending/active/inactive/suspended | "pending" |
| `memberId` | String | Auto-generated unique ID | Auto |
| `registrationDate` | Date | Registration timestamp | Auto |

### Member Categories
- `Gold`
- `Silver`
- `Platinum`
- `Basic`
- `Premium`

### Status Values
- `pending` - New registration awaiting approval
- `active` - Approved and active member
- `inactive` - Temporarily inactive
- `suspended` - Account suspended

### ID Proof Types
- `Aadhaar`
- `PAN`
- `Voter ID`
- `Driving License`
- `Passport`

---

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register Member
```http
POST /api/member/register
```

**Body:**
```json
{
  "fullName": "Rajesh Kumar",
  "companyName": "Tech Solutions Pvt Ltd",
  "whatsappNo": "9876543210",
  "phoneNumber": "9876543210",
  "memberCategory": "Gold",
  "profilePhoto": "https://cloudinary.com/.../photo.jpg",
  "country": "India",
  "state": "Delhi",
  "city": "New Delhi",
  "pincode": "110001",
  "referrer": {
    "name": "Amit Sharma",
    "mobileNo": "9123456789"
  },
  "idProof": {
    "idName": "Aadhaar",
    "idImage": "https://cloudinary.com/.../aadhaar.jpg"
  },
  "upiId": "rajesh@paytm",
  "isChecked": true
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "memberId": "MEM000001",
    "status": "pending",
    "fullName": "Rajesh Kumar",
    "phoneNumber": "9876543210",
    "memberCategory": "Gold"
  },
  "message": "Member registered successfully",
  "success": true
}
```

---

#### 2. Login Member
```http
POST /api/member/login
```

**Option A: Login with Phone Number**
```json
{
  "phoneNumber": "9876543210"
}
```

**Option B: Login with Member ID**
```json
{
  "memberId": "MEM000001"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "memberId": "MEM000001",
    "fullName": "Rajesh Kumar",
    "phoneNumber": "9876543210",
    "memberCategory": "Gold",
    "status": "active",
    "profilePhoto": "https://cloudinary.com/.../photo.jpg",
    "city": "New Delhi",
    "state": "Delhi"
  },
  "message": "Login successful",
  "success": true
}
```

---

#### 3. Get Member Details
```http
GET /api/member/details?phoneNumber=9876543210
GET /api/member/details?memberId=MEM000001
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "memberId": "MEM000001",
    "fullName": "Rajesh Kumar",
    "companyName": "Tech Solutions Pvt Ltd",
    "phoneNumber": "9876543210",
    "whatsappNo": "9876543210",
    "memberCategory": "Gold",
    "profilePhoto": "https://cloudinary.com/.../photo.jpg",
    "country": "India",
    "state": "Delhi",
    "city": "New Delhi",
    "pincode": "110001",
    "referrer": {
      "name": "Amit Sharma",
      "mobileNo": "9123456789"
    },
    "idProof": {
      "idName": "Aadhaar",
      "idImage": "https://cloudinary.com/.../aadhaar.jpg"
    },
    "upiId": "rajesh@paytm",
    "isChecked": true,
    "status": "active",
    "registrationDate": "2026-10-07T10:30:00.000Z"
  },
  "message": "Member details fetched successfully",
  "success": true
}
```

---

#### 4. Get Member by ID
```http
GET /api/member/:id
```

**Response:** Same as Get Member Details

---

### Admin Endpoints (Authentication Required)

#### 5. Get All Members
```http
GET /api/member/all/members
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number | `1` |
| `limit` | Number | Items per page | `10` |
| `search` | String | Search in name/phone/city/memberId | `Rajesh` |
| `status` | String | Filter by status | `active` |
| `memberCategory` | String | Filter by category | `Gold` |
| `sortBy` | String | Sort field (- for desc) | `-createdAt` |

**Example:**
```http
GET /api/member/all/members?page=1&limit=10&status=active&memberCategory=Gold&sortBy=-createdAt
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "members": [
      {
        "memberId": "MEM000001",
        "fullName": "Rajesh Kumar",
        "phoneNumber": "9876543210",
        "memberCategory": "Gold",
        "status": "active",
        "city": "New Delhi",
        "state": "Delhi"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  },
  "message": "Members fetched successfully",
  "success": true
}
```

---

#### 6. Get Member Statistics
```http
GET /api/member/stats/all
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalMembers": 150,
    "activeMembers": 120,
    "pendingMembers": 20,
    "suspendedMembers": 10,
    "categoryStats": [
      {
        "_id": "Gold",
        "count": 50
      },
      {
        "_id": "Silver",
        "count": 60
      },
      {
        "_id": "Platinum",
        "count": 40
      }
    ],
    "topStates": [
      {
        "_id": "Delhi",
        "count": 30
      },
      {
        "_id": "Maharashtra",
        "count": 25
      }
    ]
  },
  "message": "Member statistics fetched successfully",
  "success": true
}
```

---

#### 7. Update Member
```http
PUT /api/member/:id
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "fullName": "Rajesh Kumar Updated",
  "memberCategory": "Platinum",
  "city": "Mumbai",
  "state": "Maharashtra",
  "status": "active"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    // Updated member object
  },
  "message": "Member updated successfully",
  "success": true
}
```

---

#### 8. Update Member Status
```http
PATCH /api/member/:id/status
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "status": "active"
}
```

**Valid Status Values:**
- `pending`
- `active`
- `inactive`
- `suspended`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "memberId": "MEM000001",
    "status": "active"
  },
  "message": "Member status updated successfully",
  "success": true
}
```

---

#### 9. Delete Member
```http
DELETE /api/member/:id
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Member deleted successfully",
  "success": true
}
```

---

## Authentication & Authorization

### User Access (Public)
✅ Register Member  
✅ Login Member  
✅ Get Member Details (Own data)  
✅ Get Member by ID (Own data)  

### Admin Access (Protected)
🔒 Get All Members  
🔒 Get Member Statistics  
🔒 Update Member  
🔒 Update Member Status  
🔒 Delete Member  

**Admin endpoints require:**
1. Valid JWT token in Authorization header
2. User role must be "Admin"

**Header:**
```
Authorization: Bearer {jwt_token}
```

---

## Validation Rules

### Phone Number
- ✅ Required
- ✅ Must be unique
- ✅ Cannot be updated to an existing number

### Member ID
- ✅ Auto-generated (MEM000001, MEM000002, etc.)
- ✅ Unique
- ✅ Cannot be manually set

### Member Category
- ✅ Required
- ✅ Must be one of: Gold, Silver, Platinum, Basic, Premium

### ID Proof
- ✅ Both idName and idImage required
- ✅ idName must be one of: Aadhaar, PAN, Voter ID, Driving License, Passport

### Status
- ✅ Default: "pending"
- ✅ Must be one of: pending, active, inactive, suspended

---

## Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Phone number already registered",
  "success": false
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized access",
  "success": false
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Your account has been suspended",
  "success": false
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Member not found",
  "success": false
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "success": false
}
```

---

## Complete Workflow Examples

### User Registration Flow
```
1. User fills registration form
2. Upload profile photo → GET image URL
3. Upload ID proof → GET image URL
4. POST /api/member/register with all details
5. Receive memberId and status in response
6. Status will be "pending" by default
7. Admin approves → Status changes to "active"
```

### User Login Flow
```
1. User enters phone number or memberId
2. POST /api/member/login
3. Check status in response
4. If status is "suspended" → Show error
5. If status is "active" → Allow access
6. Store memberId for future use
```

### Admin Approval Flow
```
1. Admin logs in to system
2. GET /api/member/all/members?status=pending
3. Review pending members
4. PATCH /api/member/:id/status with status: "active"
5. Member can now login successfully
```

### Member Search Flow
```
1. Admin searches by name/phone/city
2. GET /api/member/all/members?search=Rajesh&page=1&limit=10
3. Results filtered by search term
4. Click on member to view details
5. PUT /api/member/:id to update if needed
```

---

## Best Practices

1. **Phone Number Validation**: Validate phone number format before registration
2. **Image Upload**: Upload images to Cloudinary first, then use URLs in registration
3. **Unique Check**: Always check if phone number exists before registration
4. **Status Management**: Only admins should change member status
5. **Pagination**: Use pagination for large member lists
6. **Search**: Implement search for better user experience
7. **Referrer**: Store referrer details for tracking member sources

---

## Testing Checklist

### User Operations
- [ ] Register new member
- [ ] Login with phone number
- [ ] Login with member ID
- [ ] Get own profile details
- [ ] Handle duplicate phone number error
- [ ] Handle suspended account error

### Admin Operations
- [ ] Get all members with pagination
- [ ] Search members by name/phone
- [ ] Filter by status
- [ ] Filter by category
- [ ] Get member statistics
- [ ] Update member details
- [ ] Change member status
- [ ] Delete member
- [ ] Handle unauthorized access

---

**Last Updated:** October 2026  
**Version:** 1.0.0  
**Base URL:** `http://localhost:5001/api/member`
