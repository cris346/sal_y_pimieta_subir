import { db, auth } from '../../firebase.js';
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const recipeForm = document.getElementById('formReceta');
const btnLogout = document.getElementById('btnLogout');
const mainContainer = document.getElementById('mainContainer');

// PROTECCIÓN: Si no hay usuario, fuera de aquí
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        console.log("Usuario conectado: " + user.email);
    }
});

// Cerrar Sesión
btnLogout.addEventListener('click', async () => {
    if(confirm("¿Cerrar sesión?")) {
        await signOut(auth);
        window.location.href = "login.html";
    }
});

// Subir Receta
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = recipeForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    // Recolección de datos (Simplificado para el ejemplo)
    try {
        const nombre = document.getElementById('nombre').value;
        const imagenURL = document.getElementById('imagenURL').value;
        const descC = document.getElementById('descripcionCorta').value;
        const descL = document.getElementById('descripcionLarga').value;
        const tiempo = document.getElementById('tiempoMinutos').value;
        const region = document.getElementById('regiones').value;
        
        const ingredientes = document.getElementById('ingredientes').value.split(',');
        const pasos = document.getElementById('pasos').value.split('\n');

        // Guardar en Firebase
        await addDoc(collection(db, "recetas"), {
            nombre, imagenURL, descripcionCorta: descC, descripcionLarga: descL,
            tiempoMinutos: Number(tiempo), region, ingredientes, pasos,
            fecha: new Date()
        });

        alert("¡Receta guardada!");
        recipeForm.reset();
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Receta';
    }
});