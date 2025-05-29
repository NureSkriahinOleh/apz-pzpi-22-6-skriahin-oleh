package com.example.smartshield.data.model

data class IncidentRequest(
    val type: String,
    val details: String,
    val location: String,
    val FDI: String
)
