document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mostrar saludo dinámico en el Home
    actualizarSaludo();

    // 2. Navegación SPA (Single Page Application)
    window.mostrarSeccion = function(idSeccion) {
        // Ocultar todas
        document.querySelectorAll('.section-content').forEach(s => {
            s.classList.remove('active-section');
            s.classList.add('hidden');
        });
        
        // Mostrar la elegida
        const seccionActiva = document.getElementById(idSeccion);
        if(seccionActiva) {
            seccionActiva.classList.remove('hidden');
            seccionActiva.classList.add('active-section');
        }
    };

    // 3. Manejo del Formulario con Backend
    const form = document.getElementById('contactForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const statusMsg = document.getElementById('statusMessage');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Interfaz: Cambiar botón a estado "Cargando"
            const originalBtnText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
            btnSubmit.disabled = true;
            statusMsg.textContent = "";

            const datosUsuario = {
                email: document.getElementById('email').value,
                nombre: document.getElementById('nombre').value,
                notas: document.getElementById('notas').value
            };

            // Petición al Servidor
            fetch('http://localhost:3000/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (response.ok) {
                    mostrarMensaje('¡Enviado! Revisa tu correo.', 'green');
                    form.reset();
                } else {
                    mostrarMensaje('Error en el servidor.', 'red');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarMensaje('Error de conexión. ¿Está encendido el servidor?', 'red');
            })
            .finally(() => {
                // Restaurar botón
                btnSubmit.innerHTML = originalBtnText;
                btnSubmit.disabled = false;
            });
        });
    }
});

function actualizarSaludo() {
    const hora = new Date().getHours();
    const titulo = document.getElementById('greeting');
    if(titulo) {
        if (hora < 12) titulo.innerText = "Buenos días";
        else if (hora < 18) titulo.innerText = "Buenas tardes";
        else titulo.innerText = "Buenas noches";
    }
}

function mostrarMensaje(texto, color) {
    const msg = document.getElementById('statusMessage');
    msg.style.color = color === 'green' ? '#10b981' : '#ef4444';
    msg.textContent = texto;
    // Borrar mensaje a los 5 segundos
    setTimeout(() => { msg.textContent = ''; }, 5000);
}