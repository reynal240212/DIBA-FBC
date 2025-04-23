saldo=input("Depositar dinero")

print("\t **** MENU ****")
print("1. Ingrese el monto a retirar")
print("2. Mostrar dinero disponible")
print("3. salir")

print()


opc=input("Eligir una opcion")
if opc == 1:
    retiro = float(input("Cuanto Dinero desea retirar -> *"))
    if retiro>saldo:
        print("saldo insuficiente para retiro")
    else:
       saldo-=retiro
       print(f"Dinero en la cuenta:{saldo}")
elif opc==2:
    print(f"Dinero en la cuenta: {saldo}")
elif opc==3:
    print("Gracias por utilizar el cajero")
else:
    print("Se equivoco de opcion del Menu")