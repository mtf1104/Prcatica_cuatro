let adminToken = null;

function mostrarSeccion(idSeccion) {

    const todasLasSecciones = document.querySelectorAll('.content-card');
    todasLasSecciones.forEach(seccion => {
        seccion.style.display = 'none';
    });

    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.style.display = 'block';
    }

    if (idSeccion === 'admin') {
        cargarContactos();
    }

    actualizarMenuActivo(idSeccion);
}

function actualizarMenuActivo(idSeccion) {
    const items = document.querySelectorAll('.nav-item');

    items.forEach(item => {
        item.classList.remove('active');
        const texto = item.innerText.toLowerCase().trim();

        if (idSeccion === 'inicio' && texto === 'm.v.') item.classList.add('active');

        if (
            (idSeccion === 'nosotros' && texto.includes('nosotros')) ||
            (idSeccion === 'proyectos' && texto.includes('proyectos')) ||
            (idSeccion === 'servicios' && texto.includes('servicios')) ||
            (idSeccion === 'contacto' && texto.includes('contacto')) ||
            (idSeccion === 'login' && texto.includes('login')) ||
            (idSeccion === 'admin' && texto.includes('panel'))
        ) {
            item.classList.add('active');
        }
    });
}

async function cargarContactos() {
    const tbody = document.getElementById('contactosBody');
    if (!tbody) return;

    if (!adminToken) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="padding:10px;">Inicia sesión para visualizar los contactos.</td>
          </tr>
        `;
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/contactos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Si tu backend usa token
                'Authorization': `Bearer ${adminToken}`
            }
        });

        if (!res.ok) {
            tbody.innerHTML = `
              <tr>
                <td colspan="4" style="padding:10px;">No se pudieron cargar los contactos (sin permiso o error).</td>
              </tr>
            `;
            return;
        }

        const contactos = await res.json();

        if (!Array.isArray(contactos) || contactos.length === 0) {
            tbody.innerHTML = `
              <tr>
                <td colspan="4" style="padding:10px;">No hay contactos registrados.</td>
              </tr>
            `;
            return;
        }

        tbody.innerHTML = contactos.map(c => `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">${c.nombre ?? ''}</td>
            <td style="padding:10px; border-bottom:1px solid #eee;">${c.correo ?? ''}</td>
            <td style="padding:10px; border-bottom:1px solid #eee;">${c.mensaje ?? ''}</td>
            <td style="padding:10px; border-bottom:1px solid #eee;">${c.fecha ?? ''}</td>
          </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="padding:10px;"> Error de conexión con el servidor.</td>
          </tr>
        `;
    }
}

function setAdminUI(logueado) {
    const navAdmin = document.getElementById('navAdmin');
    if (navAdmin) navAdmin.style.display = logueado ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('contacto');


    const formContacto = document.getElementById('contactForm');

    if (formContacto) {
        formContacto.addEventListener('submit', function(event) {
            event.preventDefault();

            const datosUsuario = {
                email: document.getElementById('email').value,
                nombre: document.getElementById('nombre').value,
                notas: document.getElementById('notas').value
            };

            fetch('http://localhost:3000/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            })
            .then(response => {
                if (response.ok) {
                    alert(`¡Gracias ${datosUsuario.nombre}! Tu información se guardó y te hemos enviado un correo de confirmación.`);
                    formContacto.reset();
                } else {
                    alert("Hubo un error al procesar tu solicitud.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("No se pudo conectar con el servidor.");
            });
        });
    }

  
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(event) {
            event.preventDefault();

            const credenciales = {
                usuario: document.getElementById('usuario').value,
                password: document.getElementById('password').value
            };

            try {
                const res = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credenciales)
                });

                if (!res.ok) {
                    alert("❌ Usuario o contraseña incorrectos.");
                    return;
                }

                const data = await res.json().catch(() => ({}));
                adminToken = data.token || "logged"; 
                alert(" Acceso correcto. Bienvenido administrador.");
                setAdminUI(true);
                mostrarSeccion('admin');

            } catch (e) {
                console.error(e);
                alert("No se pudo conectar con el servidor para el login.");
            }
        });
    }

   const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            adminToken = null;
            setAdminUI(false);
            alert("Sesión cerrada.");
            mostrarSeccion('login');
        });
    }
});
