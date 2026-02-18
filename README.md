# Kassolend Admin Dashboard

> 💙 **A production-ready Loan Application & Customer Management System designed with care for Microfinance institutions and SACCOs.**

This dashboard provides a secure, intuitive, and efficient interface for managing customers, loans, and internal workflows. Built with modern technologies to ensure reliability, security, and excellent user experience.

---

## 📖 How the Application Works

Welcome! Let's walk through how Kassolend works from start to finish.

### 🔐 **Step 1: Authentication (Login)**

When you first visit the application, you'll see the login screen.

**What happens:**
1. You enter your **username** and **password**.
2. The system sends your credentials to the backend API (`POST /api/auth/login`).
3. If valid, the backend returns:
   - **Access Token** (for authenticating future requests)
   - **Refresh Token** (for getting a new access token when it expires)
   - **User Information** (name, role, permissions)
4. These tokens are stored securely in your browser's `localStorage`.
5. You're automatically redirected to the **Dashboard**.

**Security Features:**
- 🔒 Passwords are never stored in the frontend
- 🔄 Tokens automatically refresh when they expire (no need to log in again!)
- ⏱️ If your session expires, you'll be redirected to login

**Code Location:** [src/pages/auth/LoginPage.tsx](src/pages/auth/LoginPage.tsx)

---

### 🏠 **Step 2: Dashboard Overview**

After logging in, you land on the **Dashboard** — your command center!

**What you see:**
- **Key Statistics Cards:**
  - Total Active Loans
  - Total Customers
  - Outstanding Balance (money owed)
  - Collection Rate (% of payments received on time)
- **Quick Actions:** Buttons to create customers or loans
- **Recent Activity:** Latest customer registrations or loan applications

**Behind the scenes:**
1. The Dashboard makes an API call to `GET /api/dashboard`
2. TanStack Query caches the data for fast loading
3. Data is formatted beautifully using helper functions (e.g., currency formatter)

**Code Location:** [src/pages/dashboard/DashboardPage.tsx](src/pages/dashboard/DashboardPage.tsx)

---

### 👥 **Step 3: Managing Customers**

Click **"Customers"** in the sidebar to manage customer records.

#### **3a. Viewing Customer List**

**What you see:**
- A searchable, paginated table with all customers
- Columns: Name, ID Number, Phone, Email, Status, Actions
- Search bar to filter by name or phone number
- **"Create Customer"** button (if you have permission)

**How it works:**
1. The page fetches customers from `GET /api/customers?page=1&limit=10`
2. You can:
   - Search: Type in the search box → debounced search after 300ms
   - Paginate: Click "Next" → fetches the next page
   - View Details: Click on a customer name → opens detail page

**Code Location:** [src/pages/customers/CustomersPage.tsx](src/pages/customers/CustomersPage.tsx)

#### **3b. Creating a New Customer**

Click **"Create Customer"** to open the registration form.

**What you fill in:**
- **Personal Info:** First Name, Last Name, Date of Birth, Gender
- **Contact:** Phone Number, Email Address, Physical Address
- **Identification:** ID Number, ID Type
- **Employment:** Employer, Monthly Income

**Form Validation (automatic):**
- ✅ Email must be valid format
- ✅ Phone must be Kenyan format (254XXXXXXXXX)
- ✅ ID Number must be 7-8 digits
- ✅ Age must be 18+ (calculated from Date of Birth)

**What happens when you submit:**
1. Form data is validated (React Hook Form)
2. API request sent: `POST /api/customers`
3. Success? → You're redirected to the new customer's detail page
4. Error? → Friendly error message appears

**Code Location:** [src/pages/customers/CreateCustomerPage.tsx](src/pages/customers/CreateCustomerPage.tsx)

#### **3c. Viewing Customer Details**

Click on a customer's name to see their full profile.

**What you see:**
- Complete personal information
- Contact details
- Employment information
- List of all loans (if any)
- Action buttons: Edit, Delete (if you have permission)

