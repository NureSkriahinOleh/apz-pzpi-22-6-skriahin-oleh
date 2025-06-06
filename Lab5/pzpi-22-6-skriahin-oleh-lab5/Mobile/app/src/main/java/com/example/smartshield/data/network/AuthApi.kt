package com.example.smartshield.data.network

import com.example.smartshield.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {
    @POST("register/")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse<UserDetail>>

    @POST("token/")
    suspend fun login(@Body body: LoginRequest): Response<TokenResponse>

    @GET("profile/")
    suspend fun profile(@Header("Authorization") authHeader: String): Response<UserDetail>

    @POST("logout/")
    suspend fun logout(@Body body: Map<String, String>): Response<Map<String, String>>
}
