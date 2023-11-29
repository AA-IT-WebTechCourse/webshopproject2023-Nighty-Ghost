from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from myapp import views

router = DefaultRouter()
router.register(r"cart", views.CartView, basename="cart")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.hello),
    path("great/<str:name>/", views.great),
    path("nicegreat/<str:name>/", views.nicergreat),
    path("cards/<int:count>/", views.cards),
    path("api/", include(router.urls)),
    path('api/populate_db/', views.populate_db, name='populate_db'),
    path('api/get_items/',views.get_items, name='get_items'),
    path("api/me/", views.AboutMeView.as_view()),
    path("api/me-session/", views.SessionAboutMeView.as_view()),
    path('api/login/', views.login, name='login'),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
]