# AutoShout Diagnose
# Ausführen im PowerShell-Fenster.
# Es wird nichts am System geändert.

$OutFile = "D:\Streaming\stramAssets\logs\autoshout_diagnose.txt"

New-Item -ItemType Directory -Force -Path (Split-Path $OutFile) | Out-Null

"===== AutoShout Diagnose =====" | Out-File $OutFile -Encoding UTF8
"Zeit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File $OutFile -Append -Encoding UTF8
"" | Out-File $OutFile -Append -Encoding UTF8

"===== /api/clip-shoutout/status Kurzstatus =====" | Out-File $OutFile -Append -Encoding UTF8
try {
    $s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
    $s | Select-Object ok,module,moduleVersion,enabled,directChatCommandBypassInstalled,registeredCommand | Format-List | Out-String | Out-File $OutFile -Append -Encoding UTF8

    "" | Out-File $OutFile -Append -Encoding UTF8
    "===== AutoShout Config =====" | Out-File $OutFile -Append -Encoding UTF8
    $s.config.autoShoutout | Select-Object enabled,configSource,jsonFallbackUsed,onlyWhenLive,triggerOnFirstMessageOnly,minMessagesBeforeTrigger,instantTriggerMessagesEnabled,instantTriggerMessages,streamers | Format-List | Out-String | Out-File $OutFile -Append -Encoding UTF8

    "" | Out-File $OutFile -Append -Encoding UTF8
    "===== AutoShout Status =====" | Out-File $OutFile -Append -Encoding UTF8
    $s.autoShoutout | ConvertTo-Json -Depth 8 | Out-File $OutFile -Append -Encoding UTF8
}
catch {
    "FEHLER bei /api/clip-shoutout/status:" | Out-File $OutFile -Append -Encoding UTF8
    $_ | Out-String | Out-File $OutFile -Append -Encoding UTF8
}

"" | Out-File $OutFile -Append -Encoding UTF8
"===== /api/clip-shoutout/auto/settings =====" | Out-File $OutFile -Append -Encoding UTF8
try {
    Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/settings" | ConvertTo-Json -Depth 8 | Out-File $OutFile -Append -Encoding UTF8
}
catch {
    "FEHLER bei /api/clip-shoutout/auto/settings:" | Out-File $OutFile -Append -Encoding UTF8
    $_ | Out-String | Out-File $OutFile -Append -Encoding UTF8
}

"" | Out-File $OutFile -Append -Encoding UTF8
"===== AutoShout Test-Chat Dry-Run =====" | Out-File $OutFile -Append -Encoding UTF8
try {
    $body = @{
      login = "urlug"
      displayName = "Urlug"
      message = "Hallo"
    } | ConvertTo-Json

    Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 12 | Out-File $OutFile -Append -Encoding UTF8
}
catch {
    "FEHLER bei /api/clip-shoutout/auto/test-chat:" | Out-File $OutFile -Append -Encoding UTF8
    $_ | Out-String | Out-File $OutFile -Append -Encoding UTF8
}

"" | Out-File $OutFile -Append -Encoding UTF8
"===== Fertig =====" | Out-File $OutFile -Append -Encoding UTF8
"Logdatei: $OutFile" | Out-File $OutFile -Append -Encoding UTF8

Write-Host "AutoShout Diagnose fertig."
Write-Host "Logdatei: $OutFile"
