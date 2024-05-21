import os
import time
import requests

# Load configuration
with open('config.json') as config_file:
    config = json.load(config_file)

# SSID and password of the original WiFi for reconnection Raspberry Pi
original_ssid = config["SSID"]
original_password = config["PASSWD"]
AP_ssid = config.AP_SSID
AP_password = config.AP_PASSWD

# Connect to the ESP32 AP
os.system(f'nmcli device wifi connect {AP_ssid} password {AP_password}')
# Open a web browser to the ESP32 configuration page
os.system(f'xdg-open http://{config[AP_CONFIG]}')

# Programmatically send WiFi credentials to the ESP32
url = f'http://{config[AP_CONFIG]}/configure'
data = {
    'ssid': original_ssid,
    'password': original_password
}
response = requests.post(url, data=data)
print(response.text)

# Wait for ESP32 to connect to WiFi
time.sleep(10)  # Adjust this delay as necessary

# Reconnect to the original WiFi network
os.system(f'nmcli device wifi connect {original_ssid} password {original_password}')
