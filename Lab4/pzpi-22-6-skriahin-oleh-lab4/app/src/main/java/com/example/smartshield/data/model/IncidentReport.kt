package com.example.smartshield.data.model

data class IncidentReport(
    val id: Int,
    val type: String,
    val details: String,
    val location: String,
    val FDI: String,
    val created_at: String
)