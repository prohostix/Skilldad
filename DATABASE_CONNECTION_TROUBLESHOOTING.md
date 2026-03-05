# Database Connection Troubleshooting Guide

## Issue
Your previous database is not visible in the system. This usually means the application is connecting to a different database or MongoDB is not running.

## Quick Diagnosis

### Step 1: Check if MongoDB is Running

**Windows:**
```bash
# Check if MongoDB service is running
net start | findstr MongoDB

# Or check with PowerShell
Get-Service | Where-Object {$_.Name -like "*mongo*"}

# Start MongoDB if not running
net start MongoDB
```

**Alternative - Check MongoDB Compass:**
- Open MongoDB Compass
- Try to connect to `mongodb://127.0.0.1:27017`
- See if your databases are listed

### Step 2: Check Your .env File

1. **Check if server/.env exists:**
   ```bash
   cd server
   dir .env
   ```

2. **If .env doesn't exist, create it:**
   ```bash
   copy .env.example .env
   ```

3. **Open server/.env and check MONGO_URI:**
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/skilldad
   ```

### Step 3: Verify Database Name

Your previous database might have a different name. Common names:
- `skilldad`
- `skilldad-dev`
- `test`
- `lms`
- `education`

**Check all databases in MongoDB:**

Using MongoDB Shell:
```bash
mongosh
show dbs
```

Using MongoDB Compass:
- Connect to `mongodb://127.0.0.1:27017`
- Look at the list of databases on the left

### Step 4: Update MONGO_URI if Needed

If your database has a different name, update `server/.env`:

```env
# Change from:
MONGO_URI=mongodb://127.0.0.1:27017/skilldad

# To (example):
MONGO_URI=mongodb://127.0.0.1:27017/your_actual_database_name
```

## Common Scenarios

### Scenario 1: MongoDB Not Running

**Symptoms:**
- Application shows "MongoDB connection error"
- Cannot connect to database

**Solution:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Scenario 2: Wrong Database Name

**Symptoms:**
- Application connects but shows no data
- Empty user list, courses, etc.

**Solution:**
1. Find your actual database name:
   ```bash
   mongosh
   show dbs
   ```

2. Update `server/.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/your_actual_database_name
   ```

3. Restart server:
   ```bash
   cd server
   npm start
   ```

### Scenario 3: Using MongoDB Atlas (Cloud)

**Symptoms:**
- You were using MongoDB Atlas before
- MONGO_URI looks like: `mongodb+srv://...`

**Solution:**
1. Check your `server/.env` for the Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```

2. Make sure you have internet connection
3. Check if your IP is whitelisted in MongoDB Atlas

### Scenario 4: Local MongoDB Data Directory Changed

**Symptoms:**
- MongoDB starts but shows empty database
- Data was there before

**Solution:**
1. Find where MongoDB is storing data:
   ```bash
   # Check MongoDB config
   type "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
   ```

2. Look for `dbPath` in the config
3. Make sure MongoDB is pointing to the correct data directory

## Verification Steps

After fixing the connection:

1. **Check server logs:**
   ```bash
   cd server
   npm start
   ```
   Look for: `MongoDB Connected: ...`

2. **Check database in MongoDB Compass:**
   - Connect to your MongoDB instance
   - Verify you can see your database
   - Check collections: users, courses, exams, etc.

3. **Test the application:**
   - Login to the application
   - Check if users are visible in Admin Panel
   - Verify courses and other data appear

## Data Recovery

If you still can't find your data:

### Option 1: Check MongoDB Data Directory

Your data might still be in the MongoDB data directory:

**Default locations:**
- Windows: `C:\data\db` or `C:\Program Files\MongoDB\Server\7.0\data`
- Custom: Check `mongod.cfg` for `dbPath`

### Option 2: Check for Backup

Look for MongoDB backup files:
- `.bson` files (MongoDB dump format)
- `.json` files (exported collections)
- Backup folders

### Option 3: Restore from Backup

If you have a backup:

```bash
# Restore entire database
mongorestore --db skilldad /path/to/backup/folder

# Restore specific collection
mongorestore --db skilldad --collection users /path/to/backup/users.bson
```

## Prevention

To avoid this in the future:

1. **Document your database name:**
   - Add a comment in `.env` file
   - Keep a note of your database name

2. **Regular backups:**
   ```bash
   # Backup entire database
   mongodump --db skilldad --out ./backup

   # Backup with date
   mongodump --db skilldad --out ./backup/skilldad_%date:~-4,4%%date:~-10,2%%date:~-7,2%
   ```

3. **Use MongoDB Compass:**
   - Save your connection string
   - Bookmark your database

## Need More Help?

If you're still having issues:

1. **Check server console output:**
   - Look for MongoDB connection errors
   - Note the exact error message

2. **Check MongoDB logs:**
   - Windows: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`

3. **Verify MongoDB version:**
   ```bash
   mongod --version
   ```

4. **Test connection manually:**
   ```bash
   mongosh "mongodb://127.0.0.1:27017/skilldad"
   show collections
   db.users.countDocuments()
   ```

## Quick Fix Script

I can create a script to help you find and connect to your database. Would you like me to create that?
