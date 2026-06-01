$tenantId = "23cf3d56-3e1a-4888-8830-e6ed670099ec"
$clientId = "a4974c1b-0c48-40b0-974c-de4e8ebcd85c"
$environmentId = $tenantId  # default Dataverse env
$region = "unitedstates"  # default

function Get-DeviceCodeToken {
  param($tenantId, $clientId)
  $deviceCode = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/devicecode" -Body @{
    client_id = $clientId
    scope = "https://management.azure.com/.default offline_access"
  }
  Write-Host "`nGo to: https://microsoft.com/devicelogin" -ForegroundColor Cyan
  Write-Host "Enter code: $($deviceCode.user_code)" -ForegroundColor Yellow
  Read-Host "Press Enter after you've authenticated"
  do {
    Start-Sleep -Seconds $deviceCode.interval
    try {
      $token = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -Body @{
        client_id = $clientId
        grant_type = "urn:ietf:params:oauth:grant-type:device_code"
        device_code = $deviceCode.device_code
      }
      return $token.access_token
    } catch { }
  } while ($true)
}

function New-FlowDefinition {
  param($displayName, $description, $triggerSchema, $emailSubject, $emailBodyHtml)
  $flowName = $displayName -replace '\s',''
  $apiUrl = "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/$environmentId/flows/$flowName`?api-version=2016-11-01"

  $definition = @{
    properties = @{
      displayName = $displayName
      definition = @{
        $schema = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json"
        contentVersion = "1.0.0.0"
        triggers = @{
          manual = @{
            type = "Request"
            kind = "Http"
            inputs = @{
              schema = $triggerSchema
            }
          }
        }
        actions = @{
          Send_email = @{
            type = "ApiConnection"
            inputs = @{
              host = @{
                connectionName = "shared_office365"
                operationId = "SendEmail"
                apiId = "/providers/Microsoft.PowerApps/apis/shared_office365"
              }
              parameters = @{
                emailTo = "@{triggerBody()?['email']}"
                emailSubject = $emailSubject
                emailBody = $emailBodyHtml
                isHtml = $true
              }
              authentication = @{
                type = "Raw"
                value = "@{listCallbackUrl()}"
              }
            }
          }
        }
      }
      state = "Started"
    }
    location = $region
  }

  return @{url=$apiUrl; definition=$definition}
}

Write-Host "=== Power Automate Flow Creator ===" -ForegroundColor Green

# Get token
$token = Get-DeviceCodeToken -tenantId $tenantId -clientId $clientId
$headers = @{Authorization="Bearer $token";"Content-Type"="application/json"}

Write-Host "`nAuthenticated! Creating flows..." -ForegroundColor Green

# Flow 1: Welcome Email
Write-Host "Creating 'LevelFit Welcome Email'..." -ForegroundColor Cyan
$welcomeSchema = @{
  type = "object"
  properties = @{
    email = @{type="string"}
    firstName = @{type="string"}
    appName = @{type="string"}
  }
  required = @("email","firstName")
}
$welcomeBody = @"
<body style='font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px'>
<div style='max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px'>
<h1 style='color:#f97316'>Welcome!</h1>
<p>You're all set.</p>
<a href='https://levelfitcoach.com/login' style='display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:12px;text-decoration:none'>Log in now</a>
</div></body>
"@
$flow1 = New-FlowDefinition -displayName "LevelFit Welcome Email" -description "Send welcome email" -triggerSchema $welcomeSchema -emailSubject "Welcome to LevelFit!" -emailBodyHtml $welcomeBody
try {
  $result = Invoke-RestMethod -Method Put -Uri $flow1.url -Headers $headers -Body ($flow1.definition | ConvertTo-Json -Depth 10)
  Write-Host "  Welcome Email: Created!" -ForegroundColor Green
} catch { Write-Host "  Welcome Email: $_" -ForegroundColor Red }

# Flow 2: Invite Email
Write-Host "Creating 'LevelFit Invite Email'..." -ForegroundColor Cyan
$inviteSchema = @{
  type = "object"
  properties = @{
    email = @{type="string"}
    firstName = @{type="string"}
    inviterName = @{type="string"}
    acceptUrl = @{type="string"}
  }
  required = @("email","firstName","acceptUrl")
}
$inviteBody = @"
<body style='font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px'>
<div style='max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px'>
<a href='https://levelfitcoach.com/accept-invite' style='background:#38bdf8;color:#0b1020;padding:12px 24px;border-radius:12px;text-decoration:none'>Accept invite</a>
</div></body>
"@
$flow2 = New-FlowDefinition -displayName "LevelFit Invite Email" -description "Send invite email" -triggerSchema $inviteSchema -emailSubject "You're invited to LevelFit!" -emailBodyHtml $inviteBody
try {
  $result = Invoke-RestMethod -Method Put -Uri $flow2.url -Headers $headers -Body ($flow2.definition | ConvertTo-Json -Depth 10)
  Write-Host "  Invite Email: Created!" -ForegroundColor Green
} catch { Write-Host "  Invite Email: $_" -ForegroundColor Red }

# Flow 3: Password Reset
Write-Host "Creating 'LevelFit Password Reset'..." -ForegroundColor Cyan
$resetSchema = @{
  type = "object"
  properties = @{
    email = @{type="string"}
    firstName = @{type="string"}
    resetUrl = @{type="string"}
  }
  required = @("email","resetUrl")
}
$resetBody = @"
<body style='font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px'>
<div style='max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px'>
<a href='https://levelfitcoach.com/reset-password' style='background:#f97316;color:white;padding:12px 24px;border-radius:12px;text-decoration:none'>Reset password</a>
</div></body>
"@
$flow3 = New-FlowDefinition -displayName "LevelFit Password Reset" -description "Send password reset email" -triggerSchema $resetSchema -emailSubject "Reset your LevelFit password" -emailBodyHtml $resetBody
try {
  $result = Invoke-RestMethod -Method Put -Uri $flow3.url -Headers $headers -Body ($flow3.definition | ConvertTo-Json -Depth 10)
  Write-Host "  Password Reset: Created!" -ForegroundColor Green
} catch { Write-Host "  Password Reset: $_" -ForegroundColor Red }

# Flow 4: Payment Receipt
Write-Host "Creating 'LevelFit Payment Receipt'..." -ForegroundColor Cyan
$paymentSchema = @{
  type = "object"
  properties = @{
    email = @{type="string"}
    firstName = @{type="string"}
    packageName = @{type="string"}
    amount = @{type="string"}
    date = @{type="string"}
  }
  required = @("email","firstName","packageName","amount")
}
$paymentBody = @"
<body style='font-family:Inter,sans-serif;background:#0b1020;color:#f0ede5;padding:40px'>
<div style='max-width:560px;margin:auto;background:#1a1f2e;border-radius:16px;padding:32px'>
<h1>Payment receipt</h1>
<p>Thanks for your payment!</p>
</div></body>
"@
$flow4 = New-FlowDefinition -displayName "LevelFit Payment Receipt" -description "Send payment receipt" -triggerSchema $paymentSchema -emailSubject "Your LevelFit receipt" -emailBodyHtml $paymentBody
try {
  $result = Invoke-RestMethod -Method Put -Uri $flow4.url -Headers $headers -Body ($flow4.definition | ConvertTo-Json -Depth 10)
  Write-Host "  Payment Receipt: Created!" -ForegroundColor Green
} catch { Write-Host "  Payment Receipt: $_" -ForegroundColor Red }

Write-Host "`nDone!" -ForegroundColor Green
