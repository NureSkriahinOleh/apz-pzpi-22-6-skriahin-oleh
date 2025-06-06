package com.example.smartshield.data.model

data class LoginRequest(
    val username: String,
    val password: String
)

data class TokenResponse(
    val access: String,
    val refresh: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val repeat_password: String
)

data class AuthResponse<T>(
    val user: T,
    val access: String,
    val refresh: String
)

data class UserDetail(
    val id: Int,
    val username: String,
    val email: String
)