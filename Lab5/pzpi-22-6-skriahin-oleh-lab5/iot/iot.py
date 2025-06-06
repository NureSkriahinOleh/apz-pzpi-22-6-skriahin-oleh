import random
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from itertools import repeat

from iot_config import (
    API_URL,
    SENSORS_API_URL,
    HEADERS,
    NORMAL_RANGES,
    DANGEROUS_RANGES,
    DANGEROUS_PROBABILITY,
)

def fetch_sensors():
    try:
        resp = requests.get(SENSORS_API_URL, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[{datetime.now()}] Error fetching sensors: {e}")
        return []

def generate_sensor_data(sensor_type: str) -> float:
    if random.random() < DANGEROUS_PROBABILITY:
        return random.uniform(*DANGEROUS_RANGES[sensor_type])
    return random.uniform(*NORMAL_RANGES[sensor_type])

def send_data_to_server(sensor: dict, all_sensors: list, force_danger: bool = False):
    sid  = sensor["id"]
    t    = sensor["sensor_type"]["type"]
    unit = sensor["sensor_type"]["measurement_unit"]

    if force_danger:
        value = random.uniform(*DANGEROUS_RANGES[t])
    else:
        value = generate_sensor_data(t)

    vals = [
        generate_sensor_data(s["sensor_type"]["type"])
        for s in all_sensors
        if s["sensor_type"]["type"] == t
    ]
    avg = sum(vals) / len(vals) if vals else None
    if avg and abs(value - avg) / avg > 0.3:
        others = [
            s for s in all_sensors
            if s["id"] != sid and s["sensor_type"]["type"] == t
        ]
        if all(NORMAL_RANGES[t][0] <= generate_sensor_data(t) <= NORMAL_RANGES[t][1]
               for _ in others):
            print(f"[{datetime.now()}] ⚠️ Sensor {sid} might be faulty: {value:.2f} {unit}, avg {avg:.2f}")

    payload = {"sensor_id": sid, "value": value}
    try:
        res = requests.post(API_URL, json=payload, headers=HEADERS)
        if res.status_code == 201:
            data = res.json()
            print(f"[{datetime.now()}] Location={sensor['location']!r} | "
                  f"Sensor={sid} | value={value:.2f}{unit} | {data}")
        else:
            print(f"[{datetime.now()}] Failed POST log: {res.status_code}, {res.text}")
    except requests.RequestException as e:
        print(f"[{datetime.now()}] Error POST log: {e}")

def simulate_sensors():
    while True:
        sensors = fetch_sensors()
        if not sensors:
            print(f"[{datetime.now()}] No sensors, retrying...")
            time.sleep(4)
            continue
        
        sensors_by_loc = {}
        for s in sensors:
            sensors_by_loc.setdefault(s["location"], []).append(s)

        print(f"[{datetime.now()}] Retrieved {len(sensors)} sensors across {len(sensors_by_loc)} locations")

        with ThreadPoolExecutor(max_workers=10) as executor:
            tasks = []
            flags = []
            for loc, lst in sensors_by_loc.items():
                incident_flag = random.random() < DANGEROUS_PROBABILITY
                print(f"[{datetime.now()}] Location={loc!r} incident_flag={incident_flag}")
                for sensor in lst:
                    tasks.append(sensor)
                    flags.append(incident_flag)
            executor.map(send_data_to_server, tasks, repeat(sensors), flags)

        time.sleep(5)

if __name__ == "__main__":
    print("Starting IoT emulator...")
    simulate_sensors()