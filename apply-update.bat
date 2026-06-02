@echo off
setlocal enabledelayedexpansion
REM ============================================================
REM  hermes-web-ui portable self-updater (Windows)
REM  ----------------------------------------------------------
REM  Launched DETACHED from the running server (controllers/update.ts)
REM  via WMI Win32_Process.Create (so it is parented to WmiPrvSE, not
REM  this server's process tree). It stops the server, copies the new
REM  files over the install folder, then relaunches via start.bat.
REM
REM  Values are baked in as `set` lines prepended by the server, or
REM  passed as positional args (dev/direct). Baked values win.
REM    %1 SOURCE_DIR   extracted new files (deleted after copy)
REM    %2 INSTALL_DIR  install folder to overwrite (additive copy)
REM    %3 NODE_EXE     node executable used to relaunch (fallback)
REM    %4 CLI_MJS      bin\hermes-web-ui.mjs entry point (fallback)
REM    %5 PORT         server port (waited on until released)
REM    %6 SERVER_PID   pid of the server to stop before copying
REM
REM  User data lives in a sibling data\ folder and is never touched.
REM  The ~200MB bundled python and node_modules are preserved (the
REM  release omits them; no /PURGE / no /MIR).
REM
REM  NOTE: logging is INLINE on purpose. A `call :log` subroutine was
REM  found to die mid-run on the real (large) copy; inline `(echo)>>`
REM  has no label navigation and is reliable.
REM ============================================================

if not defined SOURCE set "SOURCE=%~1"
if not defined INSTALL set "INSTALL=%~2"
if not defined NODE set "NODE=%~3"
if not defined CLI set "CLI=%~4"
if not defined PORT set "PORT=%~5"
if not defined SERVERPID set "SERVERPID=%~6"

set "LOG=%INSTALL%\apply-update.log"
(echo [%DATE% %TIME%] apply-update start source=%SOURCE% install=%INSTALL% pid=%SERVERPID% port=%PORT%)>>"%LOG%"

if "%SOURCE%"=="" exit /b 1
if "%INSTALL%"=="" exit /b 1
if not exist "%SOURCE%" (
    (echo [%DATE% %TIME%] ERROR: source folder missing, abort)>>"%LOG%"
    exit /b 1
)

REM --- 1) Stop the running server (kill ONLY its PID, not the tree) ---
if not "%SERVERPID%"=="" (
    (echo [%DATE% %TIME%] stopping server pid %SERVERPID%)>>"%LOG%"
    taskkill /PID %SERVERPID% /F >nul 2>&1
)

REM --- Wait up to ~30s for the port to be released ---
set /a TRIES=0
:waitport
powershell -NoProfile -Command "if(Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue){exit 1}else{exit 0}"
if errorlevel 1 (
    set /a TRIES+=1
    if !TRIES! lss 30 (
        timeout /t 1 /nobreak >nul
        goto waitport
    )
)

timeout /t 2 /nobreak >nul
(echo [%DATE% %TIME%] port released, starting robocopy)>>"%LOG%"

REM --- 2) Copy new files over the install folder (additive, no purge) ---
robocopy "%SOURCE%" "%INSTALL%" /E /NFL /NDL /NP /R:1 /W:1 >>"%LOG%.robocopy.txt" 2>&1
set "RC=%ERRORLEVEL%"
(echo [%DATE% %TIME%] robocopy returned code !RC!)>>"%LOG%"
if !RC! geq 8 (
    (echo [%DATE% %TIME%] ERROR: robocopy failed code !RC!)>>"%LOG%"
    exit /b !RC!
)

REM --- 3) Remove the staging folder ---
rmdir /s /q "%SOURCE%" >nul 2>&1
(echo [%DATE% %TIME%] staging removed, relaunching)>>"%LOG%"

REM --- 4) Relaunch via the portable start.bat (rebuilds full env) ---
for %%I in ("%INSTALL%\..") do set "PORTABLE_BASE=%%~fI"
if exist "%PORTABLE_BASE%\start.bat" (
    (echo [%DATE% %TIME%] relaunch via start.bat %PORTABLE_BASE%\start.bat)>>"%LOG%"
    call "%PORTABLE_BASE%\start.bat" < nul
) else (
    cd /d "%INSTALL%"
    (echo [%DATE% %TIME%] relaunch via CLI %NODE% %CLI% start)>>"%LOG%"
    "%NODE%" "%CLI%" start
)
(echo [%DATE% %TIME%] relaunch invoked, apply-update done)>>"%LOG%"

endlocal
exit /b 0
