#!/bin/bash

# --- Set up paths (making them robust) ---

# Get the full path to the directory containing *this* script.
# $0 is the script name.  `dirname "$0"` gets the directory.
# `realpath` (or `readlink -f` on some systems) makes it an absolute path,
#  handling symlinks, ".." etc.  This is *critical* for robustness.
BATCH_FILE_DIR=$(realpath "$(dirname "$0")")

# Construct the full path to the virtual environment's activate script.
# Use / instead of \ for path separators in Bash.
VENV_ACTIVATE="${BATCH_FILE_DIR}/venv/bin/activate"  # Corrected path for bash

# Construct the full path to your Python script.
PYTHON_SCRIPT="${BATCH_FILE_DIR}/src/main.py"

# --- Check if paths are valid (very good for debugging) ---

if [ ! -f "$VENV_ACTIVATE" ]; then
  echo "ERROR: Virtual environment activate script not found at: $VENV_ACTIVATE"
  read -p "Press Enter to continue..."  # Equivalent of pause
  exit 1
fi

if [ ! -f "$PYTHON_SCRIPT" ]; then
  echo "ERROR: Python script not found at: $PYTHON_SCRIPT"
  read -p "Press Enter to continue..."
  exit 1
fi

# --- Activate and Run ---

echo "Activating ENV..."
# Use 'source' or '.' to activate the environment in the current shell.
# 'call' is a batch file command, not a Bash command.
source "$VENV_ACTIVATE"
if [ $? -ne 0 ]; then  # Check the exit code ($?) of the previous command.
  echo "ERROR: Failed to activate virtual environment."
  read -p "Press Enter to continue..."
  exit 1
fi
echo "ENV Activated."

echo "Running Python script..."

# Use "python" - it should work *after* activation.
# Pass any command-line arguments.  "$@" expands to all arguments.
python "$PYTHON_SCRIPT" "$@" 2>&1
#  `2>&1` redirects standard error (file descriptor 2) to standard output (file descriptor 1),
#  so you see *all* output, including errors, in the console.  This is GOOD.

if [ $? -ne 0 ]; then
  echo "ERROR: Python script execution failed."
  read -p "Press Enter to continue..."
  exit 1
fi

echo "Script completed successfully."
exit 0