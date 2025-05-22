// ====================================================================================
// VARIABLES GLOBALES
// ====================================================================================
let todasLasFacturas = []; // Almacena todas las facturas cargadas del servidor
let facturasFiltradas = []; // Almacena las facturas después de aplicar filtros
let paginaActual = 0; // Controla la página actual de la tabla
const facturasPorPagina = 5; // Número de facturas a mostrar por página

// ====================================================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ====================================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarFacturas(); // Carga todas las facturas al iniciar
    document.getElementById('buscarIdFactura').addEventListener('input', filtrarFacturas); // Listener para búsqueda por ID
});

// ====================================================================================
// CARGA DE FACTURAS DESDE EL SERVIDOR
// ====================================================================================
function cargarFacturas() {
    fetch('/api/factura') // Endpoint para obtener todas las facturas (singular)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            todasLasFacturas = data; // Almacena todas las facturas
            // Invertir el orden para mostrar las más recientes primero
            todasLasFacturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            filtrarFacturas(); // Aplica los filtros (inicialmente sin fechas y sin ID)
        })
        .catch(error => console.error('Error al cargar las facturas:', error));
}

// ====================================================================================
// FILTRADO DE FACTURAS POR RANGO DE FECHAS Y/O ID
// ====================================================================================
function filtrarFacturas() {
    const fechaInicioStr = document.getElementById('fechaInicio').value;
    const fechaFinStr = document.getElementById('fechaFin').value;
    const idFacturaBuscado = document.getElementById('buscarIdFactura').value.trim();

    // Convertir las fechas a objetos Date para comparación
    // Se añade un día a fechaFin para incluir todo el día seleccionado
    const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00') : null;
    const fechaFin = fechaFinStr ? new Date(fechaFinStr + 'T23:59:59') : null;

    facturasFiltradas = todasLasFacturas.filter(factura => {
        const fechaFactura = new Date(factura.fecha); // Fecha de la factura

        // Filtro por fecha
        const cumpleFechaInicio = !fechaInicio || fechaFactura >= fechaInicio;
        const cumpleFechaFin = !fechaFin || fechaFactura <= fechaFin;

        // Filtro por ID de factura
        const idMatch = idFacturaBuscado === '' || factura.id.toString().includes(idFacturaBuscado);

        return cumpleFechaInicio && cumpleFechaFin && idMatch;
    });

    // Asegurarse de que facturasFiltradas esté ordenado por fecha de más reciente a más antigua
    facturasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    mostrarPagina(0); // Vuelve a la primera página con los resultados filtrados
    generarControlesPaginacion(); // Regenera la paginación para los resultados filtrados
}

function resetearFiltros() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    document.getElementById('buscarIdFactura').value = ''; // Resetear el campo de búsqueda por ID
    filtrarFacturas(); // Vuelve a cargar todas las facturas sin filtros
}