**Code Location:** [src/pages/customers/CustomerDetailPage.tsx](src/pages/customers/CustomerDetailPage.tsx)

---

### 🔐 **Step 4: Role-Based Permissions**

Not everyone can do everything! Your **role** determines what you can see and do.

#### **Role Hierarchy:**

| Role | What You Can Do |
|------|----------------|
| **🔴 Super Admin** | Everything! Full system access |
| **🟠 Admin** | Manage customers, loans, users, and view reports |
| **🟢 Loan Officer** | Create/edit customers and loans, view reports |
| **🔵 Read Only** | View everything, but can't create or edit |

**How it works in code:**
1. Your role and permissions are stored in the `authStore` (Zustand)
2. Every button/link checks: "Does this user have permission?"
   ```typescript
   const canCreate = hasPermission(Permission.CREATE_CUSTOMER);
   ```
3. If you don't have permission:
   - The button is hidden OR
   - The button is disabled (grayed out)

**Example:** Only Admins and Loan Officers see the "Create Customer" button.

**Code Location:** [src/store/auth.store.ts](src/store/auth.store.ts)

---

### 🔄 **Step 5: Session Management**

The app keeps you logged in automatically!

**Auto-Refresh Flow:**
1. Your access token expires after 15 minutes (typical setup)
2. The app detects this when an API call returns `401 Unauthorized`
3. Automatically uses the **refresh token** to get a new access token
4. Retries your original request
5. You never notice! 🎉

**If the refresh token also expires:**
- You're logged out
- Redirected to the login page
- A friendly message appears: "Your session has expired"

**Code Location:** [src/services/http-client.ts](src/services/http-client.ts) (see interceptors)

---

### 🎨 **Step 6: UI Components**

The app uses **reusable UI components** for consistency.

**Example Components:**
- **Button:** `<Button variant="primary">Save</Button>`
- **Input:** `<Input label="Email" error="Invalid email" />`
- **Card:** `<Card>Content here</Card>`
- **Table:** `<Table>...</Table>`

**Why this matters:**
- ✅ Consistent design across the app
- ✅ Easy to maintain and update
- ✅ Tailwind CSS for styling (fast and customizable)

**Code Location:** [src/components/ui/](src/components/ui/)

---

## 🎯 User Workflows (Step-by-Step Examples)

### Workflow 1: **Register a New Customer**
1. Log in → Dashboard
2. Click "Customers" (sidebar)
3. Click "Create Customer" (top-right button)
4. Fill out the form (all required fields marked with *)
5. Click "Submit"
6. ✅ Success! Redirected to customer profile

### Workflow 2: **Search for a Customer**
1. Go to "Customers" page
2. Type customer name or phone in the search bar
3. Results filter automatically (debounced after 300ms)
4. Click on customer to view details

