@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%CD%"
set "LIVE_ROOT=D:\Streaming\stramAssets"

set "FILES=diagnostics_generic_details.js diagnostics_hug_display_fix.js birthday_readonly_diagnostics.css birthday_readonly_diagnostics.js birthday_readonly_safety_ext.css birthday_readonly_safety_ext.js message_rotator_readonly_diagnostics.css message_rotator_readonly_diagnostics.js tagebuch_readonly_diagnostics.css tagebuch_readonly_diagnostics.js todo_readonly_diagnostics.css todo_readonly_diagnostics.js"
set "PATTERNS=diagnostics_generic_details diagnostics_hug_display_fix birthday_readonly_diagnostics birthday_readonly_safety_ext message_rotator_readonly_diagnostics tagebuch_readonly_diagnostics todo_readonly_diagnostics"

set "REPO_MODULES=%ROOT%\htdocs\dashboard\modules"
set "REPO_INDEX=%ROOT%\htdocs\dashboard\index.html"
set "LIVE_MODULES=%LIVE_ROOT%\htdocs\dashboard\modules"
set "LIVE_INDEX=%LIVE_ROOT%\htdocs\dashboard\index.html"

set /a repoFound=0
set /a liveFound=0
set /a repoRefs=0
set /a liveRefs=0

echo.
echo ============================================================
echo CAN-42.31 Diagnose-Cleanup Verifikation
echo ============================================================
echo Repo: %ROOT%
echo Live: %LIVE_ROOT%
echo.

echo [1/5] Lokale Repo-Dateien pruefen...
if not exist "%REPO_MODULES%" (
  echo WARNUNG: Repo-Modulordner nicht gefunden: %REPO_MODULES%
) else (
  for %%F in (%FILES%) do (
    if exist "%REPO_MODULES%\%%F" (
      echo   GEFUNDEN: htdocs\dashboard\modules\%%F
      set /a repoFound+=1
    )
  )
  if !repoFound! EQU 0 echo   OK: Keine alten Cleanup-Kandidaten im lokalen Repo gefunden.
)
echo.

echo [2/5] Lokale index.html Referenzen pruefen...
if exist "%REPO_INDEX%" (
  for %%P in (%PATTERNS%) do (
    findstr /I /C:"%%P" "%REPO_INDEX%" >nul 2>nul
    if !errorlevel! EQU 0 (
      echo   REFERENZ GEFUNDEN: %%P
      set /a repoRefs+=1
    )
  )
  if !repoRefs! EQU 0 echo   OK: Keine alten Diagnose-Referenzen in lokaler index.html gefunden.
) else (
  echo WARNUNG: Lokale index.html nicht gefunden: %REPO_INDEX%
)
echo.

echo [3/5] Git-Status anzeigen...
where git >nul 2>nul
if !errorlevel! EQU 0 (
  git status --short
) else (
  echo WARNUNG: git wurde nicht gefunden.
)
echo.

echo [4/5] Live-Dateien pruefen...
if not exist "%LIVE_MODULES%" (
  echo HINWEIS: Live-Modulordner nicht gefunden: %LIVE_MODULES%
) else (
  for %%F in (%FILES%) do (
    if exist "%LIVE_MODULES%\%%F" (
      echo   LIVE GEFUNDEN: htdocs\dashboard\modules\%%F
      set /a liveFound+=1
    )
  )
  if !liveFound! EQU 0 echo   OK: Keine alten Cleanup-Kandidaten im Live-Modulordner gefunden.
)
echo.

echo [5/5] Live index.html Referenzen pruefen...
if exist "%LIVE_INDEX%" (
  for %%P in (%PATTERNS%) do (
    findstr /I /C:"%%P" "%LIVE_INDEX%" >nul 2>nul
    if !errorlevel! EQU 0 (
      echo   LIVE-REFERENZ GEFUNDEN: %%P
      set /a liveRefs+=1
    )
  )
  if !liveRefs! EQU 0 echo   OK: Keine alten Diagnose-Referenzen in Live-index.html gefunden.
) else (
  echo HINWEIS: Live-index.html nicht gefunden: %LIVE_INDEX%
)
echo.

echo ============================================================
echo Ergebnis
echo ============================================================
echo Lokale Altdateien:     !repoFound!
echo Lokale Alt-Referenzen: !repoRefs!
echo Live-Altdateien:       !liveFound!
echo Live-Alt-Referenzen:   !liveRefs!
echo.
if !repoFound! GTR 0 echo HINWEIS: Lokal zuerst CAN-42.30 Cleanup ausfuehren.
if !repoRefs! GTR 0 echo HINWEIS: Lokale index.html enthaelt noch alte Referenzen.
if !liveFound! GTR 0 echo HINWEIS: Live ist noch nicht bereinigt oder noch nicht aktualisiert.
if !liveRefs! GTR 0 echo HINWEIS: Live-index.html enthaelt noch alte Referenzen.
if !repoFound! EQU 0 if !repoRefs! EQU 0 echo Repo-Cleanup sieht sauber aus.
if !liveFound! EQU 0 if !liveRefs! EQU 0 echo Live-Cleanup sieht sauber aus.
echo.
echo Naechste Schritte bei sauberem Repo:
echo   02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd
echo Danach Live aktualisieren:
echo   01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
echo.

endlocal
