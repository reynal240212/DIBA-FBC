// api/login.js
export default async function handler(req, res) {
    if (req.method === "POST") {
      const { correo, password } = req.body;
  
      if (!correo || !password) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
      }
  
      global.users = global.users || [];
      const user = global.users.find(u => u.correo === correo && u.password === password);
  
      if (user) {
        // En producción, aquí se podría generar un token JWT o manejar sesiones con cookies.
        return res.status(200).json({ message: "Login exitoso", user });
      } else {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Método no permitido" });
    }
  }
  