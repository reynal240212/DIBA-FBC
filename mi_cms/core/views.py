from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

def jugadores(request):
    return render(request, 'jugadores.html')

def partidos(request):
    return render(request, 'partidos.html')

def contacto(request):
    return render(request, 'contacto.html')