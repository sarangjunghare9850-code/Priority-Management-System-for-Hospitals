# Quick Setup Instructions

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email (Required for OTP)
Edit `server.js` and update lines 25-30:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // ← Change this
    pass: 'your-app-password'     // ← Change this
  }
});
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use that password in the config

### 3. Start the Server
```bash
npm start
```

Then open: http://localhost:3000

## 🎯 First Use

1. **Sign Up:** Click "Sign up" → Enter details → Click "Send OTP" → Check email → Enter OTP → Create Account
2. **Add Patient:** Fill the intake form → Click "Add Patient"
3. **Assign Room:** Click "Assign Next Patient" to assign to available room

## 🔧 Development Mode
```bash
npm run dev  # Auto-reload on changes
```

## ❓ Need Help?
- Check browser console for errors
- Verify email configuration
- Read full README.md for detailed docs
- Check WebSocket connection in Network tab

## 🎉 You're Ready!
Your real-time hospital triage management system is now running with:
- ✅ Email authentication with OTP
- ✅ Real-time updates
- ✅ Secure user isolation
- ✅ Modern responsive UI


