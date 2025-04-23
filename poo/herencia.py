# Clase padre: Figura Geométrica
class FiguraGeometrica:
    def __init__(self, color):
        self.color = color

    def obtener_color(self):
        return self.color

    def area(self):
        # Método genérico para calcular el área. Se espera que las subclases lo implementen.
        raise NotImplementedError("Las subclases deben implementar el método area()")

    def perimetro(self):
        # Método genérico para calcular el perímetro. Se espera que las subclases lo implementen.
        raise NotImplementedError("Las subclases deben implementar el método perimetro()")

# Clase hija: Círculo, hereda de FiguraGeometrica
class Circulo(FiguraGeometrica):
    def __init__(self, color, radio):
        # Llamamos al constructor de la clase padre
        super().__init__(color)
        self.radio = radio

    # Implementamos el método area específico para el círculo
    def area(self):
        return 3.14159 * self.radio * self.radio

    # Implementamos el método perimetro específico para el círculo
    def perimetro(self):
        return 2 * 3.14159 * self.radio

# Clase hija: Rectángulo, hereda de FiguraGeometrica
class Rectangulo(FiguraGeometrica):
    def __init__(self, color, base, altura):
        # Llamamos al constructor de la clase padre
        super().__init__(color)
        self.base = base
        self.altura = altura

    # Implementamos el método area específico para el rectángulo
    def area(self):
        return self.base * self.altura

    # Implementamos el método perimetro específico para el rectángulo
    def perimetro(self):
        return 2 * (self.base + self.altura)

# Crear instancias de las clases hijas
mi_circulo = Circulo("rojo", 5)
mi_rectangulo = Rectangulo("azul", 10, 5)

# Acceder a los métodos heredados y específicos
print(f"El color de mi círculo es: {mi_circulo.obtener_color()}")
print(f"El área de mi círculo es: {mi_circulo.area()}")
print(f"El perímetro de mi círculo es: {mi_circulo.perimetro()}")

print(f"\nEl color de mi rectángulo es: {mi_rectangulo.obtener_color()}")
print(f"El área de mi rectángulo es: {mi_rectangulo.area()}")
print(f"El perímetro de mi rectángulo es: {mi_rectangulo.perimetro()}")