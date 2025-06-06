package com.example.smartshield.data.network

import com.example.smartshield.data.model.Sensor
import com.example.smartshield.data.model.SensorLog
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path

interface SensorApi {
    @GET("sensors/")
    suspend fun getSensors(
        @Header("Authorization") bearer: String
    ): Response<List<Sensor>>

    @GET("sensors/{sensor_id}/logs/")
    suspend fun getLogsForSensor(
        @Header("Authorization") bearer: String,
        @Path("sensor_id") sensorId: Int
    ): Response<List<SensorLog>>
}