@echo off
REM Start MongoDB with the custom data directory in this workspace
REM This ensures MongoDB uses the .mongodb_data folder that contains your database

echo ========================================
echo Starting MongoDB with Custom Data Directory
echo ========================================
echo.

REM Get the current directory (workspace root)
set WORKSPACE_DIR=%cd%

REM Set the MongoDB data directory path
set MONGO_DATA_DIR=%WORKSPACE_DIR%\.mongodb_data

echo Workspace Directory: %WORKSPACE_DIR%
echo MongoDB Data Directory: %MONGO_DATA_DIR%
echo.

REM Check if .mongodb_data directory exists
if not exist "%MONGO_DATA_DIR%" (
    echo ERROR: .mongodb_data directory not found!
    echo Expected location: %MONGO_DATA_DIR%
    echo.
    pause
    exit /b 1
)

echo Starting MongoDB...
echo.
echo IMPORTANT: Keep this window open while using the application!
echo Press Ctrl+C to stop MongoDB when done.
echo.

REM Start MongoDB with the custom data directory
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="%MONGO_DATA_DIR%" --port 27017

REM If MongoDB is not in the default location, try other common locations
if errorlevel 1 (
    echo.
    echo MongoDB not found at default location.
    echo Trying alternative location...
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="%MONGO_DATA_DIR%" --port 27017
)

if errorlevel 1 (
    echo.
    echo ERROR: Could not start MongoDB!
    echo.
    echo Please check:
    echo 1. MongoDB is installed
    echo 2. MongoDB path is correct
    echo 3. You have permissions to access the data directory
    echo.
    pause
)
