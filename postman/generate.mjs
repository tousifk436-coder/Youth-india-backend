import { writeFileSync } from "fs";

const BASE = "{{baseUrl}}";

// ─── helpers ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const req = (name, method, path, body = null, queryParams = [], auth = true, description = "") => ({
  name,
  request: {
    method,
    header: [
      { key: "Content-Type", value: "application/json" },
      ...(auth ? [{ key: "Authorization", value: "Bearer {{authToken}}" }] : []),
    ],
    url: {
      raw: `${BASE}${path}${queryParams.length ? "?" + queryParams.map(q => `${q.key}=${q.value}`).join("&") : ""}`,
      host: ["{{baseUrl}}"],
      path: path.replace(/^\//, "").split("/"),
      ...(queryParams.length ? {
        query: queryParams.map(q => ({ key: q.key, value: q.value, description: q.description || "" }))
      } : {}),
    },
    ...(body ? { body: { mode: "raw", raw: JSON.stringify(body, null, 2), options: { raw: { language: "json" } } } } : {}),
    description,
  },
  response: [],
});

const folder = (name, items, description = "") => ({
  name,
  description,
  item: items,
});

// ─── pagination query params ─────────────────────────────────────────────────
const paginationParams = [
  { key: "page", value: "1", description: "Page number" },
  { key: "limit", value: "10", description: "Items per page" },
  { key: "search", value: "", description: "Search keyword" },
  { key: "sortBy", value: "recent", description: "recent | oldest" },
  { key: "isPagination", value: "true", description: "true | false" },
];

