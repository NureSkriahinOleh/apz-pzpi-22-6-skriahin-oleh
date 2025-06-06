package com.example.smartshield.data.repository

import com.example.smartshield.data.model.IncidentReport
import com.example.smartshield.data.model.IncidentRequest
import com.example.smartshield.data.network.RetrofitClient
import com.example.smartshield.data.prefs.TokenManager

class IncidentRepository(private val tm: TokenManager) {
    suspend fun createIncident(req: IncidentRequest): Result<Unit> {
        val token = tm.accessToken ?: return Result.failure(Exception("No token"))
        val resp = RetrofitClient.incidentApi.createIncident("Bearer $token", req)
        return if (resp.isSuccessful) Result.success(Unit)
        else Result.failure(Exception("Failed: ${resp.code()}"))
    }
    suspend fun getIncidents(): Result<List<IncidentReport>> {
        val token = tm.accessToken ?: return Result.failure(Exception("No token"))
        val resp = RetrofitClient.incidentApi.listIncidents("Bearer $token")
        return if (resp.isSuccessful) {
            Result.success(resp.body() ?: emptyList())
        } else {
            Result.failure(Exception("Failed to fetch incidents: ${resp.code()}"))
        }
    }
}