"""
Configuration module for the IoT application.
"""

BASE_URL = "http://localhost:8000/api/v1/sensor"
SENSORS_API_URL = f"{BASE_URL}/sensors/"
API_URL = f"{BASE_URL}/sensors/logs/create/"
HEADERS = {
    "Content-Type": "application/json",
}


NORMAL_RANGES = {
    "humidity": (30, 60),      # Percentage
    "temperature": (20, 30),  # Degrees Celsius
    "gas": (10, 100),          # ppm
}

DANGEROUS_RANGES = {
    "humidity": (0, 20),      # Low humidity
    "temperature": (50, 80),   # High temperature
    "gas": (150, 300),           # High gas concentration
}

DANGEROUS_PROBABILITY = 0.1  # Probability of generating dangerous values