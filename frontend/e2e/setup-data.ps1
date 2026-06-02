$coachEmail = "ps-coach-$(Get-Random)@levelfitest.com"
$clientEmail = "ps-client-$(Get-Random)@levelfitest.com"
$password = "TestPass123!"

# Signup coach
$signupBody = @{
  email           = $coachEmail
  password        = $password
  confirmPassword = $password
  role            = "coach"
  firstName       = "PS"
  lastName        = "Coach"
} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://api-production-c73f.up.railway.app/api/auth/signup" -Method Post -ContentType "application/json" -Body $signupBody
$token = $r.accessToken

# Invite client
$inviteBody = @{
  email     = $clientEmail
  firstName = "E2E"
  lastName  = "Client"
} | ConvertTo-Json
$r2 = Invoke-RestMethod -Uri "https://api-production-c73f.up.railway.app/api/auth/invites" -Method Post -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body $inviteBody

# Save to JSON for Playwright
@{
  acceptUrl   = $r2.acceptUrl
  clientEmail = $clientEmail
  password    = $password
} | ConvertTo-Json | Set-Content "e2e\test-data.json"
Write-Host "Data saved to e2e\test-data.json"
Write-Host "Accept URL: $($r2.acceptUrl)"
