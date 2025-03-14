// /api/login.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { correo, password } = req.body;

    // Lista de usuarios en memoria
    global.users = global.users || [];

    // Buscar usuario con mismas credenciales
    const userFound = global.users.find(
      (u) => u.correo === correo && u.password === password
    );

    if (!userFound) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Si existe, retornamos el usuario
    return res.status(200).json({
      user: userFound,
    });
  } else {
    // Cualquier otro método => error
    return res.status(405).json({ error: "Método no permitido" });
  }
}