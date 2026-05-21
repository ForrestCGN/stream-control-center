@echo off
setlocal
cd /d "%~dp0..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.ps1" %*
endlocal
