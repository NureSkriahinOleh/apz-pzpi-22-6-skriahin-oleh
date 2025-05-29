package com.example.smartshield.data.model

data class Sensor(
    val id: Int,
    val sensor_type: SensorType,
    val location: String,
    val status: Boolean
)

data class SensorType(
    val type: String,
    val threshold_value: Float,
    val measurement_unit: String
)

data class SensorLog(
    val id: Long,
    val value: Float,
    val timestamp: String,
    val exceeded_threshold: Boolean,
    val sensor: Int
)