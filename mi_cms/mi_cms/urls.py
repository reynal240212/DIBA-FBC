from django.contrib import admin
from django.urls import path
from core import views  # Importamos las vistas de la app "core"
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('', views.home, name='home'),  # Página principal
    path('jugadores/', views.jugadores, name='jugadores'),  # Lista de jugadores
    path('partidos/', views.partidos, name='partidos'),  # Sección de partidos
    path('contacto/', views.contacto, name='contacto'),  # Página de contacto
    path('archivos/', views.lista_archivos, name='lista_archivos'),
]

# Servir archivos estáticos y de medios solo en modo desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
