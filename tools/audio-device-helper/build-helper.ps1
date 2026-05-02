$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "[AudioDeviceHelper] restore..."
dotnet restore

Write-Host "[AudioDeviceHelper] publish..."
dotnet publish -c Release -r win-x64 --self-contained false -o dist

$exe = Join-Path $scriptDir "dist\AudioDeviceHelper.exe"
if (!(Test-Path $exe)) {
    throw "AudioDeviceHelper.exe wurde nicht erstellt: $exe"
}

Write-Host "[AudioDeviceHelper] OK: $exe"
Write-Host "[AudioDeviceHelper] Test:"
& $exe version --json
