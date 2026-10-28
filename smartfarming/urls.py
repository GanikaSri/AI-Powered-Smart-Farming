from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

# Frontend folder location
FRONTEND_DIR = settings.BASE_DIR / "frontend"

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/crop-disease/', include('backend.cropdisease.urls')),
    
]

# ✅ Media file serving (development only)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
  # Homepage
    urlpatterns += [
        path(
            '',
            serve,
            {'document_root': FRONTEND_DIR, 'path': 'index.html'},
            name='home'
        ),

        # Serve HTML, CSS, JS, images and other frontend files
        path(
            '<path:path>',
            serve,
            {'document_root': FRONTEND_DIR}
        ),
    ]
