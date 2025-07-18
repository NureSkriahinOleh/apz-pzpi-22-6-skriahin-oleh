from channels.generic.websocket import AsyncWebsocketConsumer
import json

class SensorLogsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('sensor_logs', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('sensor_logs', self.channel_name)

    async def sensor_log(self, event):
        await self.send(text_data=json.dumps(event['data']))
