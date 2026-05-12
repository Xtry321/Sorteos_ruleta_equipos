/* =========================================== */
/* LÓGICA DE LA RULETA - ruleta.js             */
/* Proyecto: Ruleta Aula Virtual - UNCP         */
/* Funciones y variables nombradas en español   */
/* =========================================== */

'use strict';

// ---- CONSTANTES ----
const CLAVE_STORAGE = 'ruleta_lista_elementos';
const COLORES_BASE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const COLOR_TEXTO_OSCURO = '#2d2d2d';
const COLOR_TEXTO_CLARO  = '#ffffff';
const VELOCIDAD_INICIAL_MIN = 8;    // vueltas mínimas
const VELOCIDAD_INICIAL_MAX = 12;   // vueltas máximas
const DURACION_GIRO_MS = 4500;      // milisegundos totales del giro

// ---- ESTADO GLOBAL ----
let listaElementos      = [];   // Array de strings (todos)
let elementosOcultos    = new Set(); // Índices ocultos (ya sorteados + S)
let ultimoSorteado      = -1;   // Índice del último elemento sorteado
let estaGirando         = false;
let modoEdicion         = false;
let anguloActual        = 0;    // ángulo actual del canvas (radianes)
let historialSorteos    = [];   // [{nombre, color, numero}]

// ---- REFERENCIAS DOM ----
const canvasRuleta       = document.getElementById('canvasRuleta');
const ctx                = canvasRuleta.getContext('2d');
const textareaElementos  = document.getElementById('textareaElementos');
const panelResultado     = document.getElementById('panelResultado');
const textoResultado     = document.getElementById('textoResultado');
const estadoTextarea     = document.getElementById('estadoTextarea');
const iconoEstado        = document.getElementById('iconoEstado');
const textoEstado        = document.getElementById('textoEstado');
const modalResultado     = document.getElementById('modalResultado');
const modalNombre        = document.getElementById('modalNombre');
const historialLista     = document.getElementById('historialLista');
const leyendaColores     = document.getElementById('leyendaColores');
const numTotal           = document.getElementById('numTotal');
const numActivos         = document.getElementById('numActivos');
const numOcultos         = document.getElementById('numOcultos');
const btnIniciar         = document.getElementById('btnIniciar');
const contenedorRuleta   = document.getElementById('contenedorRuleta');

// ====================================================
// F2 / UTILIDADES DE COLOR
// ====================================================
function obtenerColorElemento(indiceGlobal) {
    return COLORES_BASE[indiceGlobal % COLORES_BASE.length];
}

function esColorClaro(hexColor) {
    const r = parseInt(hexColor.slice(1,3), 16);
    const g = parseInt(hexColor.slice(3,5), 16);
    const b = parseInt(hexColor.slice(5,7), 16);
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminancia > 0.6;
}

// ====================================================
// F1 / DIBUJAR LA RULETA
// ====================================================
function dibujarRuleta() {
    const elementosActivos = obtenerElementosActivos();
    const totalActivos = elementosActivos.length;
    const ancho  = canvasRuleta.width;
    const alto   = canvasRuleta.height;
    const cx     = ancho / 2;
    const cy     = alto / 2;
    const radio  = Math.min(cx, cy) - 5;

    ctx.clearRect(0, 0, ancho, alto);

    if (totalActivos === 0) {
        dibujarRuletaVacia(cx, cy, radio);
        return;
    }

    const anguloSector = (2 * Math.PI) / totalActivos;

    elementosActivos.forEach((elemento, posicion) => {
        const anguloInicio = anguloActual + posicion * anguloSector - Math.PI / 2;
        const anguloFin    = anguloInicio + anguloSector;
        const color        = obtenerColorElemento(elemento.indiceGlobal);

        // --- Sector (arco relleno) ---
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radio, anguloInicio, anguloFin);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Borde del sector
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Texto del elemento ---
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(anguloInicio + anguloSector / 2);

        const colorTexto = esColorClaro(color) ? COLOR_TEXTO_OSCURO : COLOR_TEXTO_CLARO;
        ctx.fillStyle = colorTexto;

        const distanciaTexto = radio * 0.62;
        const maxAncho       = radio * 0.55;
        const texto          = elemento.nombre;

        // Tamaño de fuente adaptativo según número de elementos y longitud del texto
        let tamanoFuente = Math.max(9, Math.min(14, 200 / totalActivos, 80 / texto.length));
        ctx.font = `bold ${tamanoFuente}px 'Segoe UI', sans-serif`;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';

        // Truncar si es muy largo
        let textoMostrado = texto;
        while (ctx.measureText(textoMostrado).width > maxAncho && textoMostrado.length > 3) {
            textoMostrado = textoMostrado.slice(0, -1);
        }
        if (textoMostrado !== texto) textoMostrado = textoMostrado.slice(0, -1) + '…';

        ctx.shadowColor   = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur    = 3;
        ctx.fillText(textoMostrado, distanciaTexto, 0);
        ctx.restore();
    });

    // --- Centro decorativo ---
    const gradienteCentro = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    gradienteCentro.addColorStop(0, '#ffffff');
    gradienteCentro.addColorStop(1, '#e8ecff');
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = gradienteCentro;
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ícono central
    ctx.font = '18px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', cx, cy);
}

