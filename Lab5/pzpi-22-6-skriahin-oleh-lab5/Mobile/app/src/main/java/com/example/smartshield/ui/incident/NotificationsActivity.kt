package com.example.smartshield.ui.incident

import android.os.Bundle
import android.view.View.GONE
import android.view.View.VISIBLE
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.smartshield.databinding.ActivityNotificationsBinding

class NotificationsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNotificationsBinding
    private val vm: NotificationsViewModel by viewModels()
    private val adapter = NotificationsAdapter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNotificationsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.rvIncidents.layoutManager = LinearLayoutManager(this)
        binding.rvIncidents.adapter = adapter

        vm.error.observe(this) { err ->
            binding.tvNotifError.text = err ?: ""
            binding.tvNotifError.visibility = if (err != null) VISIBLE else GONE
        }

        vm.incidents.observe(this) { adapter.submitList(it) }
        vm.loadIncidents()
    }
}