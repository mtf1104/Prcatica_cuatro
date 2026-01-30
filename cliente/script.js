// Función para cambiar entre pestañas
function mostrarSeccion(idSeccion) {
    
    // 1. Ocultar todas las tarjetas
    const todasLasSecciones = document.querySelectorAll('.content-card');
    todasLasSecciones.forEach(seccion => {
        seccion.style.display = 'none';
    });

    // 2. Mostrar la sección seleccionada
    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.style.display = 'block';
    }

    // 3. Actualizar el estado "activo" en el menú (visual)
    actualizarMenuActivo(idSeccion);
}

function actualizarMenuActivo(idSeccion) {
    const items = document.querySelectorAll('.nav-item');
    
    items.forEach(item => {
        // Quitamos la clase active de todos
        item.classList.remove('active');
        
        // Comprobamos si este botón corresponde a la sección
        // (Un truco simple buscando el texto dentro del enlace o el div)
        const texto = item.innerText.toLowerCase().trim();
        
        if (idSeccion === 'inicio' && texto === 'm.v.') {
            item.classList.add('active');
        } else if (texto.includes(idSeccion)) {
            item.classList.add('active');
        }
    });
}

// Inicialización: Asegurar que el formulario funcione (código anterior)
document.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('contacto'); // O la sección que prefieras por defecto
    
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Capturar datos
        const datosUsuario = {
            email: document.getElementById('email').value,
            nombre: document.getElementById('nombre').value,
            notas: document.getElementById('notas').value
        };

        // Enviar datos al servidor (Backend)
        fetch('http://localhost:3000/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        })
        .then(response => {
            if (response.ok) {
                alert(`¡Gracias ${datosUsuario.nombre}! Tu información se guardó y te hemos enviado un correo de confirmación.`);
                form.reset();
            } else {
                alert("Hubo un error al procesar tu solicitud.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("No se pudo conectar con el servidor.");
        });
    });
});