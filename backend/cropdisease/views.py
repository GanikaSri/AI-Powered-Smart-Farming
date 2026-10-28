from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.conf import settings
from backend.ml_models.predict import predict_disease
import os

@csrf_exempt
def detect_crop_disease(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    if "image" not in request.FILES:
        return JsonResponse(
            {"error": "No image uploaded"},
            status=400
        )

    image_file = request.FILES["image"]

    # Validate file type
    allowed_extensions = ["jpg", "jpeg", "png"]
    ext = image_file.name.split(".")[-1].lower()

    if ext not in allowed_extensions:
        return JsonResponse(
            {"error": "Invalid image format. Upload JPG or PNG"},
            status=400
        )

    # Save image temporarily
    upload_dir = "uploads"
    file_path = default_storage.save(
        os.path.join(upload_dir, image_file.name),
        image_file
    )

    full_path = default_storage.path(file_path)

    try:
        # Run ML prediction
        result = predict_disease(full_path)

        if not isinstance(result, dict):
            raise ValueError("Invalid prediction response")

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse(
            {"error": "Prediction failed"},
            status=500
        )

    finally:
        # Cleanup uploaded image
        if os.path.exists(full_path):
            os.remove(full_path)
