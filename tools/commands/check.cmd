@echo off
setlocal

cd /d "%~dp0\..\.."

echo.
echo [check] Repo: %CD%
echo [check] Fuehre schnelle Repo-/Syntaxpruefung aus.
echo.

git status --short
if errorlevel 1 goto :fail

echo.
git log -5 --oneline
if errorlevel 1 goto :fail

echo.
echo [check] JS-Syntaxchecks fuer bekannte aktive Module...
echo.

if exist "backend\modules\hug.js" node -c "backend\modules\hug.js"
if errorlevel 1 goto :fail

if exist "htdocs\dashboard\modules\hug.js" node -c "htdocs\dashboard\modules\hug.js"
if errorlevel 1 goto :fail

if exist "htdocs\dashboard\modules\tagebuch.js" node -c "htdocs\dashboard\modules\tagebuch.js"
if errorlevel 1 goto :fail

if exist "htdocs\dashboard\modules\todo.js" node -c "htdocs\dashboard\modules\todo.js"
if errorlevel 1 goto :fail

if exist "htdocs\dashboard\modules\vip.js" node -c "htdocs\dashboard\modules\vip.js"
if errorlevel 1 goto :fail

echo.
echo [check] Fertig. Keine Syntaxfehler in den geprueften Dateien.
endlocal & exit /b 0

:fail
set "EXITCODE=%ERRORLEVEL%"
echo.
echo [check] Fehler. ExitCode=%EXITCODE%
endlocal & exit /b %EXITCODE%
