import os
import subprocess
import sys

# Activate venv (Windows)
venv_activate = os.path.join('.', 'venv', 'Scripts', 'activate.bat')
if not os.path.exists(venv_activate):
    print(f"Virtual environment not found at {venv_activate}")
    sys.exit(1)

# Activate venv for subprocesses
venv_python = os.path.join('.', 'venv', 'Scripts', 'python.exe')

# Run local-data-storage in a new terminal window
subprocess.Popen([
    "start", "cmd", "/k", f'"{venv_python}" -m local-data-storage'
], shell=True)

# Start local web server in another new terminal window
subprocess.Popen([
    "start", "cmd", "/k", f'"{venv_python}" -m http.server 8000'
], shell=True)

print("Servers started in new windows. Press Enter to exit this script.")
input()