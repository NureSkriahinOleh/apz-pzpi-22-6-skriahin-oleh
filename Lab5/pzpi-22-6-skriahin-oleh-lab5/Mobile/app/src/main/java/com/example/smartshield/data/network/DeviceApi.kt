package com.example.smartshield.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

data class DeviceRequest(val token: String)

interface DeviceApi {
    @POST("devices/")
    suspend fun registerDevice(
        @Header("Authorization") bearer: String,
        @Body body: DeviceRequest
    ): Response<Any>
}
