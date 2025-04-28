from abc import ABC, abstractmethod

#Демонстрація застосування патерну Template Method
class RequestHandler(ABC):
    def handle(self, request):
        if not self.authenticate(request):
            return Response(status=401, body="Unauthorized")

        try:
            data = self.process(request)
            return Response(status=200, body=data)
        finally:
            self.log(request)

    @abstractmethod
    def authenticate(self, request):
        pass

    @abstractmethod
    def process(self, request):
        pass

    def log(self, request):
        Logger.log(f"Handled {request.path} for {request.user}")
        

class ProfileRequestHandler(RequestHandler):
    def authenticate(self, request):
        return AuthService.check_token(request.headers.get("Authorization"))

    def process(self, request):
        profile_service = ProfileService()
        return profile_service.get_profile(request.user)


#Фрагмент коду без викоритання патерну Template Method 
class DataExportTask:
    def run(self):
        ResourceManager.initialize()
        Logger.log_start("DataExportTask")
        exporter = ExporterService()
        exporter.export_users_to_csv()
        Logger.log_finish("DataExportTask")
        ResourceManager.cleanup()

class DataCleanupTask:
    def run(self):
        ResourceManager.initialize()
        Logger.log_start("DataCleanupTask")
        cleaner = CleanupService()
        cleaner.remove_stale_entries()
        Logger.log_finish("DataCleanupTask")
        ResourceManager.cleanup()

#Фрагмент коду після рефакторингу
class TaskRunner(ABC):
    def run(self):
        ResourceManager.initialize()
        Logger.log_start(self.__class__.__name__)
        self.execute()
        Logger.log_finish(self.__class__.__name__)
        ResourceManager.cleanup()

    @abstractmethod
    def execute(self):
        pass

class DataExportTask(TaskRunner):
    def execute(self):
        exporter = ExporterService()
        exporter.export_users_to_csv()

class DataCleanupTask(TaskRunner):
    def execute(self):
        cleaner = CleanupService()
        cleaner.remove_stale_entries()