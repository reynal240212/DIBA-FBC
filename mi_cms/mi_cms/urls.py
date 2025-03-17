from django.contrib import admin
from django.urls import path
from core import views  # Importamos las vistas de la app "core"

urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django
    path('', views.home, name='home'),  # Página principal
    path('jugadores/', views.jugadores, name='jugadores'),  # Lista de jugadores
    path('partidos/', views.partidos, name='partidos'),  # Sección de partidos
    path('contacto/', views.contacto, name='contacto'),  # Página de contacto
]
#
# # Internationalization
# # https://docs.djangoproject.com/en/5.1/topics/i18n/
#
# LANGUAGE_CODE = "en-us"
#
# TIME_ZONE = "UTC"
#
# USE_I18N = True
#
# USE_L10N = True
# 