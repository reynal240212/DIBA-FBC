/**
 * DIBA FBC - registro.html Module
 */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    async function handleRegistro(e) {
      e.preventDefault();

      // ... (Toda tu validación de campos Nombre, Apellido, Correo y Clave se mantiene igual) ...

      const Nombre = document.getElementById("nombre").value;
      if (!Nombre) {
        alert("❌ Por favor, ingresa un nombre.");
        return;
      }
      if (Nombre.length > 50) {
        alert("❌ El nombre no puede tener más de 50 caracteres.");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(Nombre)) {
        alert("❌ El nombre solo puede contener letras y espacios.");
        return;
      }
      const apellido = document.getElementById("apellido").value;
      if (!apellido) {
        alert("❌ Por favor, ingresa un apellido.");
        return;
      }
      if (apellido.length > 50) {
        alert("❌ El apellido no puede tener más de 50 caracteres.");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(apellido)) {
        alert("❌ El apellido solo puede contener letras y espacios.");
        return;
      }

      const celular = document.getElementById("celular").value;
      if (!celular) {
        alert("❌ Por favor, ingresa tu número de celular.");
        return;
      }
      if (!/^\+?\d{10,15}$/.test(celular)) {
        alert("❌ Por favor, ingresa un número de celular válido.");
        return;
      }

      const correo = document.getElementById("correo").value;
      if (!correo) {
        alert("❌ Por favor, ingresa un correo electrónico.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        alert("❌ Por favor, ingresa un correo electrónico válido.");
        return;
      }
      if (correo.length > 100) {
        alert("❌ El correo electrónico no puede tener más de 100 caracteres.");
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
        alert("❌ El correo electrónico no es válido.");
        return;
      }

      const clave = document.getElementById("clave").value;
      if (!clave) {
        alert("❌ Por favor, ingresa una contraseña.");
        return;
      }
      // Tu validación de longitud de contraseña está un poco confusa.
      // Si quieres que sea exactamente 8 caracteres:
      if (clave.length !== 8) {
        alert("❌ La contraseña debe tener exactamente 8 caracteres.");
        return;
      }
      // Si quieres que sea *al menos* 8 caracteres:
      // if (clave.length < 8) {
      //   alert("❌ La contraseña debe tener al menos 8 caracteres.");
      //   return;
      // }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8}$/.test(clave)) { // Aquí también ajusté el regex para 8 caracteres
        alert("❌ La contraseña debe tener al menos una letra mayúscula, una minúscula, un número y ser de 8 caracteres.");
        return;
      }


      // --- CAMBIO CLAVE AQUÍ ---
      // Intentamos registrar al usuario directamente.
      // Supabase maneja el error si el correo ya existe.
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: clave,
        options: {
          data: {
            nombre: Nombre, // Agregamos el nombre y apellido como metadata del usuario
            apellido: apellido,
            celular: celular,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) { // Mensaje de error común para correo duplicado
          alert("❌ El correo electrónico ya está registrado. Por favor, utiliza otro.");
        } else {
          alert("❌ Error al registrar: " + error.message);
        }
        return;
      }

      // Supabase retornará null para el `user` si el correo de confirmación es enviado.
      // `data.user` será null si se requiere confirmación por email.
      // `data.session` también será null en este caso.
      if (data.user || data.session) {
        alert("✅ Registro exitoso. Has iniciado sesión automáticamente.");
        window.location.href = "login.html"; // O a donde quieras redirigirlo después del registro exitoso e inicio de sesión
      } else {
        alert("✅ Registro exitoso. Por favor, revisa tu correo para confirmar tu cuenta.");
        window.location.href = "login.html"; // Redirigir al login para que espere la confirmación
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("registroForm").addEventListener("submit", handleRegistro);
    });
