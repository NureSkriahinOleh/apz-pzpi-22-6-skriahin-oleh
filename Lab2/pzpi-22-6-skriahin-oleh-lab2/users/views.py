from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .serializers import (
    CustomUserCreateSerializer,
    UserDetailSerializer,
    TokenBlacklistSerializer,
)
from .permissions import IsAdminUser, IsAdminOrSelf

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = CustomUserCreateSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        request=CustomUserCreateSerializer,
        responses={201: UserDetailSerializer, 400: "Validation error"},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserDetailSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminOrSelf]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsAdminUser()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrSelf()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


class TokenBlacklistView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TokenBlacklistSerializer

    @extend_schema(
        request=TokenBlacklistSerializer,
        responses={200: OpenApiTypes.STR, 400: OpenApiTypes.STR},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data["refresh"]

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
            )
