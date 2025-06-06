package com.example.smartshield.data.repository

import com.example.smartshield.data.model.*
import com.example.smartshield.data.network.RetrofitClient
import com.example.smartshield.data.prefs.TokenManager

class AuthRepository(private val tokenManager: TokenManager) {

    suspend fun register(req: RegisterRequest): Result<UserDetail> {
        val resp = RetrofitClient.authApi.register(req)
        return if (resp.isSuccessful) {
            resp.body()?.let {
                tokenManager.accessToken = it.access
                tokenManager.refreshToken = it.refresh
                Result.success(it.user)
            } ?: Result.failure(Exception("Empty register response"))
        } else {
            Result.failure(Exception("Registration failed: ${resp.code()}"))
        }
    }

    suspend fun login(req: LoginRequest): Result<UserDetail> {
        val tokenResp = RetrofitClient.authApi.login(req)
        if (!tokenResp.isSuccessful || tokenResp.body() == null) {
            return Result.failure(Exception("Login failed: ${tokenResp.code()}"))
        }
        val tokens = tokenResp.body()!!
        tokenManager.accessToken = tokens.access
        tokenManager.refreshToken = tokens.refresh

        val profileResp = RetrofitClient.authApi.profile("Bearer ${tokens.access}")
        return if (profileResp.isSuccessful) {
            profileResp.body()?.let {
                Result.success(it)
            } ?: Result.failure(Exception("Empty profile response"))
        } else {
            Result.failure(Exception("Profile fetch failed: ${profileResp.code()}"))
        }
    }

    suspend fun logout(): Result<Unit> {
        val body = mapOf("refresh" to (tokenManager.refreshToken ?: ""))
        val resp = RetrofitClient.authApi.logout(body)
        return if (resp.isSuccessful) {
            tokenManager.clear()
            Result.success(Unit)
        } else {
            Result.failure(Exception("Logout failed: ${resp.code()}"))
        }
    }
}