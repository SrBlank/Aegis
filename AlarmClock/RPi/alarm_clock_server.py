import json
import requests
import schedule
import time
from datetime import datetime
import pygame
import RPi.GPIO as GPIO

# Load configuration
with open('config.json') as config_file:
    config = json.load(config_file)

API_URL = f'http://{config["deviceIP"]}:{config["expressPort"]}/api/alarms'
DEVICE_ID = 'your-device-id'
HEARTBEAT_INTERVAL = 60  # Send heartbeat every 60 seconds
BUTTON_PIN = 17  # GPIO pin number for the button

def initialize_sound():
    pygame.mixer.init()

def initialize_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.add_event_detect(BUTTON_PIN, GPIO.FALLING)

def fetch_alarms():
    response = requests.get(API_URL)
    return response.json()

def toggle_alarm(alarm_id):
    toggle_url = f'{API_URL}/{alarm_id}/toggle'
    requests.patch(toggle_url)

def play_alarm(sound):
    pygame.mixer.music.load(sound)
    pygame.mixer.music.play(-1) 

    start_time = time.time()
    while time.time() - start_time < 60:
        if GPIO.event_detected(BUTTON_PIN):
            break
        time.sleep(0.1)  # Check every 100ms

    pygame.mixer.music.stop()

def schedule_alarm(alarm):
    alarm_time = alarm['time']
    alarm_days = alarm['days']
    sound = alarm['sound']

    if 'None' in alarm_days:
        schedule_alarm_once(alarm_time, sound, alarm['_id'])
    else:
        for day in alarm_days:
            schedule.every().day.at(alarm_time).do(play_alarm, sound)

def schedule_alarm_once(alarm_time, sound, alarm_id):
    target_time = datetime.strptime(alarm_time, "%H:%M").time()
    current_time = datetime.now().time()

    if target_time > current_time:
        schedule_time = f"{target_time.hour}:{target_time.minute}"
        schedule.every().day.at(schedule_time).do(play_and_toggle, sound, alarm_id)

def play_and_toggle(sound, alarm_id):
    play_alarm(sound)
    toggle_alarm(alarm_id)

def send_heartbeat():
    heartbeat_url = f'http://10.0.0.8:3001/api/devices/heartbeat/:name'
    response = requests.post(heartbeat_url)
    if response.status_code == 200:
        print('Heartbeat sent successfully')
    else:
        print('Failed to send heartbeat')

def main():
    initialize_sound()
    initialize_gpio()
    alarms = fetch_alarms()
    for alarm in alarms:
        if alarm['active']:
            schedule_alarm(alarm)

    schedule.every(HEARTBEAT_INTERVAL).seconds.do(send_heartbeat, DEVICE_ID)

    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    main()