// ─── COLLECTION ──────────────────────────────────────────────────────────────
const collection = {
  info: {
    _postman_id: uid(),
    name: "AWSM ERP API",
    description: "Complete API collection for AWSM ERP Admin Panel.\n\n**Setup:**\n1. Set `baseUrl` variable → `http://localhost:9000`\n2. Login via `Auth > Login with Password`\n3. Copy `authToken` from response → set as collection variable\n4. All protected routes will auto-use the token.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:9000", type: "string" },
    { key: "authToken", value: "", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "memberId", value: "", type: "string" },
    { key: "paymentEntryId", value: "", type: "string" },
    { key: "transactionId", value: "", type: "string" },
    { key: "tenureYearId", value: "", type: "string" },
    { key: "designationId", value: "", type: "string" },
    { key: "bankId", value: "", type: "string" },
    { key: "collectedById", value: "", type: "string" },
    { key: "modeOfPaymentId", value: "", type: "string" },
    { key: "categoryId", value: "", type: "string" },
    { key: "sourceId", value: "", type: "string" },
    { key: "ledgerId", value: "", type: "string" },
    { key: "executiveMemberId", value: "", type: "string" },
    { key: "localSecretaryId", value: "", type: "string" },
    { key: "officeBearerId", value: "", type: "string" },
    { key: "communicationId", value: "", type: "string" },
    { key: "messageId", value: "", type: "string" },
  ],
  item: [

    // ═══════════════════════════════════════════════════════════════════════
    // 🔐 AUTH
    // ═══════════════════════════════════════════════════════════════════════
    folder("🔐 Auth", [
      req("Health Check", "GET", "/api/health", null, [], false),
      req("Register User", "POST", "/api/auth/registerUser", {
        name: "Admin User",
        userId: "admin001",
        phone: "9999999999",
        password: "Admin@123",
        email: "admin@awsm.com",
        gender: "Male",
        role: "Admin",
      }, [], false),
      req("Register Or Login (OTP)", "POST", "/api/auth/registerOrLogin", {
        phone: "9999999999",
        userId: "admin001",
        password: "Admin@123",
        name: "Admin User",
        gender: "Male",
        role: "Admin",
      }, [], false),
      req("Login with Password", "POST", "/api/auth/loginWithPassword", {
        userId: "admin001",
        password: "Admin@123",
      }, [], false, "Copy authToken from response and set as collection variable"),
      req("Verify OTP", "POST", "/api/auth/verifyOtp", { phone: "9999999999", otp: "1234" }, [], false),
      req("Send OTP", "POST", "/api/auth/sendOtp", { phone: "9999999999" }, [], false),
      req("Resend OTP", "POST", "/api/auth/resendOtp", { phone: "9999999999" }, [], false),
      req("Get Profile", "GET", "/api/auth/profile"),
      req("Get All Users", "GET", "/api/auth/getAllUsers", null, [
        ...paginationParams,
        { key: "role", value: "", description: "User | Admin | SuperAdmin" },
      ]),
      req("Get User By ID", "GET", "/api/auth/user/{{userId}}"),
      req("Update User", "PATCH", "/api/auth/update/{{userId}}", {
        name: "Updated Name",
        email: "updated@awsm.com",
      }),
      req("Update User Role", "PUT", "/api/auth/updateRoll/{{userId}}", { role: "Admin" }),
      req("Create Password", "POST", "/api/auth/createPassword", {
        userId: "admin001",
        password: "NewPass@123",
      }, [], false),
      req("Update Password", "POST", "/api/auth/updatePassword", {
        userId: "admin001",
        oldPassword: "Admin@123",
        newPassword: "NewPass@123",
      }),
      req("Delete User", "DELETE", "/api/auth/delete/{{userId}}"),
    ], "Authentication & User Management"),

    // ═══════════════════════════════════════════════════════════════════════
    // 📁 UPLOAD
    // ═══════════════════════════════════════════════════════════════════════
    folder("📁 Upload", [
      {
        name: "Upload Image",
        request: {
          method: "POST",
          header: [{ key: "Authorization", value: "Bearer {{authToken}}" }],
          body: {
            mode: "formdata",
            formdata: [{ key: "file", type: "file", src: "", description: "Select image file" }],
          },
          url: {
            raw: `${BASE}/api/upload/uploadImage`,
            host: ["{{baseUrl}}"],
            path: ["api", "upload", "uploadImage"],
          },
          description: "Upload image to Cloudinary. Returns image URL.",
        },
        response: [],
      },
    ], "File Upload via Cloudinary"),

    // ═══════════════════════════════════════════════════════════════════════
    // 🗂️ MASTERS
    // ═══════════════════════════════════════════════════════════════════════
    folder("🗂️ Masters", [

      // ── Designation ──────────────────────────────────────────────────────
      folder("Designation", [
        req("Get All Designations", "GET", "/api/designation", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Designation By ID", "GET", "/api/designation/{{designationId}}"),
        req("Create Designation", "POST", "/api/designation", {
          name: "President",
          order: 1,
          isActive: true,
        }),
        req("Update Designation", "PUT", "/api/designation/{{designationId}}", {
          name: "Vice President",
          order: 2,
          isActive: true,
        }),
        req("Delete Designation", "DELETE", "/api/designation/{{designationId}}"),
        req("Migrate Designation Order", "PUT", "/api/designation/migrate-order", {
          designations: [{ id: "{{designationId}}", order: 1 }],
        }),
      ]),

      // ── Bank Master ───────────────────────────────────────────────────────
      folder("Bank Master", [
        req("Get All Banks", "GET", "/api/bank", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Bank By ID", "GET", "/api/bank/{{bankId}}"),
        req("Create Bank", "POST", "/api/bank", {
          name: "State Bank of India (SBI)",
          ifscNumber: "SBIN0001234",
          accountNumber: "1234567890",
          branchAddress: "Main Branch, Connaught Place, New Delhi",
          order: 1,
          isActive: true,
        }),
        req("Update Bank", "PUT", "/api/bank/{{bankId}}", {
          name: "HDFC Bank",
          ifscNumber: "HDFC0001234",
          accountNumber: "9876543210",
          branchAddress: "Sector 18, Noida, U.P",
          order: 2,
          isActive: true,
        }),
        req("Delete Bank", "DELETE", "/api/bank/{{bankId}}"),
        req("Migrate Bank Order", "PUT", "/api/bank/migrate-order", {
          banks: [{ id: "{{bankId}}", order: 1 }],
        }),
      ]),

      // ── Tenure Year ───────────────────────────────────────────────────────
      folder("Tenure Year", [
        req("Get All Tenure Years", "GET", "/api/tenure-year", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Tenure Year By ID", "GET", "/api/tenure-year/{{tenureYearId}}"),
        req("Create Tenure Year", "POST", "/api/tenure-year", {
          name: "2025-2026",
          order: 1,
          isActive: true,
        }),
        req("Update Tenure Year", "PUT", "/api/tenure-year/{{tenureYearId}}", {
          name: "2026-2027",
          order: 2,
          isActive: true,
        }),
        req("Delete Tenure Year", "DELETE", "/api/tenure-year/{{tenureYearId}}"),
        req("Migrate Tenure Year Order", "PUT", "/api/tenure-year/migrate-order", {
          tenureYears: [{ id: "{{tenureYearId}}", order: 1 }],
        }),
      ]),

      // ── Collected By ──────────────────────────────────────────────────────
      folder("Collected By", [
        req("Get All Collected By", "GET", "/api/collected-by", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Collected By ID", "GET", "/api/collected-by/{{collectedById}}"),
        req("Create Collected By", "POST", "/api/collected-by", {
          name: "Ahmad Siddiqui",
          order: 1,
          isActive: true,
        }),
        req("Update Collected By", "PUT", "/api/collected-by/{{collectedById}}", {
          name: "Ahmad Siddiqui Updated",
          order: 2,
          isActive: true,
        }),
        req("Delete Collected By", "DELETE", "/api/collected-by/{{collectedById}}"),
        req("Migrate Collected By Order", "PUT", "/api/collected-by/migrate-order", {
          collectedBy: [{ id: "{{collectedById}}", order: 1 }],
        }),
      ]),

      // ── Mode of Payment ───────────────────────────────────────────────────
      folder("Mode of Payment", [
        req("Get All Modes", "GET", "/api/mode-of-payment", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Mode By ID", "GET", "/api/mode-of-payment/{{modeOfPaymentId}}"),
        req("Create Mode", "POST", "/api/mode-of-payment", {
          name: "Cash",
          order: 1,
          isActive: true,
        }),
        req("Update Mode", "PUT", "/api/mode-of-payment/{{modeOfPaymentId}}", {
          name: "UPI",
          order: 2,
          isActive: true,
        }),
        req("Delete Mode", "DELETE", "/api/mode-of-payment/{{modeOfPaymentId}}"),
        req("Migrate Mode of Payment Order", "PUT", "/api/mode-of-payment/migrate-order", {
          modeOfPayments: [{ id: "{{modeOfPaymentId}}", order: 1 }],
        }),
      ]),

      // ── Category ──────────────────────────────────────────────────────────
      folder("Category", [
        req("Get All Categories", "GET", "/api/category", null, [
          ...paginationParams,
          { key: "isActive", value: "", description: "true | false" },
        ]),
        req("Get Category By ID", "GET", "/api/category/{{categoryId}}"),
        req("Create Category", "POST", "/api/category", {
          name: "General",
          image: "",
          isActive: true,
        }),
        req("Update Category", "PUT", "/api/category/{{categoryId}}", {
          name: "General Updated",
          isActive: true,
        }),
        req("Delete Category", "DELETE", "/api/category/{{categoryId}}"),
      ]),

      // ── Source ────────────────────────────────────────────────────────────
      folder("Source", [
        req("Get All Sources", "GET", "/api/source", null, [
          ...paginationParams,
          { key: "status", value: "", description: "true | false" },
        ]),
        req("Get Source By ID", "GET", "/api/source/{{sourceId}}"),
        req("Create Source", "POST", "/api/source", {
          title: "Online",
          value: "online",
          status: true,
        }),
        req("Update Source", "PUT", "/api/source/{{sourceId}}", {
          title: "Offline",
          value: "offline",
          status: true,
        }),
        req("Delete Source", "DELETE", "/api/source/{{sourceId}}"),
      ]),

    ], "All master/lookup data"),

    // ═══════════════════════════════════════════════════════════════════════
    // 👥 MEMBERSHIP
    // ═══════════════════════════════════════════════════════════════════════
    folder("👥 Membership", [
      req("Get Member Stats", "GET", "/api/membership/stats"),
      req("Get All Members", "GET", "/api/membership", null, [
        ...paginationParams,
        { key: "status", value: "", description: "active | inactive | pending" },
        { key: "memberType", value: "", description: "Annual | Semi-Annual | Associate | Honorary | Life" },
        { key: "gender", value: "", description: "male | female | other" },
      ]),
      req("Get Member By ID", "GET", "/api/membership/{{memberId}}"),
      req("Create Member", "POST", "/api/membership", {
        memberId: "MBR-001",
        name: "Muhammad Irfan",
        email: "irfan@example.com",
        phone: "9876543210",
        address: "House 12, Block A, New Delhi",
        memberType: "Annual",
        fee: 2500,
        joinDate: "2025-01-15",
        status: "active",
        gender: "male",
      }),
      req("Update Member", "PUT", "/api/membership/{{memberId}}", {
        name: "Muhammad Irfan Updated",
        status: "active",
        fee: 3000,
      }),
      req("Delete Member", "DELETE", "/api/membership/{{memberId}}"),
    ], "Membership management"),

    // ═══════════════════════════════════════════════════════════════════════
    // 💰 COLLECTION
    // ═══════════════════════════════════════════════════════════════════════
    folder("💰 Collection", [

      folder("Payment Entry", [
        req("Get Payment Stats", "GET", "/api/payment-entry/stats", null, [
          { key: "tenureYear", value: "{{tenureYearId}}", description: "Filter by tenure year ID" },
        ]),
        req("Get All Payment Entries", "GET", "/api/payment-entry", null, [
          ...paginationParams,
          { key: "status", value: "", description: "pending | completed | failed | cancelled" },
          { key: "tenureYear", value: "", description: "Tenure year ObjectId" },
          { key: "modeOfPayment", value: "", description: "Mode of payment ObjectId" },
          { key: "startDate", value: "", description: "YYYY-MM-DD" },
          { key: "endDate", value: "", description: "YYYY-MM-DD" },
        ]),
        req("Get Payment Entry By ID", "GET", "/api/payment-entry/{{paymentEntryId}}"),
        req("Create Payment Entry", "POST", "/api/payment-entry", {
          member: "{{memberId}}",
          amount: 2500,
          paymentDate: "2025-05-11",
          modeOfPayment: "{{modeOfPaymentId}}",
          bank: "{{bankId}}",
          collectedBy: "{{collectedById}}",
          tenureYear: "{{tenureYearId}}",
          chequeNo: "",
          chequeDate: null,
          remarks: "Annual membership fee",
          status: "completed",
        }, [], true, "Auto-creates a Transaction record. Auto-generates receiptNo."),
        req("Update Payment Entry", "PUT", "/api/payment-entry/{{paymentEntryId}}", {
          amount: 2500,
          status: "completed",
          remarks: "Updated remarks",
        }),
        req("Delete Payment Entry", "DELETE", "/api/payment-entry/{{paymentEntryId}}"),
      ]),

      folder("Transactions", [
        req("Get Transaction Summary", "GET", "/api/transaction/summary", null, [
          { key: "tenureYear", value: "{{tenureYearId}}", description: "Filter by tenure year ID" },
        ]),
        req("Get All Transactions", "GET", "/api/transaction", null, [
          ...paginationParams,
          { key: "type", value: "", description: "credit | debit" },
          { key: "status", value: "", description: "pending | completed | failed | cancelled" },
          { key: "tenureYear", value: "", description: "Tenure year ObjectId" },
          { key: "startDate", value: "", description: "YYYY-MM-DD" },
          { key: "endDate", value: "", description: "YYYY-MM-DD" },
        ]),
        req("Get Transaction By ID", "GET", "/api/transaction/{{transactionId}}"),
        req("Create Manual Transaction", "POST", "/api/transaction", {
          member: "{{memberId}}",
          type: "credit",
          amount: 1000,
          modeOfPayment: "{{modeOfPaymentId}}",
          tenureYear: "{{tenureYearId}}",
          description: "Manual credit entry",
          status: "completed",
        }),
        req("Update Transaction", "PUT", "/api/transaction/{{transactionId}}", {
          description: "Updated description",
          status: "completed",
        }),
        req("Delete Transaction", "DELETE", "/api/transaction/{{transactionId}}"),
      ]),

      folder("Ledger of Members", [
        req("Get All Ledger Members", "GET", "/api/ledger/members", null, [
          ...paginationParams,
          { key: "tenureYear", value: "{{tenureYearId}}", description: "Filter by tenure year" },
        ]),
        req("Get Ledger Member By ID", "GET", "/api/ledger/members/{{ledgerId}}"),
        req("Create Ledger Member", "POST", "/api/ledger/members", {
          member: "{{memberId}}",
          tenureYear: "{{tenureYearId}}",
          openingBalance: 0,
        }),
        req("Update Ledger Member", "PUT", "/api/ledger/members/{{ledgerId}}", {
          openingBalance: 500,
          totalCredit: 2500,
          closingBalance: 3000,
        }),
        req("Delete Ledger Member", "DELETE", "/api/ledger/members/{{ledgerId}}"),
      ]),

      folder("Ledger of Wazifadar", [
        req("Get All Ledger Wazifadar", "GET", "/api/ledger/wazifadar", null, [
          ...paginationParams,
          { key: "tenureYear", value: "{{tenureYearId}}", description: "Filter by tenure year" },
        ]),
        req("Get Ledger Wazifadar By ID", "GET", "/api/ledger/wazifadar/{{ledgerId}}"),
        req("Create Ledger Wazifadar", "POST", "/api/ledger/wazifadar", {
          wazifadar: "{{memberId}}",
          tenureYear: "{{tenureYearId}}",
          wazifaAmount: 500,
          openingBalance: 0,
        }),
        req("Update Ledger Wazifadar", "PUT", "/api/ledger/wazifadar/{{ledgerId}}", {
          wazifaAmount: 600,
          totalPaid: 1200,
        }),
        req("Delete Ledger Wazifadar", "DELETE", "/api/ledger/wazifadar/{{ledgerId}}"),
      ]),

    ], "Payment entries, transactions and ledgers"),

    // ═══════════════════════════════════════════════════════════════════════
    // 🏛️ ORGANISATION STRUCTURE
    // ═══════════════════════════════════════════════════════════════════════
    folder("🏛️ Organisation Structure", [

      folder("Executive Members", [
        req("Get All Executive Members", "GET", "/api/executive-member", null, [
          ...paginationParams,
          { key: "status", value: "", description: "Active | Inactive" },
          { key: "memberType", value: "", description: "Elected Member | Nominated Member | Ex-Officio" },
          { key: "tenureYear", value: "", description: "Tenure year ObjectId" },
        ]),
        req("Get Executive Member By ID", "GET", "/api/executive-member/{{executiveMemberId}}"),
        req("Create Executive Member", "POST", "/api/executive-member", {
          memberId: "0658",
          name: "Haji Dr. S Mohd. Abbas Zaidi",
          memberType: "Elected Member",
          city: "New Delhi",
          state: "New Delhi",
          timeTenure: "2026-2028",
          tenureYear: "{{tenureYearId}}",
          mobileNumber: "9818244361",
          address: "Kothi No. 11 Noor Nagar Extension Jamia Nagar New Delhi",
          status: "Active",
          designation: "{{designationId}}",
        }),
        req("Update Executive Member", "PUT", "/api/executive-member/{{executiveMemberId}}", {
          status: "Active",
          city: "Mumbai",
        }),
        req("Delete Executive Member", "DELETE", "/api/executive-member/{{executiveMemberId}}"),
      ]),

      folder("Local Secretaries", [
        req("Get All Local Secretaries", "GET", "/api/local-secretary", null, [
          ...paginationParams,
          { key: "status", value: "", description: "Active | Inactive" },
          { key: "tenureYear", value: "", description: "Tenure year ObjectId" },
        ]),
        req("Get Local Secretary By ID", "GET", "/api/local-secretary/{{localSecretaryId}}"),
        req("Create Local Secretary", "POST", "/api/local-secretary", {
          memberId: "LS-001",
          name: "Syed Ali Zaidi",
          city: "Lucknow",
          state: "U.P",
          timeTenure: "2026-2028",
          tenureYear: "{{tenureYearId}}",
          mobileNumber: "9585859786",
          address: "Bheroj Road Lucknow",
          status: "Active",
        }),
        req("Update Local Secretary", "PUT", "/api/local-secretary/{{localSecretaryId}}", {
          status: "Active",
          city: "Lucknow",
        }),
        req("Delete Local Secretary", "DELETE", "/api/local-secretary/{{localSecretaryId}}"),
      ]),

      folder("Office Bearers", [
        req("Get All Office Bearers", "GET", "/api/office-bearer", null, [
          ...paginationParams,
          { key: "status", value: "", description: "Active | Inactive" },
          { key: "tenureYear", value: "", description: "Tenure year ObjectId" },
          { key: "sortBy", value: "order", description: "order | recent | oldest" },
        ]),
        req("Get Office Bearer By ID", "GET", "/api/office-bearer/{{officeBearerId}}"),
        req("Create Office Bearer", "POST", "/api/office-bearer", {
          memberId: "OB-001",
          name: "Dr. Mujtaba Husain",
          designation: "{{designationId}}",
          tenureYear: "{{tenureYearId}}",
          timeTenure: "2026-2028",
          city: "Aligarh",
          state: "U.P",
          mobileNumber: "7060888223",
          address: "4/671 Friends Colony Aligarh",
          status: "Active",
          order: 1,
        }),
        req("Update Office Bearer", "PUT", "/api/office-bearer/{{officeBearerId}}", {
          status: "Active",
          order: 2,
        }),
        req("Delete Office Bearer", "DELETE", "/api/office-bearer/{{officeBearerId}}"),
      ]),

    ], "Executive members, local secretaries, office bearers"),

    // ═══════════════════════════════════════════════════════════════════════
    // 📢 COMMUNICATIONS
    // ═══════════════════════════════════════════════════════════════════════
    folder("📢 Communications", [

      folder("Communication", [
        req("Get All Communications", "GET", "/api/communication", null, [
          ...paginationParams,
          { key: "type", value: "", description: "email | sms | whatsapp | notice | circular" },
          { key: "status", value: "", description: "draft | sent | failed | scheduled" },
        ]),
        req("Get Communication By ID", "GET", "/api/communication/{{communicationId}}"),
        req("Create Communication", "POST", "/api/communication", {
          subject: "Annual Meeting Notice",
          message: "Dear Members, the annual meeting is scheduled for 15th June 2025.",
          type: "notice",
          recipientType: "all",
          status: "draft",
        }),
        req("Update Communication", "PUT", "/api/communication/{{communicationId}}", {
          subject: "Updated Subject",
          status: "draft",
        }),
        req("Send Communication", "PATCH", "/api/communication/{{communicationId}}/send", {}),
        req("Delete Communication", "DELETE", "/api/communication/{{communicationId}}"),
      ]),

      folder("Messaging", [
        req("Get All Messages", "GET", "/api/messaging", null, [
          ...paginationParams,
          { key: "channel", value: "", description: "whatsapp | sms | push | email" },
          { key: "status", value: "", description: "draft | sent | failed | scheduled" },
        ]),
        req("Get Message By ID", "GET", "/api/messaging/{{messageId}}"),
        req("Create Message", "POST", "/api/messaging", {
          title: "Eid Mubarak",
          body: "Wishing all members a blessed Eid. May Allah accept your prayers.",
          channel: "whatsapp",
          recipientType: "all",
          status: "draft",
        }),
        req("Update Message", "PUT", "/api/messaging/{{messageId}}", {
          title: "Updated Title",
          status: "draft",
        }),
        req("Send Message", "PATCH", "/api/messaging/{{messageId}}/send", {}),
        req("Delete Message", "DELETE", "/api/messaging/{{messageId}}"),
      ]),

    ], "Notices, circulars and WhatsApp/SMS messaging"),

  ],
};

writeFileSync(
  new URL("./AWSM-ERP.postman_collection.json", import.meta.url),
  JSON.stringify(collection, null, 2),
  "utf-8"
);

