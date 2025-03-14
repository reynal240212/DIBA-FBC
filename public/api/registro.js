// api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nombre, correo, password } = req.body;
    
    // Validación básica
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Para demostración: usamos un almacenamiento en memoria (global.users)
    // Nota: Esto se reinicia en cada despliegue/cold start y no es persistente
    global.users = global.users || [];
    const usuarioExistente = global.users.some(u => u.correo === correo);
    if (usuarioExistente) {
      return res.status(409).json({ error: "Usuario ya registrado" });
    }

    // Crear el usuario (en producción, hashea la contraseña)
    const nuevoUsuario = { nombre, correo, password };
    global.users.push(nuevoUsuario);

    return res.status(201).json({ message: "Registro exitoso", user: nuevoUsuario });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido" });
  }
}
