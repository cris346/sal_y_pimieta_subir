import { db, auth } from './firebase.js';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const listaContainer = document.getElementById('listaRecetas');
const btnLogout = document.getElementById('btnLogout');

// Verificar Autenticación
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        console.log("✅ Usuario autenticado, cargando recetas...");
        cargarRecetas();
    }
});

// Función para cargar recetas
async function cargarRecetas() {
    listaContainer.innerHTML = '<p style="text-align:center; width:100%">Cargando recetas...</p>';
    
    try {
        console.log("🔍 Consultando base de datos...");
        const querySnapshot = await getDocs(collection(db, "recetas"));
        console.log("📊 Recetas encontradas:", querySnapshot.size);
        
        listaContainer.innerHTML = ''; // Limpiar loader

        if (querySnapshot.empty) {
            listaContainer.innerHTML = '<p style="text-align:center; width:100%; color:#7f8c8d;">No hay recetas registradas aún. ¡Crea tu primera receta!</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            console.log("📝 Receta cargada:", id, data.nombre);

            // Crear tarjeta HTML
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${data.imagenURL || 'https://via.placeholder.com/250x150?text=Sin+Imagen'}" 
                     alt="${data.nombre}" 
                     onerror="this.src='https://via.placeholder.com/250x150?text=Error+Cargando'">
                <h3>${data.nombre || 'Sin nombre'}</h3>
                <p>${data.descripcionCorta || 'Sin descripción'}</p>
                ${data.tiempoMinutos ? `<p style="font-size:0.85rem; color:#7f8c8d;">⏱️ ${data.tiempoMinutos} min</p>` : ''}
                ${data.momento && data.momento.length > 0 ? `<p style="font-size:0.8rem; color:#95a5a6;">${data.momento.join(', ')}</p>` : ''}
                <div class="actions">
                    <a href="formulario.html?id=${id}" class="btn-edit">✏️ Editar</a>
                    <button class="btn-delete" data-id="${id}">🗑️ Borrar</button>
                </div>
            `;
            listaContainer.appendChild(card);
        });

        // Agregar eventos a los botones de borrar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', borrarReceta);
        });
        
        console.log("✅ Todas las recetas cargadas correctamente");

    } catch (error) {
        console.error("❌ Error al cargar recetas:", error);
        console.error("Detalles:", error.message);
        listaContainer.innerHTML = '<p style="color:red; text-align:center; width:100%;">❌ Error al cargar recetas. Revisa la consola.</p>';
    }
}

// Función para borrar
async function borrarReceta(e) {
    const id = e.target.getAttribute('data-id');
    console.log("🗑️ Intentando borrar receta:", id);
    
    if(confirm("¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer.")) {
        try {
            await deleteDoc(doc(db, "recetas", id));
            console.log("✅ Receta eliminada:", id);
            alert("✅ Receta eliminada exitosamente");
            cargarRecetas(); // Recargar la lista
        } catch (error) {
            console.error("❌ Error al borrar:", error);
            alert("❌ Error al borrar: " + error.message);
        }
    }
}

// Cerrar Sesión
btnLogout.addEventListener('click', async () => {
    if(confirm("¿Cerrar sesión?")) {
        await signOut(auth);
        window.location.href = "login.html";
    }
});