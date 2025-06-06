import os
import subprocess
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from django.core.management import call_command
from django.conf import settings

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class MakeMigrationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            call_command('makemigrations')
            return Response({"message": "Migrations created successfully."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class MigrateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            call_command('migrate')
            return Response({"message": "Migrations applied successfully."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class BackupDatabaseView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        backup_file = os.path.join(settings.BASE_DIR, 'backup.json')
        try:
            # «dumpdata» без аргументов экспортирует все модели
            call_command('dumpdata', 
                         '--natural-foreign', 
                         '--indent', '2', 
                         output=backup_file)
            return Response(
                {"message": "Backup created successfully.", "file": backup_file},
                status=200
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)


from django.core.management import call_command

class RestoreDatabaseView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        backup_file = os.path.join(settings.BASE_DIR, 'backup.json')
        if not os.path.exists(backup_file):
            return Response({"error": "Backup file not found."}, status=400)
        try:
            # Завантажуємо JSON-дамп через Django loaddata
            call_command('loaddata', backup_file)
            return Response({"message": "Database restored from JSON successfully."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)