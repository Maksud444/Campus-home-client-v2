# 🧪 Test Accounts - Campus Home

## 🚀 Quick Start

Use these pre-created accounts to test the authentication system.

---

## 👥 Available Test Accounts

### 🎓 STUDENTS (3 accounts)

#### Student 1 - Ahmed Hassan
```
📧 Email: student@test.com
🔑 Password: student123
👤 Role: Student
🎯 Dashboard: /dashboard/student
```

#### Student 2 - Sarah Mohamed
```
📧 Email: sarah@test.com
🔑 Password: sarah123
👤 Role: Student
🎯 Dashboard: /dashboard/student
```

#### Student 3 - Omar Ali
```
📧 Email: omar@test.com
🔑 Password: omar123
👤 Role: Student
🎯 Dashboard: /dashboard/student
```

---

### 👨‍💼 AGENTS (2 accounts)

#### Agent 1 - Mohamed Ali
```
📧 Email: agent@test.com
🔑 Password: agent123
👤 Role: Agent
🎯 Dashboard: /dashboard/agent
```

#### Agent 2 - Fatima Ahmed
```
📧 Email: fatima@test.com
🔑 Password: fatima123
👤 Role: Agent
🎯 Dashboard: /dashboard/agent
```

---

### 🏠 PROPERTY OWNERS (2 accounts)

#### Owner 1 - Youssef Ibrahim
```
📧 Email: owner@test.com
🔑 Password: owner123
👤 Role: Property Owner
🎯 Dashboard: /dashboard/owner
```

#### Owner 2 - Laila Khalil
```
📧 Email: laila@test.com
🔑 Password: laila123
👤 Role: Property Owner
🎯 Dashboard: /dashboard/owner
```

---

### 🔐 ADMIN (Optional)

#### Admin User
```
📧 Email: admin@test.com
🔑 Password: admin123
👤 Role: Student (can be changed to 'admin' role)
🎯 Dashboard: /dashboard/student
```

---

## 🎯 How to Create These Accounts

### Method 1: Automatic Seeding (Recommended)

```bash
# 1. Make sure MongoDB is running
# 2. Make sure .env.local is configured
# 3. Run seed script

npm run seed
```

This will:
- ✅ Connect to MongoDB
- ✅ Clear existing test accounts
- ✅ Hash passwords
- ✅ Create 8 dummy users
- ✅ Display success message

---

### Method 2: Manual Creation via API

You can also create these accounts by registering through the UI:

1. Go to: `http://localhost:3000/login`
2. Click "Sign Up"
3. Fill in the details from above
4. Click "Create Account"

---

## 🧪 Testing Workflow

### Test Student Dashboard:
```bash
1. Go to: http://localhost:3000/login
2. Enter: student@test.com / student123
3. Click "LOGIN"
4. ✅ Should redirect to /dashboard/student
5. ✅ Should see student features
```

### Test Agent Dashboard:
```bash
1. Go to: http://localhost:3000/login
2. Enter: agent@test.com / agent123
3. Click "LOGIN"
4. ✅ Should redirect to /dashboard/agent
5. ✅ Should see business analytics
```

### Test Owner Dashboard:
```bash
1. Go to: http://localhost:3000/login
2. Enter: owner@test.com / owner123
3. Click "LOGIN"
4. ✅ Should redirect to /dashboard/owner
5. ✅ Should see revenue tracking
```

---

## 🔍 Verify Accounts in Database

### Using MongoDB Compass:
```
1. Connect to: mongodb://localhost:27017
2. Database: campus-egypt
3. Collection: users
4. You should see 8 documents
```

### Using MongoDB Shell:
```bash
mongosh
use campus-egypt
db.users.find().pretty()
```

### Using Code:
```javascript
// In your Next.js API route or script
const users = await db.collection('users').find({}).toArray()
console.log(users)
```

---

## 🎨 Quick Copy-Paste Login Credentials

```
# Student
student@test.com
student123

# Agent
agent@test.com
agent123

# Owner
owner@test.com
owner123
```

---

## 🔄 Reset Test Accounts

If you need to reset the test accounts:

```bash
# Re-run the seed script
npm run seed
```

This will:
- Delete existing test accounts
- Create fresh accounts with same credentials

---

## 📊 Account Features by Role

### Student Features:
- ✅ Create posts (roommate/room search)
- ✅ Save properties
- ✅ Send messages
- ✅ View profile stats
- ✅ Browse properties

### Agent Features:
- ✅ Manage listings
- ✅ View analytics
- ✅ Handle inquiries
- ✅ Track performance
- ✅ Manage clients

### Owner Features:
- ✅ Add properties
- ✅ Track revenue
- ✅ Manage tenants
- ✅ View occupancy
- ✅ Handle maintenance

---

## 🚨 Security Notes

⚠️ **IMPORTANT**: These are TEST accounts only!

- ❌ DO NOT use in production
- ❌ DO NOT use real passwords
- ❌ DO NOT share test credentials publicly
- ✅ Only for development/testing
- ✅ Delete before deployment

---

## 🛠️ Troubleshooting

### Can't login with test accounts?

**Check 1: Are accounts created?**
```bash
npm run seed
```

**Check 2: Is MongoDB running?**
```bash
# Check if MongoDB is running
mongosh
```

**Check 3: Is .env.local correct?**
```env
MONGODB_URI=mongodb://localhost:27017/campus-egypt
```

**Check 4: Clear browser cache**
```
Ctrl + Shift + Delete
Clear cookies and cache
```

---

## 📝 Adding More Test Accounts

Edit `scripts/seed.ts` and add more users:

```typescript
{
  name: 'New User',
  email: 'newuser@test.com',
  password: 'newuser123',
  role: 'student', // or 'agent' or 'owner'
  provider: 'credentials',
  image: 'https://ui-avatars.com/api/?name=New+User',
}
```

Then run:
```bash
npm run seed
```

---

## ✅ Checklist

Before testing, make sure:

- [ ] MongoDB is running
- [ ] .env.local is configured
- [ ] Dependencies are installed (`npm install`)
- [ ] Seed script is run (`npm run seed`)
- [ ] Server is running (`npm run dev`)
- [ ] You're on `http://localhost:3000/login`

---

## 🎉 Ready to Test!

All accounts are ready to use. Happy testing! 🚀

**Last Updated**: December 2025
