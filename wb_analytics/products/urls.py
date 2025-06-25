from django.urls import path
from .views import ProductDataAPIView, products_view

urlpatterns = [
    path('api/products/', ProductDataAPIView.as_view(), name='api-products'),
    path('products/', products_view, name='products-view'),
]