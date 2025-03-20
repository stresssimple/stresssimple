@echo off

:: --- Set up paths (making them robust) ---

:: Get the full path to the directory containing *this* batch file.
::  %~dp0  expands to the drive and path of the batch file (including the trailing backslash).
set "BATCH_FILE_DIR=%~dp0"

:: Construct the full path to the virtual environment's activate script.
set "VENV_ACTIVATE="%BATCH_FILE_DIR%venv\Scripts\activate.bat""

:: Construct the full path to your Python script.
set "PYTHON_SCRIPT="%BATCH_FILE_DIR%src\main.py""

:: --- Check if paths are valid (very good for debugging) ---

if not exist %VENV_ACTIVATE% (
    echo ERROR: Virtual environment activate script not found at: %VENV_ACTIVATE%
    pause
    exit /b 1
)

if not exist %PYTHON_SCRIPT% (
    echo ERROR: Python script not found at: %PYTHON_SCRIPT%
    pause
    exit /b 1
)

:: --- Activate and Run (using CALL) ---

echo Activating ENV...
call %VENV_ACTIVATE%
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b 1
)
echo ENV Activated.

echo Running Python script...

:: Use "python" - it should work *after* activation.  If you had a global Python installation
:: and the venv's python is different, you *could* use the full path to the venv's python.exe:
:: "%BATCH_FILE_DIR%venv\Scripts\python.exe" "%PYTHON_SCRIPT%"
python %PYTHON_SCRIPT% %1 %2 2>&1


if errorlevel 1 (
    echo ERROR: Python script execution failed.
    pause
    exit /b 1
)

echo Script completed successfully.
pause
exit /b 0