package com.example.smartshield.ui.incident

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.smartshield.databinding.ActivityIncidentReportBinding

class IncidentReportActivity : AppCompatActivity() {
    private lateinit var binding: ActivityIncidentReportBinding
    private val vm: IncidentViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityIncidentReportBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val location = intent.getStringExtra("location") ?: ""
        val fdi = intent.getFloatExtra("fdi", -1f)

        binding.tvLocation.text = location
        binding.tvFdiValue.text = if (fdi >= 0f) fdi.toString() else "N/A"

        val types = listOf("fire", "gas_leak", "intrusion")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, types)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerType.adapter = adapter

        binding.btnSend.setOnClickListener {
            val type = binding.spinnerType.selectedItem as String
            val details = binding.etDetails.text.toString().trim()
            vm.reportIncident(location, fdi.toString(), type, details)
        }

        vm.state.observe(this) { state ->
            when (state) {
                IncidentState.Loading ->
                    binding.btnSend.isEnabled = false
                is IncidentState.Success -> {
                    Toast.makeText(this, "Report sent", Toast.LENGTH_LONG).show()
                    finish()
                }
                is IncidentState.Error -> {
                    Toast.makeText(this, "Error: ${state.message}", Toast.LENGTH_LONG).show()
                    binding.btnSend.isEnabled = true
                }
                else -> binding.btnSend.isEnabled = true
            }
        }
    }
}