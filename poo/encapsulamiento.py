class CuentaBancaria:
    def __init__(self, titular, saldo_inicial):
        self._titular = titular  # Atributo "protegido"
        self.__saldo = saldo_inicial  # Atributo "privado"

    # Método público para obtener el titular
    def obtener_titular(self):
        return self._titular

    # Método público para obtener el saldo
    def obtener_saldo(self):
        return self.__saldo

    # Método público para depositar dinero
    def depositar(self, cantidad):
        if cantidad > 0:
            self.__saldo += cantidad
            print(f"Se depositaron ${cantidad}. Nuevo saldo: ${self.__saldo}")
        else:
            print("La cantidad a depositar debe ser mayor que cero.")

    # Método público para retirar dinero
    def retirar(self, cantidad):
        if cantidad > 0 and cantidad <= self.__saldo:
            self.__saldo -= cantidad
            print(f"Se retiraron ${cantidad}. Nuevo saldo: ${self.__saldo}")
        else:
            print("Fondos insuficientes o cantidad inválida.")

# Crear una instancia de la clase CuentaBancaria
mi_cuenta = CuentaBancaria("Ana Pérez", 1000)

# Acceder a los atributos y métodos
print(f"Titular de la cuenta: {mi_cuenta.obtener_titular()}")
print(f"Saldo actual: ${mi_cuenta.obtener_saldo()}")

mi_cuenta.depositar(500)
mi_cuenta.retirar(200)

# Intentar acceder directamente al atributo "protegido" (por convención, no se recomienda)
print(f"Titular (acceso 'protegido'): {mi_cuenta._titular}")

# Intentar acceder directamente al atributo "privado" (name mangling lo dificulta)
# Esto generará un AttributeError: 'CuentaBancaria' object has no attribute '__saldo'
# print(f"Saldo (intento de acceso 'privado'): ${mi_cuenta.__saldo}")

# Acceder al atributo "privado" usando el name mangling (no es la forma recomendada)
print(f"Saldo (acceso 'privado' con name mangling): ${mi_cuenta._CuentaBancaria__saldo}")