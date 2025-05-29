package com.example.smartshield.data.network

import com.example.smartshield.data.model.IncidentReport
import com.example.smartshield.data.model.IncidentRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.GET

interface IncidentApi {
    @GET("incidents/")
    suspend fun listIncidents(
        @Header("Authorization") bearer: String
    ): Response<List<IncidentReport>>

    @POST("incidents/")
    suspend fun createIncident(
        @Header("Authorization") bearer: String,
        @Body body: IncidentRequest
    ): Response<Any>
}