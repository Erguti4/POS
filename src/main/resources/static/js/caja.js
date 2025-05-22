// ====================================================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN INICIAL
// ====================================================================================
let numeroFactura = 0;
let productos = [];
let dineroCajaActiva = 0;

// ====================================================================================
// MANEJO DEL NÚMERO DE FACTURA
// ====================================================================================
function obtenerUltimoNumeroFactura() {
    fetch('/api/factura/ultimo-id')
        .then(response => response.json())
        .then(data => {
            numeroFactura = data.ultimoId + 1;
            document.getElementById('numeroFactura').value = numeroFactura;
        })
        .catch(error => {
            console.error('Error al obtener el último número de factura:', error);
            numeroFactura = 1;
            document.getElementById('numeroFactura').value = numeroFactura;
        });
}

// ====================================================================================
// FUNCIÓN PARA ACTUALIZAR FECHA Y HORA
// ====================================================================================
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Formato de 24 horas
    };
    const dateTimeString = now.toLocaleString('es-ES', options);
    document.getElementById('currentDateTime').textContent = dateTimeString;
}

// ====================================================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ====================================================================================
window.onload = function() {
    obtenerUltimoNumeroFactura();
    const guardado = localStorage.getItem('dineroCajaActiva');
    if (guardado !== null) {
        dineroCajaActiva = parseFloat(guardado);
    }
    updateDateTime(); // Llamar a la función al cargar la página
    setInterval(updateDateTime, 1000); // Actualizar cada segundo
};

// ====================================================================================
// MANEJO DE PRODUCTOS (BÚSQUEDA, AGREGAR, CREAR)
// ====================================================================================
document.getElementById('codigoBarraInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarProducto();
    }
});

function buscarProducto() {
    const codigo = document.getElementById('codigoBarraInput').value.trim();
    if (!codigo) return;

    fetch(`/productos/${codigo}`)
        .then(response => {
            if (!response.ok) throw new Error("Producto no encontrado");
            return response.json();
        })
        .then(data => {
            const precio = parseFloat(data.precio);
            if (isNaN(precio)) {
                alert("Error: el precio recibido no es válido.");
                return;
            }
            agregarProductoAFactura(data.nombre, precio);
            document.getElementById('codigoBarraInput').value = '';
        })
        .catch(() => {
            document.getElementById('codigoProducto').value = codigo; // Pasar el código al modal
            const modal = new bootstrap.Modal(document.getElementById('crearProductoModal'));
            modal.show();
        });
}

function agregarProductoAFactura(nombre, precio) {
    const cantidad = 1;
    const existente = productos.find(p => p.nombre === nombre);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        productos.push({ nombre, precio, cantidad, descuento: 0 });
    }
    actualizarFactura();
}

function crearNuevoProducto() {
    const nombre = document.getElementById('nombreProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const codigoBarra = document.getElementById('codigoProducto').value;

    if (!nombre || isNaN(precio) || !codigoBarra) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    fetch("/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoBarra, nombre, precio })
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al crear el producto');
            return res.json();
        })
        .then(nuevoProducto => {
            agregarProductoAFactura(nuevoProducto.nombre, nuevoProducto.precio);
            const modal = bootstrap.Modal.getInstance(document.getElementById('crearProductoModal'));
            modal.hide();
            document.getElementById('codigoBarraInput').value = '';
            document.getElementById('nombreProducto').value = '';
            document.getElementById('precioProducto').value = '';
            // document.getElementById('codigoProducto').value = ''; // No limpiar el código por si se reusa o se quiere ver
        })
        .catch((error) => {
            console.error("Error al guardar el producto:", error);
            alert("Error al guardar el producto.");
        });
}

