// ====================================================================================
// VARIABLES GLOBALES
// ====================================================================================
let productos = []; // Almacena todos los productos cargados del servidor
let paginaActual = 0; // Controla la página actual de la tabla
const productosPorPagina = 5; // Número de productos a mostrar por página
let productosFiltrados = []; // Almacena los productos después de aplicar un filtro de búsqueda

// ====================================================================================
// MANEJO DEL MODAL (Crear/Editar Producto)
// ====================================================================================
const productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
const productoModalLabel = document.getElementById('productoModalLabel');
const productoIdInput = document.getElementById('productoId');
const codigoBarraInput = document.getElementById('codigoBarra');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');

// Limpia y prepara el modal para crear un nuevo producto
document.getElementById('productoModal').addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget; // Botón que disparó el modal
    const isEdit = button && button.getAttribute('data-bs-whatever') === 'edit';

    if (isEdit) {
        // Si es edición, se rellenan los campos
        productoModalLabel.textContent = 'Editar Producto';
        const productoToEdit = productos.find(p => p.id == button.getAttribute('data-product-id'));
        if (productoToEdit) {
            productoIdInput.value = productoToEdit.id;
            codigoBarraInput.value = productoToEdit.codigoBarra;
            nombreInput.value = productoToEdit.nombre;
            precioInput.value = productoToEdit.precio;
            codigoBarraInput.readOnly = true; // No permitir cambiar el código de barras en edición
        }
    } else {
        // Si es creación, se resetean los campos
        productoModalLabel.textContent = 'Crear Producto';
        productoIdInput.value = '';
        codigoBarraInput.value = '';
        nombreInput.value = '';
        precioInput.value = '';
        codigoBarraInput.readOnly = false; // Permitir escribir el código de barras
    }
});

// ====================================================================================
// CARGA INICIAL DE DATOS
// ====================================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos(); // Carga todos los productos al iniciar
    // Listener para el input de búsqueda
    document.getElementById('buscarProductoInput').addEventListener('input', filtrarProductos);
});

function cargarProductos() {
    fetch('/productos') // Endpoint para obtener todos los productos
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            productos = data; // Almacena todos los productos
            productosFiltrados = [...productos]; // Inicializa los productos filtrados con todos
            mostrarPagina(0); // Muestra la primera página
            generarControlesPaginacion(); // Genera los botones de paginación
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}

// ====================================================================================
// PAGINACIÓN Y VISUALIZACIÓN DE LA TABLA
// ====================================================================================
function mostrarPagina(pagina) {
    paginaActual = pagina;
    const tablaBody = document.getElementById('productosTablaBody');
    tablaBody.innerHTML = ''; // Limpia la tabla actual

    const inicio = pagina * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin); // Obtiene los productos de la página actual

    productosPagina.forEach((producto, index) => {
        const row = document.createElement('tr');
        // Añadir clase de animación a cada fila con un ligero retraso
        row.classList.add('animate__animated', 'animate__fadeInUp', `animate__delay-${index * 0.05}s`);

        row.innerHTML = `
                <td data-label="Código">${producto.codigoBarra}</td>
                <td data-label="Nombre">${producto.nombre}</td>
                <td data-label="Precio">${parseFloat(producto.precio).toFixed(2)}€</td>
                <td class="actions-cell">
                    <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#productoModal" data-bs-whatever="edit" data-product-id="${producto.id}">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto('${producto.codigoBarra}')">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
        tablaBody.appendChild(row);
    });

    generarControlesPaginacion(); // Regenera los controles de paginación
}

function generarControlesPaginacion() {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = ''; // Limpia los controles actuales

    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    // Botón "Anterior"
    const btnPrev = document.createElement('button');
    btnPrev.classList.add('btn', 'btn-secondary');
    btnPrev.innerHTML = `<i class="bi bi-chevron-left"></i>`;
    btnPrev.disabled = paginaActual === 0;
    btnPrev.onclick = () => mostrarPagina(paginaActual - 1);
    paginationContainer.appendChild(btnPrev);

    // Números de página
    for (let i = 0; i < totalPaginas; i++) {
        const btnPage = document.createElement('button');
        btnPage.classList.add('btn', 'btn-secondary');
        btnPage.textContent = i + 1;
        if (i === paginaActual) {
            btnPage.classList.add('active'); // Marca la página actual como activa
        }
        btnPage.onclick = () => mostrarPagina(i);
        paginationContainer.appendChild(btnPage);
    }

    // Botón "Siguiente"
    const btnNext = document.createElement('button');
    btnNext.classList.add('btn', 'btn-secondary');
    btnNext.innerHTML = `<i class="bi bi-chevron-right"></i>`;
    btnNext.disabled = paginaActual === totalPaginas - 1 || totalPaginas === 0;
    btnNext.onclick = () => mostrarPagina(paginaActual + 1);
    paginationContainer.appendChild(btnNext);
}

// ====================================================================================
// FILTRADO DE PRODUCTOS
// ====================================================================================
function filtrarProductos() {
    const searchTerm = document.getElementById('buscarProductoInput').value.toLowerCase();
    productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm) ||
        producto.codigoBarra.toLowerCase().includes(searchTerm)
    );
    mostrarPagina(0); // Vuelve a la primera página con los resultados filtrados
}

// ====================================================================================
// GESTIÓN DE PRODUCTOS (Guardar, Editar, Eliminar)
// ====================================================================================
function guardarProducto() {
    const id = productoIdInput.value;
    const codigoBarra = codigoBarraInput.value.trim();
    const nombre = nombreInput.value.trim();
    const precio = parseFloat(precioInput.value);

    if (!codigoBarra || !nombre || isNaN(precio) || precio < 0) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    const nuevoProducto = {
        id: id ? parseInt(id) : null, // ID solo si es una edición
        codigoBarra: codigoBarra,
        nombre: nombre,
        precio: precio
    };

    let method = 'POST';
    let url = '/productos';

    if (id) {
        // Si hay un ID, es una actualización (PUT)
        method = 'PUT';
        url = `/productos/${id}`;
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoProducto),
    })
        .then(response => {
            if (!response.ok) {
                // Si el servidor devuelve un error (ej. 409 Conflict por código de barras duplicado)
                return response.json().then(err => { throw new Error(err.message || `Error HTTP! estado: ${response.status}`); });
            }
            return response.json();
        })
        .then(data => {
            alert(`Producto ${id ? 'actualizado' : 'creado'} correctamente.`);
            productoModal.hide(); // Cierra el modal
            cargarProductos(); // Recarga la lista de productos para ver los cambios
        })
        .catch(error => {
            console.error('Error al guardar el producto:', error);
            alert(`Error al guardar el producto: ${error.message}`);
        });
}

function eliminarProducto(codigoBarra) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
        return;
    }

    fetch(`/productos/${codigoBarra}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || `Error HTTP! estado: ${response.status}`); });
            }
            alert('Producto eliminado correctamente.');
            cargarProductos(); // Recarga la lista de productos
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
            alert(`Error al eliminar el producto: ${error.message}`);
        });
}