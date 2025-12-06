import { auth, db } from './firebase.js';
// 1. Agregamos 'signOut' a las importaciones
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const registroForm = document.getElementById('registroForm');
const errorMsg = document.getElementById('mensajeError');
const exitoMsg = document.getElementById('mensajeExito');

// 2. Variable de control para saber si estamos en proceso de registro
let registrando = false;

// Si el usuario ya está logueado, redirigir (PERO ignorar si estamos registrando)
onAuthStateChanged(auth, (user) => {
    if (user && !registrando) {
        console.log("✅ Usuario ya autenticado, redirigiendo...");
        window.location.href = "formulario.html";
    }
});

registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 3. Activamos la bandera de registro para que el observer no nos mueva
    registrando = true;

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = registroForm.querySelector('.btn-submit');

    // Ocultar mensajes
    errorMsg.style.display = 'none';
    exitoMsg.style.display = 'none';

    // Validaciones
    if (password !== confirmPassword) {
        errorMsg.textContent = "Las contraseñas no coinciden";
        errorMsg.style.display = 'block';
        registrando = false; // Resetear bandera
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres";
        errorMsg.style.display = 'block';
        registrando = false; // Resetear bandera
        return;
    }

    if (nombre.length < 3) {
        errorMsg.textContent = "El nombre debe tener al menos 3 caracteres";
        errorMsg.style.display = 'block';
        registrando = false; // Resetear bandera
        return;
    }

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta...';

    try {
        console.log("📝 Creando usuario en Firebase Auth...");
        
        // Crear usuario en Firebase Authentication (esto hace auto-login)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("✅ Usuario creado en Auth:", user.uid);

        // Actualizar el perfil con el nombre
        await updateProfile(user, {
            displayName: nombre
        });
        
        // Guardar información adicional en Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            nombre: nombre,
            email: email,
            fechaRegistro: new Date(),
            rol: "usuario"
        });
        
        console.log("✅ Datos guardados. Cerrando sesión para forzar login...");

        // 4. IMPORTANTE: Cerrar la sesión inmediatamente
        await signOut(auth);

        // Mostrar mensaje de éxito
        exitoMsg.style.display = 'block';
        exitoMsg.textContent = "¡Cuenta creada! Por favor inicia sesión.";

        // Limpiar formulario
        registroForm.reset();

        // 5. Redirigir al LOGIN después de 2 segundos
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
        
        // Si falló, ya no estamos "registrando", permitimos el comportamiento normal
        registrando = false;
        
        errorMsg.style.display = 'block';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMsg.textContent = "Este correo ya está registrado. Intenta iniciar sesión.";
                break;
            case 'auth/invalid-email':
                errorMsg.textContent = "El correo electrónico no es válido";
                break;
            case 'auth/operation-not-allowed':
                errorMsg.textContent = "El registro de usuarios no está habilitado";
                break;
            case 'auth/weak-password':
                errorMsg.textContent = "La contraseña es muy débil. Usa al menos 6 caracteres";
                break;
            case 'auth/network-request-failed':
                errorMsg.textContent = "Error de conexión. Verifica tu internet";
                break;
            default:
                errorMsg.textContent = "Error: " + error.message;
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Cuenta';
    }
});