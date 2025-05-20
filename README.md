-----

# Sistema de Punto de Venta Táctil (POS Táctil)

Este proyecto implementa un Sistema de Punto de Venta (POS) diseñado para operar en entornos táctiles, proporcionando una solución integral para la gestión de transacciones comerciales. La arquitectura del sistema se basa en un backend robusto desarrollado con Spring Boot y un frontend interactivo construido con tecnologías web estándar (HTML, CSS, JavaScript).

## ✨ Funcionalidades Principales

El sistema POS Táctil ofrece las siguientes capacidades:

  * **Gestión de Sesiones de Caja:**
      * Apertura y cierre controlado de sesiones de caja.
      * Registro y visualización del historial de todas las sesiones de caja, incluyendo fechas de apertura y cierre, y el total de ventas.
      * Funcionalidad para eliminar sesiones de caja específicas. Las sesiones con un total de ventas de `0` al cierre no se persistirán en el historial.
  * **Gestión de Productos:**
      * Capacidades completas de Crear, Leer, Actualizar y Eliminar (CRUD) para la base de datos de productos.
      * Búsqueda eficiente de productos mediante código de barras 🔍.
  * **Gestión de Facturación:**
      * Generación instantánea de facturas para cada transacción de venta.
      * Detalle pormenorizado de los productos incluidos en cada factura, con indicación de cantidad, precio y descuentos aplicados.
      * Acceso a un registro histórico de todas las facturas emitidas.
  * **Personalización de Tickets:**
      * Configuración personalizable de elementos del ticket como el logotipo, tamaño y tipo de fuente, texto de pie de página, y la opción de incluir la fecha. 📄
  * **Interfaz de Usuario Táctil:**
      * Diseño de interfaz optimizado para pantallas táctiles, caracterizado por elementos de gran tamaño y una navegación fluida. 👆

## 🛠️ Tecnologías Utilizadas

### Backend

  * **Lenguaje de Programación:** Java 17+
  * **Framework:** Spring Boot 
  * **Persistencia de Datos:** Spring Data JPA
  * **Base de Datos:** H2 Database 
  * **Productividad:** Lombok 

### Frontend

  * **Lenguajes:** HTML5 , CSS3 , JavaScript (ES6+) 
  * **Framework CSS:** Bootstrap 5.3 
  * **Iconografía:** Bootstrap Icons
  * **Animaciones:** Animate.css

## 🚀 Instrucciones de Despliegue

### Requisitos del Sistema

  * Java Development Kit (JDK) 17 o superior.
  * Apache Maven.

### Pasos para la Ejecución

1.  **Clonar el Repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/pos-tactil.git
    cd pos-tactil
    ```

2.  **Compilar el Backend:**
    Desde el directorio raíz del proyecto (donde se encuentra `pom.xml`), ejecute el siguiente comando para compilar el proyecto y generar el archivo JAR ejecutable:

    ```bash
    mvn clean install
    ```

    Esto creará el archivo `Pos_tactil-0.0.1-SNAPSHOT.jar` dentro del subdirectorio `target/`.

3.  **Iniciar la Aplicación:**
    Para iniciar el servidor Spring Boot y abrir automáticamente la interfaz de usuario en el navegador, utilice el script de inicio adecuado para su sistema operativo:

      * **Para Sistemas Windows (.bat):**
        Cree un archivo llamado `iniciar.bat` en el directorio raíz del proyecto con el siguiente contenido:

        ```batch
        @echo off
        echo Iniciando POS Táctil...
        start "POS Táctil" java -jar target\Pos_tactil-0.0.1-SNAPSHOT.jar
        timeout /t 5 >nul
        start http://localhost:8080
        pause
        ```

        Ejecute el script haciendo doble clic en `iniciar.bat`.

      * **Para Sistemas Linux/macOS (.sh):**
        Cree un archivo llamado `iniciar.sh` en el directorio raíz del proyecto con el siguiente contenido:

        ```bash
        #!/bin/bash
        echo "Iniciando POS Táctil..."
        java -jar target/Pos_tactil-0.0.1-SNAPSHOT.jar &
        sleep 5
        xdg-open http://localhost:8080 || open http://localhost:8080
        read -p "Presiona Enter para cerrar la ventana del script..."
        ```

        Otorgue permisos de ejecución al script (`chmod +x iniciar.sh`) y luego ejecútelo (`./iniciar.sh`).

Una vez ejecutado el script, la aplicación se iniciará en `http://localhost:8080` y se abrirá automáticamente en su navegador web predeterminado.



## 🤝 Contribuciones

Se agradecen las contribuciones al proyecto. Para proponer mejoras o correcciones, por favor, siga el flujo de trabajo estándar de GitHub: `fork` el repositorio, cree una rama para sus cambios, realice sus `commits` y envíe un `Pull Request` detallando sus modificaciones.

## 📄 Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulte el archivo `LICENSE` para obtener más detalles.

-----
