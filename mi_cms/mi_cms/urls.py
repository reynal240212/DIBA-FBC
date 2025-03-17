"""
URL configuration for mi_cms project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
from django.contrib import admin
from django.urls import path
from core import views  # Importa las vistas de la app "core"

urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('', views.home, name='home'),  # Página principal
    path('jugadores/', views.jugadores, name='jugadores'),  # Lista de jugadores
    path('partidos/', views.partidos, name='partidos'),  # Sección de partidos
    path('contacto/', views.contacto, name='contacto'),  # Página de contacto
]
