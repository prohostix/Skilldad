# Database Recovery Guide - Your Data is Here!

## Good News! 🎉

Your database files are still in your workspace! I found them in the `.mongodb_data` directory.

## The Problem

Your MongoDB is probably running with the default data directory (like `C:\data\db`), but your actual data is stored in the custom directory `.mongodb_data` inside your workspace.

## Quick Solution (Recommended)

### Step 1: Stop Any Running MongoDB

First, stop any MongoDB that might be running:

```bash
# In PowerShell or Command Prompt (as Administrator)
net stop MongoDB
```

Or press `Ctrl+C` if MongoDB is running in a terminal window.

### Step 2: Start MongoDB with Your Data Directory

**Option A: Use the Batch Script (Easiest)**

I've created a script for you. Just double-click this file:
```
start_mongodb_with_data.bat
```

This will start MongoDB using your `.mongodb_data` directory.

**Option B: Manual Command**

Open Command Prompt in your workspace directory and run:

```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath=".mongodb_data" --port 27017
```

**IMPORTANT:** Keep this window open while using the application!

### Step 3: Start Your Server

In a NEW terminal window:

```bash
cd server
npm start
```

### Step 4: Verify Your Data

Run the diagnostic script to confirm everything is working:

```bash
cd server
node scripts/findDatabase.js
```

You should now see all your users, courses, exams, etc.!

## Alternative Solution: Copy Data to Default Location

If you prefer MongoDB to use the default data directory:

### Step 1: Find Your Default MongoDB Data Directory

Check your MongoDB configuration:

```bash
type "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

Look for the `dbPath` setting (usually `C:\data\db`).

### Step 2: Stop MongoDB

```bash
net stop MongoDB
```

### Step 3: Backup Current Data (if any)

```bash
# Rename the old data directory
move "C:\data\db" "C:\data\db_backup"
```

### Step 4: Copy Your Data

```bash
# Copy your workspace data to the default location
xcopy /E /I /H ".mongodb_data" "C:\data\db"
```

### Step 5: Start MongoDB

```bash
net start MongoDB
```

### Step 6: Verify

```bash
cd server
node scripts/findDatabase.js
```

## Understanding the Issue

Your workspace has a `.mongodb_data` directory with 123 files including:
- Collection files (`.wt` files)
- Index files
- MongoDB metadata

This means at some point, MongoDB was started with this custom data directory. To access this data, MongoDB must be started with the `--dbpath` parameter pointing to `.mongodb_data`.

## Permanent Solution

To avoid this issue in the future, you have two options:

### Option 1: Always Use the Batch Script

Keep using `start_mongodb_with_data.bat` to start MongoDB for this project.

### Option 2: Configure MongoDB Service

Edit MongoDB configuration to use your custom data directory:

1. Open MongoDB config file:
   ```
   C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
   ```

2. Change the `dbPath` to your workspace:
   ```yaml
   storage:
     dbPath: C:\path\to\your\workspace\.mongodb_data
   ```

3. Restart MongoDB service:
   ```bash
   net stop MongoDB
   net start MongoDB
   ```

**Note:** This will make MongoDB use this data directory for ALL projects, which might not be what you want.

### Option 3: Use Different Ports for Different Projects

You can run multiple MongoDB instances on different ports:

**For this project:**
```bash
mongod --dbpath=".mongodb_data" --port 27017
```

**For other projects:**
```bash
mongod --dbpath="C:\data\db" --port 27018
```

Then update `MONGO_URI` in `.env` accordingly.

## Troubleshooting

### "MongoDB is already running"

If you get an error that MongoDB is already running:

1. Stop the service:
   ```bash
   net stop MongoDB
   ```

2. Or find and kill the process:
   ```bash
   # In PowerShell
   Get-Process mongod | Stop-Process -Force
   ```

### "Access Denied" or "Permission Error"

Run Command Prompt as Administrator:
1. Right-click Command Prompt
2. Select "Run as administrator"
3. Try the command again

### "Cannot find mongod.exe"

MongoDB might be installed in a different location. Try:

```bash
# Check if MongoDB is installed
where mongod

# Or try version 6.0
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath=".mongodb_data" --port 27017
```

### Still Can't Find Your Data?

Run the diagnostic script to see what's happening:

```bash
cd server
node scripts/findDatabase.js
```

This will show you:
- Which database you're connected to
- All available databases
- Collections and document counts
- Sample users

## Next Steps

After recovering your database:

1. ✅ Verify all your data is accessible
2. ✅ Test the application (login, view courses, etc.)
3. ✅ Create a backup:
   ```bash
   mongodump --db skilldad --out ./backup
   ```
4. ✅ Document your MongoDB setup for future reference

## Need Help?

If you're still having issues, run these commands and share the output:

```bash
# Check MongoDB status
net start | findstr MongoDB

# Check what's in your data directory
dir .mongodb_data

# Run diagnostic
cd server
node scripts/findDatabase.js
```
