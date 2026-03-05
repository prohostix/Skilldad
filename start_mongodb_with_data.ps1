# Start MongoDB with the custom data directory in this workspace
# This ensures MongoDB uses the .mongodb_data folder that contains your database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting MongoDB with Custom Data Directory" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory (workspace root)
$WorkspaceDir = Get-Location
$MongoDataDir = Join-Path $WorkspaceDir ".mongodb_data"

Write-Host "Workspace Directory: $WorkspaceDir" -ForegroundColor Yellow
Write-Host "MongoDB Data Directory: $MongoDataDir" -ForegroundColor Yellow
Write-Host ""

# Check if .mongodb_data directory exists
if (-not (Test-Path $MongoDataDir)) {
    Write-Host "ERROR: .mongodb_data directory not found!" -ForegroundColor Red
    Write-Host "Expected location: $MongoDataDir" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting MongoDB..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Keep this window open while using the application!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop MongoDB when done." -ForegroundColor Yellow
Write-Host ""

# Try to start MongoDB with the custom data directory
$mongodPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

if (Test-Path $mongodPath) {
    Write-Host "Found MongoDB at: $mongodPath" -ForegroundColor Green
    & $mongodPath --dbpath="$MongoDataDir" --port 27017
} else {
    # Try alternative location
    $mongodPath = "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
    
    if (Test-Path $mongodPath) {
        Write-Host "Found MongoDB at: $mongodPath" -ForegroundColor Green
        & $mongodPath --dbpath="$MongoDataDir" --port 27017
    } else {
        Write-Host ""
        Write-Host "ERROR: Could not find MongoDB!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "1. MongoDB is installed" -ForegroundColor Yellow
        Write-Host "2. MongoDB path is correct" -ForegroundColor Yellow
        Write-Host "3. You have permissions to access the data directory" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Try running: Get-Command mongod" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}
