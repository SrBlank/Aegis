import subprocess
import os
import json
import time
import requests
from datetime import datetime
import digitalio
import busio
import board
from adafruit_epd.ssd1680 import Adafruit_SSD1680
from adafruit_epd.epd import Adafruit_EPD

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

def check_server_health(url):
    try:
        response = requests.get(url)
        if response.status_code == 200 and response.json().get('status') == 'ok':
            return 'Running'
        else:
            return 'Error'
    except requests.RequestException:
        return 'Error'

def update_display(statuses):
    display.fill(Adafruit_EPD.WHITE)
    display.set_cursor(0, 0)
    display.set_text_color(Adafruit_EPD.BLACK)
    display.set_text_wrap(True)
    display.set_text_size(1)
    for name, status in statuses.items():
        display.print(f"{name}: {status}\n")
    display.display()

if __name__ == '__main__':
    # EPD setup
    spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
    ecs = digitalio.DigitalInOut(board.CE0)
    dc = digitalio.DigitalInOut(board.D22)
    rst = digitalio.DigitalInOut(board.D27)
    busy = digitalio.DigitalInOut(board.D17)
    srcs = None

    display = Adafruit_SSD1680(122, 250, spi, cs_pin=ecs, dc_pin=dc, sramcs_pin=srcs,
                              rst_pin=rst, busy_pin=busy)

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

    # Server health check URLs
    servers = {
        'Frontend Server': f'http://localhost:{config["reactPort"]}/health',
        'Backend Server': f'http://localhost:{config["expressPort"]}/health',
        'ESP Handler Server': f'http://localhost:{config["handlerPort"]}/health'
    }

    try:
        while True:
            statuses = {name: check_server_health(url) for name, url in servers.items()}
            update_display(statuses)
            time.sleep(60)  # Check every 60 seconds
    except KeyboardInterrupt:
        log_message(frontend_log, "Stopping frontend server...")
        frontend_server.terminate()

        log_message(backend_log, "Stopping backend server...")
        backend_server.terminate()

        log_message(esp_handler_log, "Stopping ESP32 handler server...")
        esp_handler_server.terminate()

        print("All servers stopped.")
