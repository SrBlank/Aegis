import subprocess
import os
import json
from datetime import datetime

# Load configuration
with open('config.json') as config_file:
    config = json.load(config_file)

# Paths to server directories and files
RPI_SERVER_FRONTEND_PATH = config["RPI_SERVER_FRONTEND_PATH"]
RPI_SERVER_BACKEND_PATH = config["RPI_SERVER_BACKEND_PATH"]
RPI_SERVER_HANDLER_PATH = config["RPI_SERVER_HANDLER_PATH"]

# Define log directory
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

# Define log files
frontend_log = os.path.join(log_dir, "frontend_server.log")
backend_log = os.path.join(log_dir, "backend_server.log")
esp_handler_log = os.path.join(log_dir, "esp_handler_server.log")

# Create or clear log files
open(frontend_log, 'w').close()
open(backend_log, 'w').close()
open(esp_handler_log, 'w').close()

def log_message(log_file, message):
    with open(log_file, 'a') as log:
        log.write(f"{datetime.now()}: {message}\n")

def start_server(command, log_file):
    process = subprocess.Popen(
        command,
        shell=True,
        cwd=os.path.dirname(log_file),  # Change working directory to the location of the log file
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True
    )

    with open(log_file, 'a') as log:
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
                log.write(output)

            error = process.stderr.readline()
            if error:
                print(error.strip())
                log.write(error)
                
    return process

if __name__ == '__main__':
    # Commands to start each server
    frontend_command = f"npm start --prefix {RPI_SERVER_FRONTEND_PATH}"
    backend_command = f"nodemon {RPI_SERVER_BACKEND_PATH}"
    esp_handler_command = f"python3 {RPI_SERVER_HANDLER_PATH}"

    # Start each server
    log_message(frontend_log, "Starting frontend server...")
    frontend_server = start_server(frontend_command, frontend_log)

    log_message(backend_log, "Starting backend server...")
    backend_server = start_server(backend_command, backend_log)

    log_message(esp_handler_log, "Starting ESP32 handler server...")
    esp_handler_server = start_server(esp_handler_command, esp_handler_log)

    try:
        while True:
            pass  # Keep the script running to monitor the servers
    except KeyboardInterrupt:
        log_message(frontend_log, "Stopping frontend server...")
        frontend_server.terminate()

        log_message(backend_log, "Stopping backend server...")
        backend_server.terminate()

        log_message(esp_handler_log, "Stopping ESP32 handler server...")
        esp_handler_server.terminate()

        print("All servers stopped.")
