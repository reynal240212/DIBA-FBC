saldo = 0  


deposito_inicial = input("Ingrese la cantidad de dinero a depositar inicialmente: ")
try:
    saldo = float(deposito_inicial)
except ValueError:
    print("Entrada inválida. Por favor, ingrese un número para el depósito.")
    exit() 

print("\t **** MENU ****")
print("1. Ingrese el monto a retirar")
print("2. Mostrar dinero disponible")
print("3. Salir")

print()

opc = input("Elija una opción: ") 

if opc == "1": 
    try:
        retiro = float(input("¿Cuánto dinero desea retirar? -> "))
        if retiro > saldo:
            print("Saldo insuficiente para el retiro.") 
        else:
            saldo -= retiro
            print(f"Dinero restante en la cuenta: ${saldo}") 
    except ValueError:
        print("Entrada inválida. Por favor, ingrese un número para el retiro.")
elif opc == "2": 
    print(f"Dinero disponible en la cuenta: ${saldo}") 
elif opc == "3":
    print("Gracias por utilizar el cajero.")
else:
    print("Opción inválida. Por favor, elija una opción del menú.") 