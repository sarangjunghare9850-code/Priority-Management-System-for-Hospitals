# 🚀 Quick Start Guide

## Problem: App Not Running
The app requires Node.js but it's not installed on your system.

## ✅ **Solution 1: Install Node.js (Recommended for Full Features)**

### **For macOS:**
1. **Download Node.js:**
   - Go to [nodejs.org](https://nodejs.org)
   - Download the LTS version
   - Run the installer

2. **Or use Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install node
   ```

3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

4. **Run the app:**
   ```bash
   cd /Users/sarangjunghare/Documents/pbl
   npm install
   npm start
   ```

5. **Open in browser:**
   Go to `http://localhost:3000`

---

## ✅ **Solution 2: Static Version (No Node.js Required)**

If you don't want to install Node.js, use the static version:

1. **Open the static file directly:**
   - Double-click `index-static.html` in Finder
   - Or drag it to your browser
   - Or right-click → "Open with" → Browser

2. **Features available:**
   - ✅ Add/manage patients
   - ✅ Automatic severity assessment
   - ✅ Room assignment
   - ✅ Data persistence (localStorage)
   - ✅ CSV export
   - ✅ Theme toggle
   - ❌ Real-time collaboration (requires server)

---

## 🎯 **Which Option Should You Choose?**

### **Choose Solution 1 (Node.js) if you want:**
- Real-time collaboration between multiple users
- WebSocket-based live updates
- Full-featured server-side functionality

### **Choose Solution 2 (Static) if you want:**
- Quick start without installation
- Single-user functionality
- All core triage management features
- No server setup required

---

## 🛠 **Troubleshooting**

### **Node.js Installation Issues:**
- **Permission denied:** Use `sudo` for installation commands
- **Command not found:** Restart terminal after installation
- **Version conflicts:** Use Node Version Manager (nvm)

### **Static Version Issues:**
- **File won't open:** Right-click → Open with → Browser
- **Features not working:** Check browser console for errors
- **Data not saving:** Ensure JavaScript is enabled

### **Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in server.js
PORT=3001 npm start
```

---

## 📞 **Need Help?**

1. **Check browser console** for error messages
2. **Verify Node.js installation** with `node --version`
3. **Try the static version** first to test functionality
4. **Check file permissions** if having issues

---

## 🎉 **Ready to Go!**

Once you choose a solution:
1. Open the application
2. Add your first patient
3. Assign them to a room
4. Start managing your hospital triage!

**The app is now ready to use! 🏥**


