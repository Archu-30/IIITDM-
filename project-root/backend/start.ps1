# PowerShell start script for backend — kills any process on port 5000 first
$port = 5000
$existing = netstat -ano | findstr ":$port " | Select-String 'LISTENING'
if ($existing) {
    $pid = ($existing -split '\s+')[-1]
    Write-Host "Killing existing process $pid on port $port..."
    taskkill /F /PID $pid 2>$null
    Start-Sleep -Seconds 1
}
Write-Host "Starting backend server..."
node server.js
