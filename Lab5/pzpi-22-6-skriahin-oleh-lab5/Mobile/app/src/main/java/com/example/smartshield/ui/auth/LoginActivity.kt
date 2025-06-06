package com.example.smartshield.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.smartshield.ui.main.MainActivity
import com.example.smartshield.R
import com.example.smartshield.data.model.LoginRequest
import com.example.smartshield.data.prefs.TokenManager
import com.example.smartshield.data.repository.DeviceRepository
import com.example.smartshield.databinding.ActivityLoginBinding
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private val vm: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val fcmToken = task.result!!
                    lifecycleScope.launch {
                        val repo = DeviceRepository(TokenManager(this@LoginActivity))
                        repo.registerToken(fcmToken)
                            .onSuccess {}
                            .onFailure { Log.w("DeviceReg", it.message ?: "") }
                    }
                } else {
                    Log.w("FCM", "Fetching FCM registration token failed", task.exception)
                }
            }

        binding.btnLogin.setOnClickListener {
            val user = binding.etUsername.text.toString().trim()
            val pass = binding.etPassword.text.toString()
            vm.login(LoginRequest(user, pass))
        }
        binding.btnToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        vm.state.observe(this) { state ->
            when (state) {
                AuthState.Loading -> binding.btnLogin.isEnabled = false
                is AuthState.Success -> {
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                }
                is AuthState.Error -> {
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
                else -> binding.btnLogin.isEnabled = true
            }
        }
    }
}
