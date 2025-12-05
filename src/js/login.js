import { auth } from '../../firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('mensajeError');

// Si el usuario ya está logueado, lo mandamos directo al formulario
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "formulario.html";
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('.btn-submit');

    errorMsg.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // No necesitamos redirigir aquí manualmente, el onAuthStateChanged de arriba lo hará
    } catch (error) {
        console.error(error);
        errorMsg.style.display = 'block';
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            errorMsg.textContent = "Correo o contraseña incorrectos.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg.textContent = "Muchos intentos fallidos. Espera un momento.";
        } else {
            errorMsg.textContent = "Error: " + error.message;
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
});