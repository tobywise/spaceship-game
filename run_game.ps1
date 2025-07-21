# Activate venv
$venvPath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    & $venvPath
} else {
    Write-Host "Virtual environment not found at $venvPath"
    exit 1
}

# Run local-data-storage in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $(Get-Location); local-data-storage"

# Start local web server (serves files from project root) in another new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $(Get-Location); python -m http.server 8000"