// ====================================================================================
// ACTUALIZACIÓN Y VISUALIZACIÓN DE LA FACTURA (MODIFICADO PARA NUEVO DISEÑO)
// ====================================================================================
function actualizarFactura() {
    const contenedor = document.getElementById('facturaItems');
    const totalElem = document.getElementById('totalFactura');
    const baseImponibleElem = document.getElementById('baseImponible'); // Get the new elements
    const ivaCalculadoElem = document.getElementById('ivaCalculado');   // Get the new elements
    contenedor.innerHTML = '';
    let totalGeneralFactura = 0;

    productos.forEach((producto, index) => {
        const descuento = parseFloat(producto.descuento) || 0;
        const precioProducto = parseFloat(producto.precio) || 0;
        const cantidadProducto = parseInt(producto.cantidad) || 0;
        const precioConDescuento = precioProducto * (1 - descuento / 100);
        const importeItem = precioConDescuento * cantidadProducto;

        const item = document.createElement('div');
        item.classList.add('d-flex', 'product-item', 'gap-2');
        item.innerHTML = `
            <div style="flex-basis: 50%;"><input type="text" value="${producto.nombre}" class="form-control input-nombre" onblur="editarProducto(${index}, 'nombre', this.value)"></div>
            <div style="flex-basis: 10%;"><input type="number" value="${cantidadProducto}" class="form-control input-cantidad" min="1" onblur="editarProducto(${index}, 'cantidad', this.value)"></div>
            <div style="flex-basis: 15%;"><input type="number" value="${precioProducto.toFixed(2)}" class="form-control input-precio" min="0" step="0.01" onblur="editarProducto(${index}, 'precio', this.value)"></div>
            <div style="flex-basis: 10%;"><input type="number" value="${descuento.toFixed(2)}" class="form-control input-descuento" min="0" max="100" step="0.01" onblur="editarProducto(${index}, 'descuento', this.value)"></div>
            <div style="flex-basis: 15%;" class="product-item-subtotal">${importeItem.toFixed(2)}€</div>
            <div style="flex-basis: 5%; text-align: center;"><button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})"><i class="bi bi-trash"></i></button></div>
        `;
        contenedor.appendChild(item);
        totalGeneralFactura += importeItem;
    });

    totalElem.textContent = totalGeneralFactura.toFixed(2);

    // Calculate and display Base Imponible and IVA
    const porcentajeIVA = 21; // Assuming 21% IVA based on your ticket generation logic
    const baseImponible = totalGeneralFactura / (1 + porcentajeIVA / 100);
    const ivaCalculado = totalGeneralFactura - baseImponible;

    baseImponibleElem.textContent = `${baseImponible.toFixed(2)}€`;
    ivaCalculadoElem.textContent = `${ivaCalculado.toFixed(2)}€`;
}

function editarProducto(index, campo, valor) {
    if (index < 0 || index >= productos.length) return;
    const producto = productos[index];
    switch (campo) {
        case 'cantidad':
            const cantidadNum = parseInt(valor);
            if (!isNaN(cantidadNum) && cantidadNum > 0) producto.cantidad = cantidadNum;
            break;
        case 'precio':
            const precioNum = parseFloat(valor);
            if (!isNaN(precioNum) && precioNum >= 0) producto.precio = precioNum;
            break;
        case 'descuento':
            const descuentoNum = parseFloat(valor);
            if (!isNaN(descuentoNum) && descuentoNum >= 0 && descuentoNum <= 100) producto.descuento = descuentoNum;
            break;
        case 'nombre':
            if (typeof valor === 'string' && valor.trim() !== '') producto.nombre = valor.trim();
            break;
        default: return;
    }
    actualizarFactura();
}

function eliminarProducto(index) {
    if (index >= 0 && index < productos.length) {
        productos.splice(index, 1);
        actualizarFactura();
    }
}

// ====================================================================================
// MANEJO DEL DINERO EN CAJA
// ====================================================================================
function sumarDineroCajaActiva(monto) {
    dineroCajaActiva += monto;
    localStorage.setItem('dineroCajaActiva', dineroCajaActiva.toFixed(2));
}

// ====================================================================================
// ENVÍO DE FACTURA AL BACKEND
// ====================================================================================
function enviarFacturaAlBackend(productosFactura, totalFacturaCalculado) {
    const data = {
        productos: productosFactura.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad, descuento: p.descuento || 0 })),
        total: totalFacturaCalculado
    };
    fetch('/api/factura/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) throw new Error('Error al guardar la factura');
            return response.json();
        })
        .then(data => console.log('Factura guardada con éxito:', data))
        .catch(error => console.error('Hubo un error al guardar la factura:', error));
}

