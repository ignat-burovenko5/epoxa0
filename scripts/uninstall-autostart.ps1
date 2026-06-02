# Remove Windows autostart scheduled task.
# Usage: npm run site:autostart-uninstall
$ErrorActionPreference = "Stop"

$TaskName = "Siteaudit-Website"
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $existing) {
    Write-Host "Task not found: $TaskName (already removed?)"
    exit 0
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Removed scheduled task: $TaskName"
