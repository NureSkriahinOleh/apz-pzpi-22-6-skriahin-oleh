package com.example.smartshield.ui.incident

import android.app.Application
import androidx.lifecycle.*
import com.example.smartshield.data.model.IncidentReport
import com.example.smartshield.data.prefs.TokenManager
import com.example.smartshield.data.repository.IncidentRepository
import kotlinx.coroutines.launch

class NotificationsViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = IncidentRepository(TokenManager(app))

    private val _incidents = MutableLiveData<List<IncidentReport>>()
    val incidents: LiveData<List<IncidentReport>> = _incidents

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun loadIncidents() = viewModelScope.launch {
        repo.getIncidents()
            .onSuccess { _incidents.value = it; _error.value = null }
            .onFailure { _incidents.value = emptyList(); _error.value = it.message }
    }
}