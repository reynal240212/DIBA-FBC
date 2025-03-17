from django.urls import path
from . import views  # Importamos las vistas del mismo directorio
from django.contrib import admin
from django.urls import path, include  # Importamos include para incluir las rutas de otras apps
urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('', include('core.urls')),  # Incluimos las rutas de la app "core"
    path('', views.home, name='home'),  # Página principal
    path('jugadores/', views.jugadores, name='jugadores'),  # Lista de jugadores
    path('images/partidos/', views.partidos, name='partidos'),  # Sección de partidos
    path('contacto/', views.contacto, name='contacto'),  # Página de contacto

]