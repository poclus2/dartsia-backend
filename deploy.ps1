# Deploy Sia Nexus Backend on Windows

Write-Host "Starting Deployment..."

# 1. Stop existing containers
docker-compose down

# 2. Build and Start
Write-Host "Building and Starting Containers..."
docker-compose up -d --build

# 3. Wait for DB
Write-Host "Waiting for services to initialize... (30s)"
Start-Sleep -Seconds 30

# 4. Verify Services
$response = Invoke-WebRequest -Uri "http://localhost:3000/v1/explorer/blocks/tip" -Headers @{ "x-api-key" = "secret" } -UseBasicParsing
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Gateway & Explorer are Online!"
    Write-Host "Tip Block: $($response.Content)"
} else {
    Write-Error "❌ Gateway check failed."
}

Write-Host "Deployment Complete. Use 'docker-compose logs -f worker' to monitor ingestion."