// ====================================================================================
// CIERRE DE CAJA
// ====================================================================================
function cerrarCaja() {
    const totalCaja = dineroCajaActiva.toFixed(2);
    if (!confirm(`¿Está seguro de que desea cerrar la caja con un total de ${totalCaja}€?`)) return;

    fetch(`/api/caja/cerrar?totalVentas=${totalCaja}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert("Caja cerrada correctamente.");
                dineroCajaActiva = 0;
                localStorage.removeItem('dineroCajaActiva');
                productos = [];
                actualizarFactura();
                obtenerUltimoNumeroFactura();
                window.location.href = "/"; // Opcional: redirigir
            } else {
                alert("Error al cerrar la caja.");
                response.text().then(text => console.error("Detalle del error al cerrar caja:", text));
            }
        })
        .catch(err => {
            console.error("Error de red al cerrar la caja:", err);
            alert("Error de red al cerrar la caja.");
        });
}

// ====================================================================================
// GENERACIÓN DE TICKET (PDF con jsPDF)
// ====================================================================================
async function generarTicket(productosFactura, totalFacturaCalculado) {
    const { jsPDF } = window.jspdf;
    const alturaBase = 180;
    const alturaPorProducto = 10;
    const margenInferior = 80;
    const alturaCalculada = alturaBase + productosFactura.length * alturaPorProducto + margenInferior;
    const doc = new jsPDF({ unit: "mm", format: [200, alturaCalculada] });

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
    const anchoPagina = doc.internal.pageSize.getWidth();
    let y = 10;

    doc.setFont(fuente, "normal");
    doc.setFontSize(tamanoFuente);

    if (logoUrl) {
        try {
            const logoImg = await loadImage(logoUrl);
            doc.addImage(logoImg, 'JPEG', (anchoPagina - 180) / 2, y, 180, 60); // Ajustar tamaño logo si es necesario
            y += 60 + 10;
        } catch (error) {
            console.error('Error al cargar el logo:', error);
            doc.text("Logo no disponible", anchoPagina / 2, y, { align: "center" });
            y += 10;
        }
    }

    if (customText) {
        const lineas = splitTextToLines(doc, customText, 180);
        lineas.forEach(linea => {
            doc.setFont(undefined, "italic");
            doc.text(linea, anchoPagina / 2, y, { align: "center" });
            y += 6;
        });
        y += 2;
    }

    doc.setFontSize(tamanoFuente + 2); doc.setFont(undefined, "bold");
    doc.text(`Telf.954 17 17 16`, 10, y);
    doc.text(`NIF: 28742186-Y`, 123, y);
    y+= 20;

    doc.setFontSize(tamanoFuente + 15); doc.setFont(undefined, "bold");
    doc.text(`Factura Nº ${document.getElementById('numeroFactura').value}`, 10, y);
    y += 8;

    doc.setFontSize(tamanoFuente - 5); doc.setFont(undefined, "normal");
    doc.text("FACTURA SIMPLIFICADA", 10, y);

    if (showDate !== false) {
        const fecha = new Date().toLocaleString('es-ES');
        doc.setFontSize(tamanoFuente - 1); doc.setFont(undefined, "normal");
        doc.text(`${fecha}`, 125, y);
        y += 10;
    } else { y += 10; }

    doc.setFontSize(tamanoFuente + 1); doc.setFont(undefined, "bold");
    doc.text("Producto", 10, y);
    doc.text("Cant.", 100, y, { align: "right" });
    doc.text("Desc.", 140, y, { align: "right" });
    doc.text("Importe", 190, y, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.setLineWidth(0.1); doc.line(10, y + 2, anchoPagina - 10, y + 2);
    y += 10;

    productosFactura.forEach(prod => {
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

    doc.setLineWidth(0.1); doc.line(10, y, anchoPagina - 10, y);
    y += 20;
    doc.setFont(undefined, "bold"); doc.setFontSize(tamanoFuente + 15 );
    doc.text("TOTAL", 80, y);
    doc.text(`${totalFacturaCalculado.toFixed(2)}€`, 190, y, { align: "right" });
    y += 10;
    doc.setLineWidth(0.1); doc.line(10, y, anchoPagina - 10, y);

    const porcentajeIVA = 21;
    const totalSinIVA = totalFacturaCalculado / (1 + porcentajeIVA / 100);
    const totalIVA = totalFacturaCalculado - totalSinIVA;
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

    doc.setFontSize(tamanoFuente - 1); doc.setFont(undefined, "normal");
    doc.text("GRACIAS POR SU COMPRA", anchoPagina / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(tamanoFuente - 4);
    const condiciones = [
        "Ticket obligatorio para cambios (7 días después de la compra).",
        "No se devuelve el dinero, se canjea por un vale de caja.",
        "Garantía del producto según normativa vigente (24 MESES)."
    ];
    condiciones.forEach(condicion => {
        const lineasCondicion = splitTextToLines(doc, condicion, anchoPagina - 20);
        lineasCondicion.forEach(linea => { doc.text(linea, 10, y); y += 4; });
        y += 2;
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}

function splitTextToLines(doc, text, maxWidth) {
    return doc.splitTextToSize(text, maxWidth);
}

// ====================================================================================
// FINALIZACIÓN DE FACTURA
// ====================================================================================
async function finalizarFactura() {
    if (productos.length === 0) {
        alert("No hay productos en la factura.");
        return;
    }
    const totalFacturaCalculado = productos.reduce((total, p) => {
        const precio = parseFloat(p.precio) || 0;
        const cantidad = parseFloat(p.cantidad) || 0;
        const descuento = parseFloat(p.descuento) || 0;
        return total + (precio * (1 - descuento / 100)) * cantidad;
    }, 0);

    if (isNaN(totalFacturaCalculado)) {
        alert("Error al calcular el total de la factura.");
        return;
    }

    try {
        await generarTicket(productos, totalFacturaCalculado);
        sumarDineroCajaActiva(totalFacturaCalculado);
        enviarFacturaAlBackend(productos, totalFacturaCalculado);
        productos = [];
        actualizarFactura();
        numeroFactura++;
        document.getElementById('numeroFactura').value = numeroFactura;
    } catch (error) {
        console.error("Error al finalizar la factura:", error);
        alert("Ocurrió un error al finalizar la factura: " + error.message);
    }
}