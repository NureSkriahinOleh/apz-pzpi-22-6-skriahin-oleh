package com.example.smartshield.ui.main

import android.content.Intent
import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.smartshield.data.model.RoomFdi
import com.example.smartshield.databinding.ItemRoomFdiBinding
import com.example.smartshield.ui.incident.IncidentReportActivity
import androidx.core.graphics.toColorInt

class RoomAdapter :
    ListAdapter<RoomFdi, RoomAdapter.RoomHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RoomHolder {
        val binding = ItemRoomFdiBinding.inflate(
            LayoutInflater.from(parent.context), parent, false)
        return RoomHolder(binding)
    }

    override fun onBindViewHolder(holder: RoomHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class RoomHolder(private val b: ItemRoomFdiBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(item: RoomFdi) {
            // цвет фона
            val bgColor = when {
                item.fdi == null -> Color.GRAY
                item.fdi < 0.4f -> "#A5D6A7".toColorInt()
                item.fdi < 0.6f -> "#FFF59D".toColorInt()
                else             -> "#EF9A9A".toColorInt()
            }
            b.llContainer.setBackgroundColor(bgColor)

            b.tvLocation.text = item.location
            b.tvFdi.text = when (item.status) {
                "ok" -> "FDI: ${item.fdi}"
                else -> "Insufficient sensors"
            }

            b.btnReport.setOnClickListener {
                val ctx = b.root.context
                val intent = Intent(ctx, IncidentReportActivity::class.java).apply {
                    putExtra("location", item.location)
                    putExtra("fdi", item.fdi ?: -1f)
                }
                ctx.startActivity(intent)
            }
        }
    }

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<RoomFdi>() {
            override fun areItemsTheSame(a: RoomFdi, b: RoomFdi) = a.location == b.location
            override fun areContentsTheSame(a: RoomFdi, b: RoomFdi) = a == b
        }
    }
}