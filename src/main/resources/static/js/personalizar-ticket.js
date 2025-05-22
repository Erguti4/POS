document.addEventListener('DOMContentLoaded', () => {
    const logoUrlInput = document.getElementById('logoUrl');
    const fontSizeInput = document.getElementById('fontSize');
    const fontTypeSelect = document.getElementById('fontType');
    const showDateCheckbox = document.getElementById('showDate');
    const customTextInput = document.getElementById('customText');
    const personalizarForm = document.getElementById('personalizarForm');
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const logoFileInput = document.getElementById('logoFile');

    // Función para cargar la personalización existente
    const cargarPersonalizacion = () => {
        fetch('/ticket-personalizado')
            .then(response => {
                if (!response.ok) {
                    // Si no hay personalización guardada, se usa un objeto vacío para valores por defecto
                    if (response.status === 404) return {};
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Rellenar los campos con los datos actuales de personalización o valores por defecto
                logoUrlInput.value = data.logoUrl || '';
                fontSizeInput.value = data.fontSize || 12; // Valor por defecto
                fontTypeSelect.value = data.fontType || 'Helvetica, sans-serif'; // Valor por defecto
                showDateCheckbox.checked = data.showDate !== undefined ? data.showDate : true; // Por defecto mostrar fecha
                customTextInput.value = data.customText || '';

                // Actualizar la previsualización al cargar
                updatePreview();
            })
            .catch(error => {
                console.error('Error al cargar la personalización del ticket:', error);
                // Asegurarse de que la vista previa se actualice incluso con errores de carga
                updatePreview();
            });
    };

    // Cargar personalización al inicio
    cargarPersonalizacion();

    // Manejo del formulario de guardado
    personalizarForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el envío por defecto del formulario

        const ticketData = {
            logoUrl: logoUrlInput.value,
            fontSize: parseInt(fontSizeInput.value) || 12,
            fontType: fontTypeSelect.value,
            showDate: showDateCheckbox.checked,
            customText: customTextInput.value
        };

        // Enviar los cambios al backend (asumiendo endpoint PUT para actualización)
        fetch('/ticket-personalizado', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert('¡Ticket personalizado guardado correctamente!');
                updatePreview(); // Actualizar previsualización con los datos guardados
            })
            .catch(error => {
                console.error('Error al guardar la personalización:', error);
                alert('Hubo un error al guardar la personalización. Por favor, intente de nuevo.');
            });
    });

    // Manejo de la carga de imagen (disparar el input de tipo file)
    uploadLogoBtn.addEventListener('click', () => {
        logoFileInput.click();
    });

    // Procesar la imagen cargada y mostrarla en el campo de URL
    logoFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Mostrar la URL de la imagen en el campo logoUrl
                logoUrlInput.value = e.target.result;
                updatePreview(); // Actualizar previsualización
            };
            reader.readAsDataURL(file); // Lee el archivo como una URL de datos (Base64)
        }
    });

    // Actualizar la previsualización en tiempo real al cambiar los campos
    logoUrlInput.addEventListener('input', updatePreview);
    fontSizeInput.addEventListener('input', updatePreview);
    fontTypeSelect.addEventListener('change', updatePreview);
    showDateCheckbox.addEventListener('change', updatePreview);
    customTextInput.addEventListener('input', updatePreview);
});

// Función para actualizar la previsualización del ticket
function updatePreview() {
    const ticketLogoElement = document.getElementById('ticketLogo');
    const ticketTextElement = document.getElementById('ticketText');

    const logoUrl = document.getElementById('logoUrl').value;
    const fontSize = parseInt(document.getElementById('fontSize').value) || 12;
    const fontType = document.getElementById('fontType').value;
    const showDate = document.getElementById('showDate').checked;
    const customText = document.getElementById('customText').value;

    // Actualizar el logo
    if (logoUrl) {
        ticketLogoElement.src = logoUrl;
        ticketLogoElement.style.display = 'block'; // Mostrar el logo
    } else {
        ticketLogoElement.src = ''; // Limpiar src
        ticketLogoElement.style.display = 'none'; // Ocultar si no hay URL
    }

    // Actualizar el texto del ticket
    let previewContent = customText || '¡Tu texto personalizado aparecerá aquí!';


    ticketTextElement.textContent = previewContent;

    // Cambiar el tamaño y tipo de fuente
    ticketTextElement.style.fontSize = fontSize + 'px';
    ticketTextElement.style.fontFamily = fontType;
    ticketTextElement.style.lineHeight = '1.4'; // Mejorar legibilidad
}