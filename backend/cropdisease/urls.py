from django.urls import path
from .views import detect_crop_disease

urlpatterns = [
    path("detect/", detect_crop_disease, name="detect_crop_disease"),
]
