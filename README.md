# Proyecto: Aplicación de Ruleta y Sorteo de Equipos

Este proyecto consiste en el desarrollo de una aplicación web que integra dos herramientas principales: una ruleta aleatoria interactiva y un sistema de sorteo de equipos, todo construido utilizando HTML, CSS y JavaScript puro.

## 🚀 Integrantes del Equipo

*   **Araujo Champi José Eduardo**
*   **Huaynate Achachau José Luis**
*   **Melgarejo Guzmán Renzo Gustavo**

## ✨ Descripción General

La aplicación está diseñada para ser una herramienta versátil para aulas virtuales o cualquier escenario que requiera selecciones aleatorias o la formación de equipos de manera dinámica. Se ha puesto énfasis en una interfaz intuitiva y funcionalidades robustas, sin depender de librerías o frameworks externos.

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructura de las páginas web.
*   **CSS3:** Estilos y diseño visual de la aplicación.
*   **JavaScript (ES6+):** Lógica interactiva y funcionalidades.

## 🌟 Funcionalidades Principales

### 1. Aplicación de Ruleta Aleatoria

Una ruleta interactiva que permite seleccionar elementos de forma aleatoria a partir de una lista definida por el usuario.

*   **Ruleta Dinámica:** Visualmente atractiva con sectores de colores y un indicador de selección.
*   **Configuración Flexible:** Los elementos de la ruleta se definen en un `TextArea` editable.
*   **Guardado Automático:** Los datos del `TextArea` se guardan y recuperan automáticamente del `localStorage` del navegador.
*   **Interacción Múltiple:** Gira la ruleta haciendo clic en ella, pulsando la tecla `SPACE` o usando el botón "Iniciar".
*   **Funcionalidades de Control:**
    *   **Ocultar/Resaltar (`S`):** Oculta el último elemento sorteado de la ruleta y lo resalta en el `TextArea`.
    *   **Edición Rápida (`E`):** Habilita la edición del `TextArea` para modificar los elementos.
    *   **Reiniciar (`R`):** Restablece la ruleta, mostrando todos los elementos ocultos y eliminando resaltados.
    *   **Pantalla Completa (`F`):** Alterna el modo de pantalla completa para una mejor visualización.

### 2. Aplicación de Sorteo de Equipos

Una herramienta para organizar participantes en equipos de forma aleatoria, con opciones de configuración personalizables.

*   **Gestión de Participantes:** Un `TextArea` permite ingresar hasta 100 participantes (con un límite de 50 caracteres por nombre).
*   **Persistencia de Datos:** Los nombres de los participantes se guardan y recuperan del `localStorage`.
*   **Configuración del Sorteo:**
    *   Permite definir cómo se formarán los equipos: por cantidad fija de equipos o por número de participantes por equipo.
    *   Opción para añadir un título personalizado al sorteo (ej. "Copa del Mundo").
*   **Generación Aleatoria:** Un botón "Generar" distribuye los participantes en equipos de manera equitativa y aleatoria.
*   **Visualización Detallada:** Muestra los equipos generados en una nueva pantalla, organizados con subtítulos.
*   **Opciones de Exportación:**
    *   **Descargar JPG:** Exporta el resultado del sorteo como una imagen.
    *   **Copiar al Portapapeles:** Copia los equipos generados al portapapeles.
    *   **Copiar Columnas:** Copia los resultados organizados por columnas (útil para pegar en hojas de cálculo u otros documentos).

## 🚀 Cómo Ejecutar el Proyecto

1.  **Clonar el Repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd proyecto-ruleta-equipos
    ```
2.  **Abrir `index.html`:**
    Simplemente abre el archivo `index.html` en tu navegador web. Puedes hacerlo arrastrando el archivo a la ventana del navegador o haciendo doble clic sobre él.
3.  **Navegación:**
    Desde la página `index.html`, podrás seleccionar si deseas ir a la "Ruleta" o al "Sorteo de Equipos".

## 📂 Estructura del Proyecto
