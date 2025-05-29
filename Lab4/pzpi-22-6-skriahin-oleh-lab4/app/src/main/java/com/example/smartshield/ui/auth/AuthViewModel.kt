package com.example.smartshield.ui.auth

import android.app.Application
import androidx.lifecycle.*
import com.example.smartshield.data.model.*
import com.example.smartshield.data.prefs.TokenManager
import com.example.smartshield.data.repository.AuthRepository
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: UserDetail) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = AuthRepository(TokenManager(application))

    private val _state = MutableLiveData<AuthState>(AuthState.Idle)
    val state: LiveData<AuthState> = _state

    fun register(req: RegisterRequest) = viewModelScope.launch {
        _state.value = AuthState.Loading
        repo.register(req)
            .onSuccess { _state.value = AuthState.Success(it) }
            .onFailure { _state.value = AuthState.Error(it.message ?: "Error") }
    }

    fun login(req: LoginRequest) = viewModelScope.launch {
        _state.value = AuthState.Loading
        repo.login(req)
            .onSuccess { _state.value = AuthState.Success(it) }
            .onFailure { _state.value = AuthState.Error(it.message ?: "Error") }
    }
}
