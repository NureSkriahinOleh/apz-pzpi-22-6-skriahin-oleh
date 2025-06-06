from django.urls import path
from .views import *

urlpatterns = [
    path('make-migrations/', MakeMigrationsView.as_view(), name='make-migrations'),
    path('migrate/', MigrateView.as_view(), name='migrate'),
    path('backup/', BackupDatabaseView.as_view(), name='backup-database'),
    path('restore/', RestoreDatabaseView.as_view(), name='restore-database'),
]
