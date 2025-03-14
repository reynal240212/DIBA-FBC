// /api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nombre, correo, password, fechaNac } = req.body;

    // Validación básica
    if (!nombre || !correo || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos" });
    }

    // Lista de usuarios en memoria
    global.users = global.users || [];

    // Verificar si el usuario ya existe
    const usuarioExistente = global.users.some((u) => u.correo === correo);
    if (usuarioExistente) {
      return res.status(409).json({ error: "Usuario ya registrado" });
    }

    // Crear usuario (en producción, hashea la contraseña)
    const nuevoUsuario = { nombre, correo, password, fechaNac };
    global.users.push(nuevoUsuario);

    // Respuesta exitosa
    return res.status(201).json({
      message: "Registro exitoso",
      user: nuevoUsuario,
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido" });
  }
}