### Workflow 3: **Session Expires**
1. You're working in the app
2. Token expires after inactivity
3. You try to load a page
4. App auto-refreshes token in the background
5. Page loads seamlessly (you don't even notice!)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (Recommended: v20)
- **npm** or **yarn**
- A code editor (VS Code recommended)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

**The app will open at:** `http://localhost:3000`

### First Login ( Explained

We chose **battle-tested, enterprise-grade** technologies:

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **React 18** | UI Framework | Industry standard, huge ecosystem, excellent performance |
| **TypeScript** | Type Safety | Catches bugs at compile-time, better developer experience |
| **Vite** | Build Tool (Detailed)

```
creditsys/
├── src/
│   ├── components/          # 🧩 Reusable UI Components
│   │   ├── ui/              # Atomic components (Button, Input, Card, Table)
│   │   ├── ProtectedRoute.tsx  # Route guard (checks authentication)
│   │   └── PermissionGuard.tsx # Component-level permission check
│   │
│   ├── hooks/               # 🎣 Custom React Hooks
│   │   ├── use-customers.ts    # Customer CRUD operations
│   │   ├── useArchitecture

### Authentication Flow
```
User Login
    ↓
[POST /api/auth/login]
    ↓
Backend validates credentials
    ↓
Returns: { accessToken, refreshToken, user }
    ↓
Tokens stored in localStorage
    ↓
All API requests include: Authorization: Bearer <token>
    ↓
Token expires (15 min)
    ↓
[Interceptor catches 401 error]
    ↓
[POST /api/auth/refresh] (uses refreshToken)
    ↓
New accessToken → Retry original request
    ↓
Success! User stays logged in
```

### Permission System

**How it works:**
1. Each **role** has a predefined set of **permissions**
   ```typescript
   SUPER_ADMIN: [all permissions]
   ADMIN: [CREATE_CUSTOMER, VIEW_CUSTOMER, EDIT_CUSTOMER, ...]
   LOAN_OFFICER: [CREATE_CUSTOMER, VIEW_CUSTOMER, CREATE_LOAN, ...]
   READ_ONLY: [VIEW_CUSTOMER, VIEW_LOAN, VIEW_REPORTS]
   ```

2. **In Routes:** `ProtectedRoute` checks `isAuthenticated`
3. **In Components:** `hasPermission()` checks specific actions
   ```tsx
   {hasPermission(Permission.CREATE_CUSTOMER) && (
     <Button>Create Customer</Button>
   )}
   ```

**File:** [src/utils/constants.ts](src/utils/constants.ts) — See `ROLE_PERMISSIONS`

---

## 🌐 API Integration

### Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/login` | POST | User login | No |
| `/api/auth/refresh` | POST | Refresh access token | Yes (refresh token) |
| `/api/auth/me` | GET | Get current user info | Yes |
| `/api/customers` | GET | List customers (paginated) | Yes |
| `/api/customers` | POST | Create new customer | Yes |
| `/api/customers/:id` | GET | Get customer details | Yes |
| `/api/dashboard` | GET | Dashboard statistics | Yes |

### Request/Response Examples

**Login:**
```typescript
// Request
POST /api/auth/login
{
  "username": "admin@kassolend.com",
  "password": "admin123"
}

// Response
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "user": {
    "id": 1,
    "username": "admin@kassolend.com",
    "role": "ADMIN",
    "permissions": ["CREATE_CUSTOMER", "VIEW_CUSTOMER", ...]
  }
}
```

**Get Customers:**
```typescript
// Request
GET /api/customers?page=1&limit=10&search=john

// Response
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "254712345678",
      ...
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 📝 Configuration

### Environment Setup

**Default Settings:**
- **Dev Server:** `http://localhost:3000`
- **API Proxy:** `http://172.105.90.112:8080/kassolend-v1-dev`

**To customize:** Edit [vite.config.ts](vite.config.ts)

```typescript
export default defineConfig({
  server: {
    port: 3000,  // Change dev server port
    proxy: {
      '/api': {
        target: 'https://your-backend.com',  // Your API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Tailwind Theme Customization

Edit [tailwind.config.js](tailwind.config.js) to change colors, fonts, etc.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',  // Change primary color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],  // Change font
      },
    },
  },
};
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Blank white page after login  
**Fix:** Check browser console for errors. Likely auth token issue.

**Issue:** "Network Error" on API calls  
**Fix:** Verify backend is running and proxy in `vite.config.ts` is correct.

**Issue:** "Cannot find module '@/components/...'"  
**Fix:** TypeScript path aliases issue. Check `tsconfig.json` → `paths` setting.

**Issue:** Port 3000 already in use  
**Fix:** Vite will auto-switch to 3001. Or manually stop the other process with `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Code Style:** Use Prettier and ESLint (run `npm run lint`)
2. **TypeScript:** Always add types (no `any`)
3. **Components:** Use existing UI components from `components/ui/`
4. **Naming:** Use descriptive names (`CreateCustomerPage`, not `Page1`)
5. **Commits:** Write clear commit messages ("Add customer search feature")

---

## 📚 Additional Resources

- **React Docs:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://github.com/pmndrs/zustand

---

## 💙 Built with Care

This system is designed to be reliable, secure, and a joy to use. If you have questions or feedback, please reach out to the development team.

**Happy coding! 🚀**
│   │   ├── loans/
│   │   │   └── LoansPage.tsx    # (Placeholder for future)
│   │   ├── users/
│   │   │   └── UsersPage.tsx    # (Placeholder for future)
│   │   └── roles/
│   │       └── RolesPage.tsx    # (Placeholder for future)
│   │
│   ├── routes/              # 🛣️ Routing Configuration
│   │   └── index.tsx           # All app routes defined here
│   │
│   ├── services/            # 🌐 API Integration Layer
│   │   ├── http-client.ts      # Axios instance + interceptors
│   │   ├── auth.service.ts     # Login, logout, refresh token
│   │   ├── customer.service.ts # Customer CRUD API calls
│   │   └── dashboard.service.ts # Dashboard data fetching
│   │
│   ├── store/               # 🗃️ Global State Management
│   │   └── auth.store.ts       # User, authentication, permissions (Zustand)
│   │
│   ├── types/               # 📝 TypeScript Definitions
│   │   ├── index.ts            # Common types (User, Customer, Loan)
│   │   └── enums.ts            # Enums (UserRole, Permission, Status)
│   │
│   ├── utils/               # 🛠️ Helper Functions
│   │   ├── constants.ts        # API URLs, routes, permissions map
│   │   └── helpers.ts          # Formatters (currency, date, phone)
│   │
│   ├── main.tsx             # ⚡ App Entry Point (React root render)
│   └── index.css            # 🎨 Global Styles (Tailwind imports)
│
├── public/                  # Static Assets (images, fonts)
├── vite.config.ts           # ⚙️ Vite Configuration (proxy, build settings)
├── tailwind.config.js       # 🎨 Tailwind Customization (colors, fonts)
├── tsconfig.json            # 📘 TypeScript Configuration
└── package.json             # 📦 Dependencies & Scripts
```

**Key Principles:**
- **Feature-First:** Pages are grouped by feature (customers, loans, etc.)
- **Service Layer:** All API calls isolated in `services/` (no fetch/axios in components)
- **Type Safety:** Every API response, prop, and state is typed
- **Reusability:** UI components in `components/ui/` used across the app **Performance first** — optimized bundle size, lazy loading, caching
- ✅ **Developer experience** — TypeScript autocomplete, clear folder structure
- ✅ **Maintainability** — clean architecture, separation of concern
### API Configuration
The app is **pre-configured** to connect to the backend API:
- **Backend URL:** `http://172.105.90.112:8080/kassolend-v1-dev`
- **Proxy Setup:** All `/api/*` requests are automatically routed
- **No additional setup needed!** Just run `npm run dev` and start working.

**To change the API endpoint:**
Edit [vite.config.ts](vite.config.ts) and update the `proxy.target` value.

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The build outputs to the `dist/` folder, ready for deployment.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, clsx, tailwind-merge
*   **State**: Zustand (Auth/UI), TanStack Query (Data Fetching)
*   **Routing**: React Router v6
*   **Networking**: Axios with Interceptors

## 📂 Project Structure

```
src/
├── components/     # UI Building blocks (Cards, Buttons, Tables)
├── hooks/          # Logic reuse (useAuth, useCustomers)
├── pages/          # Application views (Dashboard, Login)
├── services/       # API integration layer
├── store/          # Global state (User session)
└── utils/          # Constants, formatters, and helpers
```

## 🔒 Security Features

*   **JWT Auth**: Secure HTTP-only handling of tokens.
*   **Auto-Logout**: Sessions are monitored; invalid tokens redirect to login.
*   **Permission Guards**: UI elements (buttons/links) are hidden if the user lacks the required permission.

## 🤝 API Integration

The frontend connects to `/api/*` endpoints.
*   **Auth**: `/auth/login`, `/auth/refresh`, `/auth/me`
*   **Customers**: `/customers` (GET, POST)

## 📝 Configuration

*   **Port**: Defaults to 5173.
*   **Proxy**: Configured in `vite.config.ts` to handle CORS and routing to the backend API.

