package com.example.smartshield.data.repository

import com.example.smartshield.data.network.DeviceRequest
import com.example.smartshield.data.network.RetrofitClient
import com.example.smartshield.data.prefs.TokenManager

class DeviceRepository(private val tm: TokenManager) {
    suspend fun registerToken(token: String): Result<Unit> {
        val access = tm.accessToken ?: return Result.failure(Exception("No access token"))
        val resp = RetrofitClient.deviceApi.registerDevice("Bearer $access", DeviceRequest(token))
        return if (resp.isSuccessful) Result.success(Unit)
        else Result.failure(Exception("Device register failed: ${resp.code()}"))
    }
}