function dibujarRuletaVacia(cx, cy, radio) {
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#bbb';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Agrega elementos', cx, cy - 12);
    ctx.font = '13px Segoe UI';
    ctx.fillText('en el textarea →', cx, cy + 12);
}

// ====================================================
// OBTENER ELEMENTOS ACTIVOS (no ocultos)
// ====================================================
function obtenerElementosActivos() {
    return listaElementos
        .map((nombre, indice) => ({ nombre, indice }))
        .filter(e => !elementosOcultos.has(e.indice))
        .map((e, posicion) => ({ ...e, indiceGlobal: e.indice, posicion }));
}

// ====================================================
// F3 / LEER ELEMENTOS DEL TEXTAREA
// ====================================================
function leerElementosDelTextarea() {
    const texto    = textareaElementos.value;
    const lineas   = texto.split('\n');
    const elementos = lineas
        .map(l => l.trim())
        .filter(l => l.length > 0);
    return elementos;
}

// ====================================================
// F5 / GUARDAR Y RECUPERAR DEL LOCAL STORAGE
// ====================================================
function guardarEnStorage() {
    localStorage.setItem(CLAVE_STORAGE, textareaElementos.value);
}

function recuperarDeStorage() {
    const valorGuardado = localStorage.getItem(CLAVE_STORAGE);
    if (valorGuardado !== null && valorGuardado.trim() !== '') {
        textareaElementos.value = valorGuardado;
    } else {
        // Valores por defecto de ejemplo
        textareaElementos.value = [
            'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
            'Luis Rodríguez', 'Carmen Sánchez', 'Pedro González', 'Isabel Torres'
        ].join('\n');
    }
}

// ====================================================
// F6 / ACTUALIZAR RULETA CUANDO CAMBIA EL TEXTAREA
// ====================================================
function actualizarDesdeTextarea() {
    const nuevosElementos = leerElementosDelTextarea();
    listaElementos    = nuevosElementos;
    elementosOcultos  = new Set(); // Al editar, se reinician los ocultos
    ultimoSorteado    = -1;

    guardarEnStorage();
    actualizarContadores();
    actualizarLeyendaColores();
    dibujarRuleta();
}

// ====================================================
// F4 / HABILITAR / DESHABILITAR EDICIÓN
// ====================================================
function habilitarEdicion() {
    if (modoEdicion) return;
    modoEdicion = true;
    textareaElementos.removeAttribute('readonly');
    textareaElementos.style.cursor = 'text';
    estadoTextarea.classList.add('editando');
    iconoEstado.textContent = '✏️';
    textoEstado.textContent = 'Modo edición activo — Esc o clic fuera para salir';
    textareaElementos.focus();
}

function deshabilitarEdicion() {
    if (!modoEdicion) return;
    modoEdicion = false;
    textareaElementos.setAttribute('readonly', true);
    textareaElementos.style.cursor = 'default';
    estadoTextarea.classList.remove('editando');
    iconoEstado.textContent = '🔒';
    textoEstado.textContent = 'Solo lectura — presiona E o clic para editar';
    actualizarDesdeTextarea();
}

