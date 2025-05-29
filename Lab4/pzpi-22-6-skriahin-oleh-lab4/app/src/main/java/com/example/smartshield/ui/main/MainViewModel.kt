package com.example.smartshield.ui.main

import android.app.Application
import androidx.lifecycle.*
import com.example.smartshield.data.model.RoomFdi
import com.example.smartshield.data.prefs.TokenManager
import com.example.smartshield.data.repository.SensorRepository
import kotlinx.coroutines.launch

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = SensorRepository(TokenManager(app))

    private val _rooms = MutableLiveData<List<RoomFdi>>()
    val rooms: LiveData<List<RoomFdi>> = _rooms

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun loadRoomsFdi() = viewModelScope.launch {
        repo.getRoomsFdi()
            .onSuccess { _rooms.value = it; _error.value = null }
            .onFailure { _rooms.value = emptyList(); _error.value = it.message }
    }
}
