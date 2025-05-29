package com.example.smartshield.data.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_API = "http://10.0.2.2:8000/api/v1/"

    val authApi: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_API + "user/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

    val sensorApi: SensorApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_API + "sensor/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SensorApi::class.java)
    }

    val incidentApi: IncidentApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_API + "incident/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(IncidentApi::class.java)
    }

    val deviceApi: DeviceApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_API + "user/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(DeviceApi::class.java)
    }
}