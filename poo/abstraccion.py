# Clase padre o superclase
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

    def hacer_sonido(self):
        print("Sonido genérico de animal")

    def mostrar_nombre(self):
        print(f"Mi nombre es {self.nombre}")

# Clase hija o subclase que hereda de Animal
class Perro(Animal):
    def __init__(self, nombre, raza):
        # Llamamos al constructor de la clase padre para inicializar el nombre
        super().__init__(nombre)
        self.raza = raza

    # Sobreescribimos el método hacer_sonido para un perro
    def hacer_sonido(self):
        print("¡Guau! ¡Guau!")

    def ladrar(self):
        print("¡Woof woof!")

# Clase hija o subclase que hereda de Animal
class Gato(Animal):
    def __init__(self, nombre, color):
        # Llamamos al constructor de la clase padre para inicializar el nombre
        super().__init__(nombre)
        self.color = color

    # Sobreescribimos el método hacer_sonido para un gato
    def hacer_sonido(self):
        print("¡Miau!")

    def maullar(self):
        print("¡Miau miau!")

# Crear instancias de las clases
mi_perro = Perro("Buddy", "Golden Retriever")
mi_gato = Gato("Whiskers", "Gris")

# Llamar a los métodos
mi_perro.mostrar_nombre()   # Salida: Mi nombre es Buddy
mi_perro.hacer_sonido()    # Salida: ¡Guau! ¡Guau!
mi_perro.ladrar()        # Salida: ¡Woof woof!

mi_gato.mostrar_nombre()    # Salida: Mi nombre es Whiskers
mi_gato.hacer_sonido()     # Salida: ¡Miau!
mi_gato.maullar()         # Salida: ¡Miau miau!