// ====================================================================================
// PAGINACIÓN Y VISUALIZACIÓN DE LA TABLA
// ====================================================================================
function mostrarPagina(pagina) {
    paginaActual = pagina;
    const tablaBody = document.getElementById('facturasTablaBody');
    tablaBody.innerHTML = ''; // Limpia la tabla actual

    const inicio = pagina * facturasPorPagina;
    const fin = inicio + facturasPorPagina;
    const facturasPagina = facturasFiltradas.slice(inicio, fin); // Obtiene las facturas de la página actual

    if (facturasPagina.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No hay facturas para mostrar con los filtros aplicados.</td></tr>`;
        return;
    }

    facturasPagina.forEach((factura, index) => {
        const row = document.createElement('tr');
        // Añadir clase de animación a cada fila con un ligero retraso
        row.classList.add('animate__animated', 'animate__fadeInUp', `animate__delay-${index * 0.05}s`);

        const fechaFormateada = new Date(factura.fecha).toLocaleString('es-ES', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        // Construir la tabla de productos para mostrarla inline
        const productosHtml = factura.productos.map(producto => {
            const precioConDescuento = (parseFloat(producto.precio) * (1 - (parseFloat(producto.descuento) || 0) / 100)).toFixed(2);
            const subtotal = (precioConDescuento * parseInt(producto.cantidad)).toFixed(2);
            return `
                    <tr>
                        <td>${producto.nombre}</td>
                        <td>${producto.cantidad}</td>
                        <td>${parseFloat(producto.precio).toFixed(2)}€</td>
                        <td>${(producto.descuento || 0)}%</td>
                        <td>${subtotal}€</td>
                    </tr>
                `;
        }).join('');

        row.innerHTML = `
                <td data-label="ID Factura">${factura.id.toString().padStart(4, '0')}</td>
                <td data-label="Fecha">${fechaFormateada}</td>
                <td data-label="Total">${parseFloat(factura.total).toFixed(2)}€</td>
                <td class="actions-cell">
                    <button class="btn btn-info btn-sm" onclick="verProductos(${factura.id})">
                        <i class="bi bi-eye"></i> Ver Productos
                    </button>
                    <button class="btn btn-success btn-sm" onclick="imprimirFactura(${factura.id})">
                        <i class="bi bi-printer"></i> Imprimir
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarFactura(${factura.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
        tablaBody.appendChild(row);

        // Fila adicional para los productos, inicialmente oculta
        const productosRow = document.createElement('tr');
        productosRow.id = `productosFacturaRow${factura.id}`;
        productosRow.style.display = 'none'; // Oculta por defecto
        productosRow.innerHTML = `
                <td colspan="4">
                    <div id="productosFactura${factura.id}" class="productos-factura">
                        <h6 class="mb-3 text-center">Detalles de Productos de la Factura ${factura.id.toString().padStart(4, '0')}</h6>
                        <table class="table table-bordered table-sm text-center">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Precio/Ud.</th>
                                    <th>Desc.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHtml}
                            </tbody>
                        </table>
                    </div>
                </td>
            `;
        tablaBody.appendChild(productosRow);
    });

    generarControlesPaginacion(); // Regenera los controles de paginación
}

function generarControlesPaginacion() {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = ''; // Limpia los controles actuales

    const totalPaginas = Math.ceil(facturasFiltradas.length / facturasPorPagina);

    // Botón "Anterior"
    const btnPrev = document.createElement('button');
    btnPrev.classList.add('btn', 'btn-secondary');
    btnPrev.innerHTML = `<i class="bi bi-chevron-left"></i>`;
    btnPrev.disabled = paginaActual === 0;
    btnPrev.onclick = () => mostrarPagina(paginaActual - 1);
    paginationContainer.appendChild(btnPrev);

    // Números de página
    const rango = 2; // Número de páginas a mostrar a cada lado de la actual
    let startPage = Math.max(0, paginaActual - rango);
    let endPage = Math.min(totalPaginas - 1, paginaActual + rango);

    if (startPage > 0) {
        const btnFirst = document.createElement('button');
        btnFirst.classList.add('btn', 'btn-secondary');
        btnFirst.textContent = 1;
        btnFirst.onclick = () => mostrarPagina(0);
        paginationContainer.appendChild(btnFirst);
        if (startPage > 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.classList.add('px-2');
            paginationContainer.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btnPage = document.createElement('button');
        btnPage.classList.add('btn', 'btn-secondary');
        btnPage.textContent = i + 1;
        if (i === paginaActual) {
            btnPage.classList.add('active'); // Marca la página actual como activa
        }
        btnPage.onclick = () => mostrarPagina(i);
        paginationContainer.appendChild(btnPage);
    }

    if (endPage < totalPaginas - 1) {
        if (endPage < totalPaginas - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.classList.add('px-2');
            paginationContainer.appendChild(dots);
        }
        const btnLast = document.createElement('button');
        btnLast.classList.add('btn', 'btn-secondary');
        btnLast.textContent = totalPaginas;
        btnLast.onclick = () => mostrarPagina(totalPaginas - 1);
        paginationContainer.appendChild(btnLast);
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
// VER DETALLE DE PRODUCTOS (INLINE)
// ====================================================================================
function verProductos(facturaId) {
    const productosFacturaRow = document.getElementById(`productosFacturaRow${facturaId}`);
    if (productosFacturaRow) {
        productosFacturaRow.style.display = productosFacturaRow.style.display === 'none' ? 'table-row' : 'none';
    }
}

// ====================================================================================
// GENERACIÓN DE TICKET (PDF con jsPDF) - Reutilizada de caja.html
// ====================================================================================
async function imprimirFactura(idFactura) {
    const { jsPDF } = window.jspdf;
    let factura;
    try {
        const response = await fetch(`/api/factura/${idFactura}`); // Endpoint singular
        if (!response.ok) throw new Error('Factura no encontrada para imprimir');
        factura = await response.json();
    } catch (error) {
        console.error('Error al obtener factura para imprimir:', error);
        alert('No se pudo obtener la factura para imprimir.');
        return;
    }

    let personalizacion = {};
    try {
        const response = await fetch('/ticket-personalizado');
        if (response.ok) personalizacion = await response.json();
        else console.warn('No se pudo cargar la personalización del ticket.');
    } catch (error) {
        console.error('Error al cargar la personalización del ticket:', error);
    }

    const { logoUrl, fontSize, fontType, showDate, customText } = personalizacion;
    const fuente = fontType || "Helvetica";
    const tamanoFuente = fontSize || 12;
    const anchoPagina = 200; // Ancho fijo del ticket en mm

    // Calcular altura dinámica (ajustada para coincidir con generarTicket)
    const alturaBase = 180; // Altura para encabezado, logo, info básica, etc.
    const alturaPorProducto = 10; // Espacio para cada línea de producto
    const margenInferior = 80; // Espacio aproximado para las condiciones y el pie
    const alturaCalculada = alturaBase + (factura.productos ? factura.productos.length : 0) * alturaPorProducto + margenInferior;

    const doc = new jsPDF({ unit: "mm", format: [anchoPagina, alturaCalculada] });
    let y = 10; // Posición Y inicial

    doc.setFont(fuente, "normal");
    doc.setFontSize(tamanoFuente);

    // Añadir logo si está configurado
    if (logoUrl) {
        try {
            const logoImg = await loadImage(logoUrl);
            // Centrar imagen en el ancho de la página
            doc.addImage(logoImg, 'JPEG', (anchoPagina - 180) / 2, y, 180, 60);
            y += 60 + 10;
        } catch (error) {
            console.error('Error al cargar el logo para el PDF:', error);
            doc.text("Logo no disponible", anchoPagina / 2, y, { align: "center" });
            y += 10;
        }
    }

    // Añadir texto personalizado
    if (customText) {
        const lineas = splitTextToLines(doc, customText, 180);
        lineas.forEach(linea => {
            doc.setFont(undefined, "italic");
            doc.text(linea, anchoPagina / 2, y, { align: "center" });
            y += 6;
        });
        y += 2;
    }

    // Información de contacto y fiscal
    doc.setFontSize(tamanoFuente + 2); doc.setFont(undefined, "bold");
    doc.text(`Telf.954 17 17 16`, 10, y);
    doc.text(`NIF: 28742186-Y`, 123, y);
    y += 20; // Ajustado para coincidir con generarTicket

    // Título y número de factura
    doc.setFontSize(tamanoFuente + 15); doc.setFont(undefined, "bold");
    // Usar el ID de la factura cargada
    doc.text(`Factura Nº ${factura.id.toString().padStart(4, '0')}`, 10, y);
    y += 8;

    doc.setFontSize(tamanoFuente - 5); doc.setFont(undefined, "normal");
    doc.text("FACTURA SIMPLIFICADA", 10, y);

    // Fecha de la factura
    if (showDate !== false) {
        const fechaFactura = new Date(factura.fecha).toLocaleString('es-ES');
        doc.setFontSize(tamanoFuente - 1); doc.setFont(undefined, "normal");
        doc.text(`${fechaFactura}`, 125, y);
        y += 10;
    } else { y += 10; }

    // Encabezados de la tabla de productos
    doc.setFontSize(tamanoFuente + 1); doc.setFont(undefined, "bold");
    doc.text("Producto", 10, y);
    doc.text("Cant.", 100, y, { align: "right" }); // Ajustado a 100
    doc.text("Desc.", 140, y, { align: "right" }); // Ajustado a 140
    doc.text("Importe", 190, y, { align: "right" }); // Ajustado a 190
    doc.setFont(undefined, "normal");
    doc.setLineWidth(0.1); doc.line(10, y + 2, anchoPagina - 10, y + 2);
    y += 10;

    // Listado de productos
    factura.productos.forEach(prod => {
        const descuento = parseFloat(prod.descuento) || 0;
        const precio = parseFloat(prod.precio) || 0;
        const cantidad = parseInt(prod.cantidad) || 0;
        const precioConDescuento = precio * (1 - descuento / 100);
        const totalProductoConDescuento = (precioConDescuento * cantidad).toFixed(2);
        const nombreProductoVisual = prod.nombre.length > 35 ? prod.nombre.substring(0, 32) + "..." : prod.nombre;
        y += 4;
        doc.text(nombreProductoVisual, 10, y);
        doc.text(cantidad.toString(), 100, y, { align: "right" });
        doc.text(descuento > 0 ? `${descuento.toFixed(0)}%` : "-", 140, y, { align: "right" });
        doc.text(`${totalProductoConDescuento}€`, 190, y, { align: "right" });
        y += 7;
    });

    // Línea después de los productos
    doc.setLineWidth(0.1); doc.line(10, y, anchoPagina - 10, y);
    y += 20;

    // Total
    doc.setFont(undefined, "bold"); doc.setFontSize(tamanoFuente + 15);
    doc.text("TOTAL", 80, y);
    doc.text(`${parseFloat(factura.total).toFixed(2)}€`, 190, y, { align: "right" });
    y += 10;
    doc.setLineWidth(0.1); doc.line(10, y, anchoPagina - 10, y);

    // Desglose de IVA
    const porcentajeIVA = 21;
    const totalSinIVA = parseFloat(factura.total) / (1 + porcentajeIVA / 100);
    const totalIVA = parseFloat(factura.total) - totalSinIVA;
    y += 10;
    doc.setFontSize(tamanoFuente); doc.setFont(undefined, "normal");
    doc.text("Base imponible:", 80, y);
    doc.text(`% IVA (${porcentajeIVA}%)`, 143, y);
    y += 10;
    doc.text(`${totalSinIVA.toFixed(2)}€`, 135, y, { align: "right" });
    doc.text(`${totalIVA.toFixed(2)}€`, 190, y, { align: "right" });
    y += 10;
    doc.setLineWidth(0.1); doc.line(10, y, anchoPagina - 10, y);
    y += 10;

    // Mensaje de agradecimiento y condiciones
    doc.setFontSize(tamanoFuente - 1); doc.setFont(undefined, "normal");
    doc.text("GRACIAS POR SU COMPRA", anchoPagina / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(tamanoFuente - 4);
    const condiciones = [
        "Ticket obligatorio para cambios (7 días después de la compra).",
        "No se devuelve el dinero, se canjea por un vale de caja.",
        "Garantía del producto según normativa vigente (24 MESES)."
    ];
    // Formato de condiciones para coincidir con generarTicket
    condiciones.forEach(condicion => {
        const lineasCondicion = splitTextToLines(doc, condicion, anchoPagina - 20);
        lineasCondicion.forEach(linea => { doc.text(linea, 10, y); y += 4; });
        y += 2;
    });

    doc.autoPrint(); // Abre el diálogo de impresión automáticamente
    window.open(doc.output('bloburl'), '_blank'); // Abre el PDF en una nueva pestaña
}

// Función auxiliar para cargar imágenes (para el logo del ticket)
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}

// Función auxiliar para dividir texto en líneas (para adaptarse al ancho del ticket)
function splitTextToLines(doc, text, maxWidth) {
    return doc.splitTextToSize(text, maxWidth);
}

// ====================================================================================
// ELIMINAR FACTURA
// ====================================================================================
function eliminarFactura(idFactura) {
    if (!confirm(`¿Está seguro de que desea eliminar la factura Nº ${idFactura.toString().padStart(4, '0')}? Esta acción es irreversible.`)) {
        return;
    }

    fetch(`/api/factura/${idFactura}`, { // Endpoint singular
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al eliminar la factura: ${response.status}`);
            }
            alert('Factura eliminada correctamente.');
            cargarFacturas(); // Recarga la lista de facturas para actualizar la tabla
        })
        .catch(error => {
            console.error('Error al eliminar la factura:', error);
            alert(`No se pudo eliminar la factura: ${error.message}`);
        });
}