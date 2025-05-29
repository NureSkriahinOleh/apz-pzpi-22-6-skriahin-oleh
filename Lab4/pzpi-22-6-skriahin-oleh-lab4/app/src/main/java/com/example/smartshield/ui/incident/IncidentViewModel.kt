package com.example.smartshield.ui.incident

import android.app.Application
import androidx.lifecycle.*
import com.example.smartshield.data.model.IncidentRequest
import com.example.smartshield.data.prefs.TokenManager
import com.example.smartshield.data.repository.IncidentRepository
import kotlinx.coroutines.launch

sealed class IncidentState {
    object Idle : IncidentState()
    object Loading : IncidentState()
    object Success : IncidentState()
    data class Error(val message: String) : IncidentState()
}

class IncidentViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = IncidentRepository(TokenManager(application))
    private val _state = MutableLiveData<IncidentState>(IncidentState.Idle)
    val state: LiveData<IncidentState> = _state

    fun reportIncident(location: String, fdi: String, type: String, details: String) {
        viewModelScope.launch {
            _state.value = IncidentState.Loading
            repo.createIncident(IncidentRequest(type, details, location, fdi))
                .onSuccess { _state.value = IncidentState.Success }
                .onFailure { _state.value = IncidentState.Error(it.message ?: "Error") }
        }
    }
}