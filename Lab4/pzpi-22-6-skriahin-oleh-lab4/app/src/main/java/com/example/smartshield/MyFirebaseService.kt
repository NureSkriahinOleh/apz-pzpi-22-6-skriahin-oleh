package com.example.smartshield

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "incidents", "Incident Alerts", NotificationManager.IMPORTANCE_HIGH
            )
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }

        remoteMessage.notification?.let {
            val notif = NotificationCompat.Builder(this, "incidents")
                .setContentTitle(it.title ?: "Alert")
                .setContentText(it.body ?: "")
                .setSmallIcon(R.drawable.ic_notification)
                .setAutoCancel(true)
                .build()
            NotificationManagerCompat.from(this)
                .notify( (System.currentTimeMillis() % 10000).toInt(), notif)
        }
    }
}
