import { db, auth } from './firebase.js';
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const recipeForm = document.getElementById('formReceta');
const btnLogout = document.getElementById('btnLogout');
const submitBtn = recipeForm.querySelector('.btn-submit');

// Obtener el ID de la receta si estamos editando
const urlParams = new URLSearchParams(window.location.search);
const recetaId = urlParams.get('id');
let modoEdicion = false;

console.log("🔍 ID de receta en URL:", recetaId);

// PROTECCIÓN: Si no hay usuario, fuera
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("❌ No hay usuario, redirigiendo al login");
        window.location.href = "login.html";
    } else {
        console.log("✅ Usuario conectado:", user.email);
        // Si hay ID en la URL, cargar la receta para editar
        if (recetaId) {
            console.log("📝 Cargando receta para editar...");
            cargarRecetaParaEditar(recetaId);
        }
    }
});

// Función para cargar receta existente
async function cargarRecetaParaEditar(id) {
    console.log("🔄 Intentando cargar receta con ID:", id);
    
    try {
        const docRef = doc(db, "recetas", id);
        console.log("📄 Referencia del documento creada");
        
        const docSnap = await getDoc(docRef);
        console.log("📦 Documento obtenido, existe:", docSnap.exists());
        
        if (docSnap.exists()) {
            modoEdicion = true;
            const data = docSnap.data();
            console.log("✅ Datos de la receta:", data);
            
            // Llenar el formulario
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('imagenURL').value = data.imagenURL || '';
            document.getElementById('descripcionCorta').value = data.descripcionCorta || '';
            document.getElementById('descripcionLarga').value = data.descripcionLarga || '';
            document.getElementById('tiempoMinutos').value = data.tiempoMinutos || '';
            document.getElementById('regiones').value = data.region || 'Mexico';
            document.getElementById('ingredientes').value = (data.ingredientes || []).join(', ');
            document.getElementById('pasos').value = (data.pasos || []).join('\n');
            
            // Marcar checkboxes de momento
            if (data.momento && Array.isArray(data.momento)) {
                console.log("📋 Momentos encontrados:", data.momento);
                data.momento.forEach(m => {
                    const checkbox = document.querySelector(`input[name="momento"][value="${m}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log("✓ Checkbox marcado:", m);
                    }
                });
            }
            
            // Marcar checkboxes de tags
            if (data.tags && Array.isArray(data.tags)) {
                console.log("🏷️ Tags encontrados:", data.tags);
                data.tags.forEach(t => {
                    const checkbox = document.querySelector(`input[name="tags"][value="${t}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log("✓ Tag marcado:", t);
                    }
                });
            }
            
            // Cambiar texto del botón y título
            submitBtn.textContent = 'Actualizar Receta';
            const h2 = document.querySelector('h2');
            if (h2) h2.textContent = 'Editar Receta';
            
            console.log("🎉 Formulario cargado correctamente para edición");
            
        } else {
            console.error("❌ La receta no existe en la base de datos");
            alert("Receta no encontrada");
            window.location.href = "lista_recetas.html";
        }
    } catch (error) {
        console.error("❌ Error al cargar receta:", error);
        console.error("Detalles del error:", error.message);
        alert("Error al cargar la receta: " + error.message);
    }
}

// Cerrar Sesión
btnLogout.addEventListener('click', async () => {
    if(confirm("¿Cerrar sesión?")) {
        await signOut(auth);
        window.location.href = "login.html";
    }
});

// Guardar o Actualizar Receta
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = modoEdicion ? 'Actualizando...' : 'Guardando...';

    try {
        const nombre = document.getElementById('nombre').value.trim();
        const imagenURL = document.getElementById('imagenURL').value.trim();
        const descC = document.getElementById('descripcionCorta').value.trim();
        const descL = document.getElementById('descripcionLarga').value.trim();
        const tiempo = document.getElementById('tiempoMinutos').value;
        const region = document.getElementById('regiones').value.trim();
        
        // Procesar ingredientes y pasos
        const ingredientes = document.getElementById('ingredientes').value
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
            
        const pasos = document.getElementById('pasos').value
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        
        // Capturar checkboxes de momento
        const momentoChecks = document.querySelectorAll('input[name="momento"]:checked');
        const momento = Array.from(momentoChecks).map(c => c.value);
        
        // Capturar checkboxes de tags
        const tagsChecks = document.querySelectorAll('input[name="tags"]:checked');
        const tags = Array.from(tagsChecks).map(c => c.value);
        
        console.log("💾 Datos a guardar:", { nombre, momento, tags });
        
        // Crear objeto de datos
        const recetaData = {
            nombre,
            imagenURL,
            descripcionCorta: descC,
            descripcionLarga: descL,
            tiempoMinutos: Number(tiempo),
            region,
            ingredientes,
            pasos,
            momento,
            tags,
            fechaActualizacion: new Date()
        };
        
        if (modoEdicion && recetaId) {
            // ACTUALIZAR receta existente
            console.log("🔄 Actualizando receta con ID:", recetaId);
            const docRef = doc(db, "recetas", recetaId);
            await updateDoc(docRef, recetaData);
            console.log("✅ Receta actualizada");
            alert("¡Receta actualizada exitosamente!");
            window.location.href = "lista_recetas.html";
        } else {
            // CREAR nueva receta
            console.log("➕ Creando nueva receta");
            recetaData.fechaCreacion = new Date();
            await addDoc(collection(db, "recetas"), recetaData);
            console.log("✅ Receta creada");
            alert("¡Receta guardada exitosamente!");
            recipeForm.reset();
        }
        
    } catch (error) {
        console.error("❌ Error al guardar:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = modoEdicion ? 'Actualizar Receta' : 'Registrar Receta';
    }
});