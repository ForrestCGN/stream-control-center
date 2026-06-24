@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "STEP_ZIP=%~1"
set "STEP_DESC=%~2"

if "%STEP_DESC%"=="" set "STEP_DESC=Test-Deploy"

if "%STEP_ZIP%"=="" (
  echo.
  echo ============================================================
  echo [installstep] Keine ZIP angegeben. Suche neueste ZIP im Downloads-Ordner.
  echo ============================================================
  for /f "usebackq delims=" %%Z in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=Join-Path $env:USERPROFILE 'Downloads'; if(Test-Path $d){ Get-ChildItem -LiteralPath $d -Filter '*.zip' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName }"`) do set "STEP_ZIP=%%Z"
  if "!STEP_ZIP!"=="" (
    echo [error] Keine ZIP im Downloads-Ordner gefunden.
    echo Nutzung: .\installstep.cmd "%%USERPROFILE%%\Downloads\DATEI.zip" "Beschreibung"
    exit /b 1
  )
  echo Gefundene ZIP: !STEP_ZIP!
  choice /C JN /M "Diese ZIP installieren und Test-Deploy starten? J/N"
  if errorlevel 2 (
    echo Abgebrochen.
    exit /b 0
  )
)

if not exist "%STEP_ZIP%" (
  echo [error] ZIP nicht gefunden: %STEP_ZIP%
  exit /b 1
)

if not exist ".git" (
  echo [error] Dieses Script muss im Repo-Root ausgefuehrt werden: D:\Git\stream-control-center
  exit /b 1
)

echo.
echo ============================================================
echo [installstep] ZIP pruefen und ins Repo entpacken
echo ============================================================
echo ZIP: %STEP_ZIP%
echo Ziel: %CD%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$zip=$env:STEP_ZIP; $repo=(Get-Location).Path;" ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "$archive=[System.IO.Compression.ZipFile]::OpenRead($zip);" ^
  "try {" ^
  "  $bad=$archive.Entries | Where-Object { $_.FullName -match '(^|/)(\.git/|node_modules/|data/|secrets/)' -or $_.FullName -match '(^|/)\.env($|\.)' -or $_.FullName -match '\.sqlite3?$|\.db$|\.zip$|\.7z$|\.bak$|\.old$|\.tmp$|\.temp$' -or $_.FullName -match '(^|/).*\.ps1$' -and $_.FullName -match 'apply|patch' -or $_.FullName -match '\.\.' };" ^
  "  if($bad){ Write-Host '[error] Blockierte/unsichere ZIP-Eintraege:' -ForegroundColor Red; $bad | Select-Object -ExpandProperty FullName; exit 10 }" ^
  "} finally { $archive.Dispose() }" ^
  "Expand-Archive -LiteralPath $zip -DestinationPath $repo -Force;" ^
  "Write-Host '[ok] ZIP wurde ins Repo entpackt.'"
if errorlevel 1 exit /b 1

echo.
echo ============================================================
echo [installstep] Starte Test-Deploy ohne GitHub-Push
echo ============================================================
call "%~dp0testdeploy.cmd" "%STEP_DESC%"
exit /b %ERRORLEVEL%
