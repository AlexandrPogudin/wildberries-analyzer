from django.urls import path
from .views import ProductDataAPIView, products_view, ProductFilterDataAPIView

urlpatterns = [
    path('api/products/', ProductDataAPIView.as_view(), name='api-products'),
    path('api/filterproducts/', ProductFilterDataAPIView.as_view(), name='api-filter-products'),
    path('products/', products_view, name='products-view'),
]