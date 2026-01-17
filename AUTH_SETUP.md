# 🔐 Authentication Setup Guide

## ✅ Authentication System Implemented

Your Campus Home platform now has **complete authentication** with:
- ✅ Email/Password login & registration
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Role-based dashboards (Student/Agent/Owner)
- ✅ Protected routes
- ✅ MongoDB user storage

---

## 📦 Installation Steps:

### 1️⃣ Install Dependencies:
```bash
cd campus-egypt-nextjs
npm install
```

This will install:
- `next-auth` - Authentication
- `bcryptjs` - Password hashing
- `mongodb` - Database

---

## 🗄️ Database Setup:

### Option A: Local MongoDB (Development)
```bash
# Install MongoDB locally
# Then update .env.local:
MONGODB_URI=mongodb://localhost:27017/campus-egypt
```

### Option B: MongoDB Atlas (Recommended)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-egypt
```

---

## 🔑 OAuth Setup:

### Google OAuth Setup:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create New Project:**
   - Click "Select Project" → "New Project"
   - Name: "Campus Home"

3. **Enable Google+ API:**
   - Navigate to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Application type: "Web application"
   - Name: "Campus Home Web"

5. **Add Authorized Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

6. **Copy Credentials to `.env.local`:**
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

### Facebook OAuth Setup:

1. **Go to Facebook Developers:**
   - https://developers.facebook.com/

2. **Create New App:**
   - Click "Create App"
   - Select "Consumer" app type
   - Name: "Campus Home"

3. **Add Facebook Login Product:**
   - In dashboard, click "Add Product"
   - Select "Facebook Login"
   - Click "Set Up"

4. **Configure OAuth Settings:**
   - Go to "Facebook Login" → "Settings"
   - Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```

5. **Copy App Credentials to `.env.local`:**
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```
   Find these in: Settings → Basic

6. **Make App Public (for production):**
   - App Review → Permissions and Features
   - Request "email" and "public_profile" permissions

---

## 🔐 Generate NextAuth Secret:

```bash
# Run this command:
openssl rand -base64 32

# Or online:
# https://generate-secret.vercel.app/32

# Copy result to .env.local:
NEXTAUTH_SECRET=your-generated-secret-here
```

---

## 📝 Complete .env.local File:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-egypt

# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop

# Facebook OAuth
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 🚀 Run the Application:

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 🧪 Testing Authentication:

### Test Email/Password:
1. Go to: http://localhost:3000/login
2. Click "Sign Up" tab
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: Student
4. Click "CREATE ACCOUNT"
5. You'll be redirected to Student Dashboard

### Test Google Login:
1. Go to: http://localhost:3000/login
2. Click "Continue with Google"
3. Select your Google account
4. You'll be redirected to Student Dashboard (default role)

### Test Facebook Login:
1. Go to: http://localhost:3000/login
2. Click "Continue with Facebook"
3. Log in with Facebook
4. You'll be redirected to Student Dashboard

---

## 🎯 How It Works:

### Registration Flow:
```
User fills form → POST /api/register → 
Password hashed → User saved to MongoDB → 
Auto login → Redirect to dashboard based on role
```

### Login Flow:
```
User enters credentials → POST /api/auth/signin → 
Verify password → Create session → 
Redirect to /dashboard → Middleware checks role → 
Redirect to /dashboard/{role}
```

### OAuth Flow:
```
User clicks Google/Facebook → OAuth provider → 
User approves → Callback to /api/auth/callback → 
Check if user exists → Create/update user → 
Create session → Redirect to dashboard
```

---

## 🛡️ Protected Routes:

These routes require authentication:
- `/dashboard/*` - All dashboard pages
- `/post/*` - Post creation
- `/messages/*` - Messages
- `/profile/*` - User profile

If not logged in → Redirect to `/login`

---

## 👥 Role-Based Access:

### After Login:
- **Student** → `/dashboard/student`
- **Agent** → `/dashboard/agent`
- **Owner** → `/dashboard/owner`

### How to Change Role:
OAuth users default to "student". To change:
1. Update in MongoDB directly, or
2. Add role selection page after OAuth login

---

## 📊 Database Structure:

### Users Collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed), // Only for credentials
  role: String, // 'student' | 'agent' | 'owner'
  provider: String, // 'credentials' | 'google' | 'facebook'
  image: String, // Profile image URL
  emailVerified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Common Issues & Solutions:

### Issue: "OAuth Error"
**Solution:** Check redirect URIs match exactly in provider settings

### Issue: "MongoDB Connection Failed"
**Solution:** 
- Check MONGODB_URI is correct
- Whitelist your IP in MongoDB Atlas
- Check network settings

### Issue: "Invalid Credentials"
**Solution:** 
- Verify email exists in database
- Check password is correct (min 6 characters)

### Issue: "Session Not Persisting"
**Solution:** 
- Clear browser cookies
- Check NEXTAUTH_SECRET is set
- Restart dev server

---

## 🎨 Customization:

### Change Default Role for OAuth:
Edit: `src/lib/auth/config.ts`
```typescript
// Line ~45
role: 'student', // Change to 'agent' or 'owner'
```

### Add More OAuth Providers:
```typescript
// In src/lib/auth/config.ts
import GithubProvider from 'next-auth/providers/github'

providers: [
  GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  // ... other providers
]
```

---

## 📱 Production Deployment:

### Update .env for Production:
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-new-secret-for-production

# Update OAuth redirect URIs in provider dashboards:
https://your-domain.com/api/auth/callback/google
https://your-domain.com/api/auth/callback/facebook
```

---

## ✅ Features Checklist:

- [x] Email/Password registration
- [x] Email/Password login
- [x] Google OAuth
- [x] Facebook OAuth
- [x] Password hashing (bcrypt)
- [x] Session management
- [x] Role-based access
- [x] Protected routes
- [x] MongoDB integration
- [x] TypeScript types
- [x] Error handling
- [x] Loading states

---

## 🎯 Next Steps:

1. ✅ Setup OAuth credentials
2. ✅ Configure MongoDB
3. ✅ Test all authentication methods
4. 🔄 Add email verification
5. 🔄 Add password reset
6. 🔄 Add profile image upload
7. 🔄 Add 2FA (optional)

---

## 📞 Need Help?

Check these resources:
- NextAuth Docs: https://next-auth.js.org/
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Facebook Login: https://developers.facebook.com/docs/facebook-login/

---

**🎉 Your authentication system is ready!**

**Made with ❤️ - December 2025**
