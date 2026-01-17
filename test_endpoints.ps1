$Headers = @{ "x-api-key" = "secret" }

function Test-Endpoint {
    param($Name, $Url)
    Write-Host "Testing $Name ($Url)..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK]" -ForegroundColor Green
            # Write-Host $response.Content
        }
        else {
            Write-Host " [Unchanged]" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "--- DIRECT SERVICE ACCESS (Internal Ports) ---"
Test-Endpoint "Explorer (Direct)" "http://localhost:3001/api/blocks/tip"
Test-Endpoint "Analytics (Direct)" "http://localhost:3002/api/analytics/network"

Write-Host "`n--- GATEWAY ACCESS (Public Port 3000) ---"
Test-Endpoint "Explorer (via Gateway)" "http://localhost:3000/v1/explorer/api/blocks/tip"
Test-Endpoint "Analytics (via Gateway)" "http://localhost:3000/v1/analytics/api/analytics/network"
Test-Endpoint "Top Hosts (via Gateway)" "http://localhost:3000/v1/analytics/api/analytics/hosts/top"
