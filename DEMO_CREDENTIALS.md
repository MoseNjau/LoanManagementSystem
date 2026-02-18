# 🧪 Demo Login Credentials

## Quick Start

The application is configured in **DEV MODE** for easy testing without connecting to the real backend API.

### Demo User Credentials

```
Username: demo
Password: demo123
```

**User Profile:**
- **Name:** Demo Admin
- **Email:** admin@demo.com
- **Role:** Admin
- **Permissions:** Full access (Create, Edit, Delete customers/loans/users)

---

## How It Works

When `DEV_MODE = true` in `src/services/auth.service.ts`:

1. ✅ You can login with `demo` / `demo123`
2. ✅ No backend API call is made
3. ✅ Dummy tokens and user data are stored in localStorage
4. ✅ You get full access to all features

---

## Switching Between Dev and Production

**File:** `src/services/auth.service.ts`

```typescript
// Line 7: Toggle this flag
const DEV_MODE = true;  // Set to false for production
```

### Dev Mode (DEV_MODE = true)
- ✅ Use `demo` / `demo123` to login
- ✅ No API required
- ✅ Perfect for frontend development

### Production Mode (DEV_MODE = false)
- ❌ Dummy credentials won't work
- ✅ All auth requests go to real API
- ✅ Requires backend at `http://172.105.90.112:8080`

---

## Other Test Users (Add Your Own)

You can create additional dummy users in `auth.service.ts`:

```typescript
const TEST_USERS = {
  admin: { username: 'demo', password: 'demo123', role: UserRole.ADMIN },
  officer: { username: 'officer', password: 'officer123', role: UserRole.LOAN_OFFICER },
  viewer: { username: 'viewer', password: 'view123', role: UserRole.READ_ONLY },
};
```

---

## Security Note ⚠️

**IMPORTANT:** Before deploying to production:

1. Set `DEV_MODE = false` in `auth.service.ts`
2. Remove or comment out the dev mode banner in `LoginPage.tsx`
3. Ensure all API endpoints are correctly configured in `vite.config.ts`

---

Happy Testing! 🚀
