# Register Windows scheduled task: start site services at user logon (background).
# Usage: npm run site:autostart-install
$ErrorActionPreference = "Stop"

$TaskName = "Siteaudit-Website"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$StartScript = Join-Path $Root "scripts\start-all.mjs"

function Get-SystemNode {
    $candidates = @(
        "$env:ProgramFiles\nodejs\node.exe",
        "${env:ProgramFiles(x86)}\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\node\node.exe"
    )
    foreach ($p in $candidates) {
        if (Test-Path $p) { return (Resolve-Path $p).Path }
    }
    $fromPath = (Get-Command node -All -ErrorAction SilentlyContinue | ForEach-Object { $_.Source }) |
        Where-Object { $_ -and $_ -notmatch 'cursor|Code\\' }
    if ($fromPath) { return $fromPath[0] }
    return (Get-Command node -ErrorAction Stop).Source
}

$Node = Get-SystemNode
Write-Host "Using Node: $Node"

$Action = New-ScheduledTaskAction `
    -Execute $Node `
    -Argument "`"$StartScript`"" `
    -WorkingDirectory $Root

# Logon + 1 min delay so network and drives are ready
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$Trigger.Delay = "PT1M"

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Start siteaudit (Django :8000, Next :3000 and :6854) in background at logon." `
    -Force | Out-Null

Write-Host "Installed scheduled task: $TaskName"
Write-Host "  Runs at logon (1 min delay), working dir: $Root"
Write-Host "  Remove with: npm run site:autostart-uninstall"
