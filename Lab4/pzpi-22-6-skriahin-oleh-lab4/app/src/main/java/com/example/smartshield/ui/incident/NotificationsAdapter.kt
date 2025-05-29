package com.example.smartshield.ui.incident

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.smartshield.data.model.IncidentReport
import com.example.smartshield.databinding.ItemIncidentBinding

class NotificationsAdapter :
    ListAdapter<IncidentReport, NotificationsAdapter.IncidentHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): IncidentHolder {
        val binding = ItemIncidentBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return IncidentHolder(binding)
    }

    override fun onBindViewHolder(holder: IncidentHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class IncidentHolder(private val b: ItemIncidentBinding) : RecyclerView.ViewHolder(b.root) {
        @SuppressLint("SetTextI18n")
        fun bind(item: IncidentReport) {
            b.tvType.text = "Type: ${item.type}"
            b.tvDetails.text = "Details: ${item.details}"
            b.tvLocation.text = "Location: ${item.location}"
            b.tvFdi.text = "FDI: ${item.FDI}"
            b.tvCreatedAt.text = item.created_at
        }
    }

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<IncidentReport>() {
            override fun areItemsTheSame(a: IncidentReport, b: IncidentReport) = a.id == b.id
            override fun areContentsTheSame(a: IncidentReport, b: IncidentReport) = a == b
        }
    }
}