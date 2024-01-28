from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView


from myapp import views

router = DefaultRouter()
router.register(r"cart", views.CartView, basename="cart")
#ValidateCartView
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/search/", views.ItemViewPublic.as_view({'post': 'search_item'}), name='search-item-view'),
    path('api/my_items/', views.ItemView.as_view({'get': 'list','post': 'create', 'delete':"remove", 'put':'update'}), name='myitem-view'),
    path('api/get_items/', views.ItemViewPublic.as_view({'get': 'get_items'}), name='all-items-view'),
    path('api/validate-cart/', views.ValidateCartView.as_view({'post': 'pay_items'}), name='pay-item-view'),
    path('api/populate_db/', views.populate_db, name='populate_db'),
    path("api/me/", views.AboutMeView.as_view()),
    path("api/me-session/", views.SessionAboutMeView.as_view()),
    path("api/register/", views.RegisterView.as_view()),
    path('api/update-cart/', views.CartView.as_view({'get': 'list', 'post': 'create', 'delete':"remove"}), name='cart-view'),
    path("api/login/", views.LoginView.as_view()),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/",TokenBlacklistView.as_view(), name='logout')
      
]