// ====================================================
// F1 / ANIMACIÓN DE GIRO (LÓGICA CORREGIDA)
// ====================================================
function iniciarGiro() {
    if (estaGirando) return;

    const elementosActivos = obtenerElementosActivos();
    if (elementosActivos.length < 1) {
        mostrarAlerta('No hay elementos en la ruleta. Agrega nombres en el textarea.');
        return;
    }
    if (elementosActivos.length === 1) {
        // Solo uno: se selecciona automáticamente
        procesarElementoSeleccionado(elementosActivos[0]);
        return;
    }

    estaGirando = true;
    contenedorRuleta.classList.add('en-giro');
    btnIniciar.disabled = true;

    const totalActivos   = elementosActivos.length;
    const anguloSector   = (2 * Math.PI) / totalActivos;

    // Elegir ganador aleatoriamente
    const indiceGanador  = Math.floor(Math.random() * totalActivos);
    const elementoGanador = elementosActivos[indiceGanador];

    // Cálculo corregido: queremos que el centro del sector del ganador quede en el puntero (12 en punto, ángulo = -PI/2)
    // La posición angular del centro del sector i es: anguloActual + (i + 0.5)*anguloSector - PI/2
    // Para alinearlo con el puntero (-PI/2) necesitamos que:
    // anguloActual_final + (i + 0.5)*anguloSector - PI/2 = -PI/2  → anguloActual_final + (i+0.5)*anguloSector = 0 (mód 2π)
    const posicionCentro = (anguloActual + (indiceGanador + 0.5) * anguloSector) % (2 * Math.PI);
    // Rotación necesaria para llevar ese centro al ángulo 0 (puntero)
    let deltaNecesario = (2 * Math.PI) - posicionCentro;
    // Aseguramos que sea positivo (si ya es 0, tomamos 0 + vueltas extra)
    if (deltaNecesario < 0) deltaNecesario += 2 * Math.PI;

    // Sumamos varias vueltas completas aleatorias para que el giro sea largo y emocionante
    const vueltasExtra = VELOCIDAD_INICIAL_MIN + Math.random() * (VELOCIDAD_INICIAL_MAX - VELOCIDAD_INICIAL_MIN);
    deltaNecesario += vueltasExtra * 2 * Math.PI;

    const anguloFinal = anguloActual + deltaNecesario;
    const tiempoInicio = performance.now();
    const anguloInicial = anguloActual;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animarFrame(tiempoActual) {
        const tiempoTranscurrido = tiempoActual - tiempoInicio;
        const progreso = Math.min(tiempoTranscurrido / DURACION_GIRO_MS, 1);
        const progresoSuave = easeOutCubic(progreso);

        anguloActual = anguloInicial + (anguloFinal - anguloInicial) * progresoSuave;
        dibujarRuleta();

        if (progreso < 1) {
            requestAnimationFrame(animarFrame);
        } else {
            // Normalizar ángulo a [0, 2π)
            anguloActual = anguloActual % (2 * Math.PI);
            finalizarGiro(elementoGanador);
        }
    }

    requestAnimationFrame(animarFrame);
}

function finalizarGiro(elementoGanador) {
    estaGirando = false;
    contenedorRuleta.classList.remove('en-giro');
    btnIniciar.disabled = false;
    procesarElementoSeleccionado(elementoGanador);
}

function procesarElementoSeleccionado(elemento) {
    ultimoSorteado = elemento.indice;
    const colorElemento = obtenerColorElemento(elemento.indiceGlobal);

    // Mostrar en panel resultado
    textoResultado.textContent = elemento.nombre;
    panelResultado.classList.remove('animado');
    void panelResultado.offsetWidth; // reflow para reiniciar animación
    panelResultado.classList.add('animado');

    // Agregar al historial
    agregarAlHistorial(elemento.nombre, colorElemento);

    // Mostrar modal
    mostrarModal(elemento.nombre);
}

// ====================================================
// MODAL DE RESULTADO
// ====================================================
function mostrarModal(nombreElemento) {
    modalNombre.textContent = nombreElemento;
    modalResultado.classList.add('visible');
}

function cerrarModal() {
    modalResultado.classList.remove('visible');
}

// ====================================================
// F7 / OCULTAR ÚLTIMO SORTEADO (tecla S)
// ====================================================
function ocultarUltimoSorteado() {
    if (ultimoSorteado === -1) {
        mostrarAlerta('Primero realiza un sorteo para ocultar un elemento.');
        return;
    }
    if (elementosOcultos.has(ultimoSorteado)) {
        mostrarAlerta('El último elemento sorteado ya está oculto.');
        return;
    }

    elementosOcultos.add(ultimoSorteado);
    resaltarElementoOcultoEnTextarea(ultimoSorteado);
    actualizarContadores();
    dibujarRuleta();
}

function resaltarElementoOcultoEnTextarea(indiceElemento) {
    const lineas = textareaElementos.value.split('\n');
    let contadorElementos = 0;
    const nuevasLineas = lineas.map(linea => {
        const lineaTrimmed = linea.trim();
        if (lineaTrimmed.length === 0) return linea;
        if (contadorElementos === indiceElemento) {
            contadorElementos++;
            if (!linea.startsWith('  ░ ')) {
                return '  ░ ' + linea;
            }
        } else {
            contadorElementos++;
        }
        return linea;
    });
    textareaElementos.value = nuevasLineas.join('\n');
}

// ====================================================
// F8 / REINICIAR (tecla R)
// ====================================================
function reiniciarRuleta() {
    elementosOcultos = new Set();
    ultimoSorteado   = -1;

    // Limpiar marcas del textarea
    const lineas = textareaElementos.value.split('\n');
    const lineasLimpias = lineas.map(linea => {
        if (linea.startsWith('  ░ ')) {
            return linea.slice(4);
        }
        return linea;
    });
    textareaElementos.value = lineasLimpias.join('\n');
    listaElementos = leerElementosDelTextarea();

    textoResultado.textContent = '—';
    actualizarContadores();
    actualizarLeyendaColores();
    dibujarRuleta();
    guardarEnStorage();
}

