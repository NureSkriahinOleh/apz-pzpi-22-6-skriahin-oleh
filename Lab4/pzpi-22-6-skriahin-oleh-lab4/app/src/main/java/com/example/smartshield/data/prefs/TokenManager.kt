package com.example.smartshield.data.prefs

import android.content.Context

class TokenManager(context: Context) {
    private val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    var accessToken: String?
        get() = prefs.getString("access", null)
        set(value) = prefs.edit().putString("access", value).apply()

    var refreshToken: String?
        get() = prefs.getString("refresh", null)
        set(value) = prefs.edit().putString("refresh", value).apply()

    fun clear() = prefs.edit().clear().apply()
}
