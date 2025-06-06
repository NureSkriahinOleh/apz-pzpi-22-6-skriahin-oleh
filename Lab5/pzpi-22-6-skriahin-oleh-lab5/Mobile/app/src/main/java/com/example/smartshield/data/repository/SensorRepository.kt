package com.example.smartshield.data.repository

import android.annotation.SuppressLint
import com.example.smartshield.data.model.RoomFdi
import com.example.smartshield.data.model.Sensor
import com.example.smartshield.data.model.SensorLog
import com.example.smartshield.data.network.RetrofitClient
import com.example.smartshield.data.prefs.TokenManager
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

class SensorRepository(private val tm: TokenManager) {
    @SuppressLint("DefaultLocale")
    suspend fun getRoomsFdi(): Result<List<RoomFdi>> = coroutineScope {
        val token = tm.accessToken ?: return@coroutineScope Result.failure(Exception("No token"))
        val bearer = "Bearer $token"

        val sensorsResp = RetrofitClient.sensorApi.getSensors(bearer)
        if (!sensorsResp.isSuccessful) {
            return@coroutineScope Result.failure(Exception("Sensors fetch failed: ${sensorsResp.code()}"))
        }
        val sensors: List<Sensor> = sensorsResp.body() ?: emptyList()

        val byLocation: Map<String, List<Sensor>> = sensors.groupBy { it.location }

        val rooms = byLocation.map { (location, sensorList) ->
            async {
                val latestByType = mutableMapOf<String, SensorLog>()
                sensorList.forEach { s ->
                    val logsResp = RetrofitClient.sensorApi.getLogsForSensor(bearer, s.id)
                    if (logsResp.isSuccessful) {
                        logsResp.body()?.maxByOrNull { it.timestamp }
                            ?.let { log -> latestByType[s.sensor_type.type] = log }
                    }
                }

                val required = listOf("temperature", "humidity", "gas")
                return@async if (required.all { latestByType.containsKey(it) }) {
                    fun normalize(v: Float, mn: Float, mx: Float): Float = (v - mn) / (mx - mn)
                    val Tn = normalize(latestByType["temperature"]!!.value, 20f, 100f)
                    val Gn = normalize(latestByType["gas"]!!.value, 0f, 300f)
                    val Hn = normalize(latestByType["humidity"]!!.value, 0f, 100f)
                    val fdi = 0.4f * Tn + 0.3f * Gn + 0.3f * (1 - Hn)
                    RoomFdi(location, String.format("%.2f", fdi).toFloat(), "ok")
                } else {
                    RoomFdi(location, null, "insufficient_sensors")
                }
            }
        }.map { it.await() }

        Result.success(rooms)
    }
}