// ====================================================
// F9 / PANTALLA COMPLETA (tecla F)
// ====================================================
function alternarPantallaCompleta() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('No se pudo activar pantalla completa:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ====================================================
// HISTORIAL DE SORTEOS
// ====================================================
function agregarAlHistorial(nombre, color) {
    const numero = historialSorteos.length + 1;
    historialSorteos.unshift({ nombre, color, numero });

    const vacio = historialLista.querySelector('.historial-vacio');
    if (vacio) vacio.remove();

    const entrada = document.createElement('div');
    entrada.className = 'historial-entrada';
    entrada.innerHTML = `
        <span class="historial-num">#${historialSorteos.length}</span>
        <span class="historial-color" style="background:${color}"></span>
        <span class="historial-texto">${escaparHTML(nombre)}</span>
    `;
    historialLista.insertBefore(entrada, historialLista.firstChild);
}

// ====================================================
// LEYENDA DE COLORES
// ====================================================
function actualizarLeyendaColores() {
    leyendaColores.innerHTML = '';
    const elementosActivos = obtenerElementosActivos();
    if (elementosActivos.length === 0) {
        leyendaColores.innerHTML = '<span style="color:#bbb;font-size:0.8rem">Sin elementos activos</span>';
        return;
    }
    elementosActivos.forEach(elemento => {
        const color = obtenerColorElemento(elemento.indiceGlobal);
        const item  = document.createElement('div');
        item.className = 'leyenda-item';
        item.innerHTML = `
            <span class="leyenda-color" style="background:${color}"></span>
            <span class="leyenda-nombre" title="${escaparHTML(elemento.nombre)}">${escaparHTML(elemento.nombre)}</span>
        `;
        leyendaColores.appendChild(item);
    });
}

// ====================================================
// CONTADORES
// ====================================================
function actualizarContadores() {
    const total   = listaElementos.length;
    const ocultos = elementosOcultos.size;
    const activos = total - ocultos;

    numTotal.textContent   = total;
    numActivos.textContent = activos;
    numOcultos.textContent = ocultos;
}

// ====================================================
// UTILIDADES
// ====================================================
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
}

function mostrarAlerta(mensaje) {
    const anterior = textoResultado.textContent;
    textoResultado.textContent = '⚠ ' + mensaje;
    setTimeout(() => {
        textoResultado.textContent = anterior;
    }, 2000);
}

// ====================================================
// LISTENERS DE TECLADO (Space, S, E, R, F)
// ====================================================
document.addEventListener('keydown', function(evento) {
    const tecla = evento.key;

    // Ignorar si se está editando el textarea (excepto Escape)
    if (modoEdicion && tecla !== 'Escape') return;

    switch (tecla) {
        case ' ':
        case 'Spacebar':
            evento.preventDefault();
            iniciarGiro();       // F3 - Girar con SPACE
            break;
        case 's':
        case 'S':
            ocultarUltimoSorteado();   // F7 - Ocultar último sorteado
            break;
        case 'e':
        case 'E':
            habilitarEdicion();        // F7 - Habilitar edición
            break;
        case 'r':
        case 'R':
            reiniciarRuleta();         // F8 - Reiniciar
            break;
        case 'f':
        case 'F':
            alternarPantallaCompleta(); // F9 - Pantalla completa
            break;
        case 'Escape':
            if (modoEdicion) deshabilitarEdicion();
            if (modalResultado.classList.contains('visible')) cerrarModal();
            break;
    }
});

// ====================================================
// LISTENERS DEL TEXTAREA
// ====================================================
textareaElementos.addEventListener('input', function() {
    if (!modoEdicion) return;
    actualizarDesdeTextarea();
});

textareaElementos.addEventListener('blur', function() {
    setTimeout(() => {
        if (modoEdicion) deshabilitarEdicion();
    }, 100);
});

textareaElementos.addEventListener('click', function() {
    habilitarEdicion();
});

// ====================================================
// CLIC EN LA RULETA PARA GIRAR (F3)
// ====================================================
contenedorRuleta.addEventListener('click', function() {
    iniciarGiro();
});

// ====================================================
// CERRAR MODAL CON CLIC FUERA
// ====================================================
modalResultado.addEventListener('click', function(e) {
    if (e.target === modalResultado) cerrarModal();
});

// ====================================================
// INICIALIZACIÓN
// ====================================================
function inicializarAplicacion() {
    recuperarDeStorage();          // F5 - Recuperar desde localStorage
    listaElementos = leerElementosDelTextarea(); // F3
    actualizarContadores();
    actualizarLeyendaColores();
    dibujarRuleta();               // F1 - Dibujar ruleta inicial
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);