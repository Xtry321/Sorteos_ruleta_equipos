// ===========================================
// SORTEO DE EQUIPOS - LÓGICA PRINCIPAL
// ===========================================

// Variables globales
let equiposGenerados = [];
let participantesActuales = [];
let animacionTimeout = null;

// Constantes para LocalStorage
const STORAGE_PARTICIPANTES_KEY = 'equipos_participantes';

// ===========================================
// FUNCIONES PRINCIPALES (F1)
// ===========================================

// Cargar datos del localStorage al iniciar
function cargarDatosIniciales() {
    const guardados = localStorage.getItem(STORAGE_PARTICIPANTES_KEY);
    if (guardados) {
        const textarea = document.getElementById('listaParticipantes');
        textarea.value = guardados;
        // Mostrar mensaje de carga
        mostrarMensajeTemporal('✅ Datos cargados del almacenamiento local', 'alert-success');
    }
}

// Guardar participantes en localStorage (F1)
function guardarParticipantes() {
    const textarea = document.getElementById('listaParticipantes');
    const participantes = textarea.value;
    localStorage.setItem(STORAGE_PARTICIPANTES_KEY, participantes);
}

// Validar participantes (máx 100, máx 50 caracteres por nombre)
function validarParticipantes(texto) {
    const lineas = texto.split(/\r?\n/).filter(linea => linea.trim() !== '');
    
    if (lineas.length === 0) {
        throw new Error('Debe ingresar al menos un participante');
    }
    
    if (lineas.length > 100) {
        throw new Error(`Máximo 100 participantes permitidos. Actualmente hay ${lineas.length}`);
    }
    
    for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].trim().length > 50) {
            throw new Error(`El participante "${lineas[i].substring(0, 30)}..." excede los 50 caracteres`);
        }
    }
    
    return lineas.map(l => l.trim());
}

// ===========================================
// LÓGICA DE SORTEO (F2)
// ===========================================

// Obtener configuración del sorteo
function obtenerConfiguracion() {
    const tipoSorteo = document.getElementById('tipoSorteo').value;
    const cantidadValor = parseInt(document.getElementById('cantidadValor').value);
    const tituloEquipos = document.getElementById('tituloEquipos').value.trim() || 'Equipo';
    
    return { tipoSorteo, cantidadValor, tituloEquipos };
}

// Calcular número de equipos según configuración
function calcularNumeroEquipos(participantes, tipoSorteo, cantidadValor) {
    if (tipoSorteo === 'equipos') {
        // Cantidad de equipos especificada
        return Math.min(cantidadValor, participantes.length);
    } else {
        // Participantes por equipo especificados
        return Math.ceil(participantes.length / cantidadValor);
    }
}

// Calcular participantes por equipo
function calcularParticipantesPorEquipo(participantes, totalEquipos) {
    const participantesPorEquipo = Math.floor(participantes.length / totalEquipos);
    const sobrantes = participantes.length % totalEquipos;
    
    const distribucion = Array(totalEquipos).fill(participantesPorEquipo);
    for (let i = 0; i < sobrantes; i++) {
        distribucion[i]++;
    }
    
    return distribucion;
}

// Mezclar array (algoritmo Fisher-Yates)
function mezclarArray(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Generar equipos aleatorios
function generarEquipos() {
    try {
        // Obtener participantes
        const textarea = document.getElementById('listaParticipantes');
        const participantesTexto = textarea.value;
        const participantes = validarParticipantes(participantesTexto);
        
        // Guardar en localStorage
        guardarParticipantes();
        
        // Obtener configuración
        const { tipoSorteo, cantidadValor, tituloEquipos } = obtenerConfiguracion();
        
        // Calcular número de equipos
        let totalEquipos;
        if (tipoSorteo === 'equipos') {
            totalEquipos = cantidadValor;
            if (totalEquipos > participantes.length) {
                throw new Error(`No se pueden generar ${totalEquipos} equipos con solo ${participantes.length} participantes`);
            }
        } else {
            totalEquipos = Math.ceil(participantes.length / cantidadValor);
        }
        
        // Mezclar participantes aleatoriamente
        const participantesMezclados = mezclarArray(participantes);
        
        // Calcular distribución
        const distribucion = calcularParticipantesPorEquipo(participantesMezclados, totalEquipos);
        
        // Crear equipos
        const equipos = [];
        let indiceActual = 0;
        
        for (let i = 0; i < totalEquipos; i++) {
            const miembros = participantesMezclados.slice(indiceActual, indiceActual + distribucion[i]);
            equipos.push({
                numero: i + 1,
                titulo: `${tituloEquipos} ${i + 1}`,
                miembros: miembros
            });
            indiceActual += distribucion[i];
        }
        
        return equipos;
        
    } catch (error) {
        mostrarError(error.message);
        return null;
    }
}

// ===========================================
// ANIMACIÓN Y VISUALIZACIÓN (F3)
// ===========================================

// Mostrar equipos con animación uno a uno
async function mostrarEquiposConAnimacion(equipos) {
    const contenedor = document.getElementById('resultadosEquipos');
    contenedor.innerHTML = '<div class="loading">Generando equipos</div>';
    
    // Limpiar timeout anterior
    if (animacionTimeout) {
        clearTimeout(animacionTimeout);
    }
    
    // Mostrar equipos secuencialmente
    for (let i = 0; i < equipos.length; i++) {
        await new Promise(resolve => {
            setTimeout(() => {
                const equipo = equipos[i];
                const equipoHTML = crearTarjetaEquipo(equipo);
                if (i === 0) {
                    contenedor.innerHTML = '';
                }
                contenedor.insertAdjacentHTML('beforeend', equipoHTML);
                
                // Mostrar miembros uno a uno dentro del equipo
                const tarjetas = contenedor.querySelectorAll('.team-card');
                if (tarjetas[i]) {
                    const miembrosLista = tarjetas[i].querySelector('.team-members');
                    const miembros = miembrosLista.querySelectorAll('li');
                    miembros.forEach((miembro, idx) => {
                        miembro.style.opacity = '0';
                        setTimeout(() => {
                            miembro.style.animation = 'fadeInUp 0.4s ease';
                            miembro.style.opacity = '1';
                        }, idx * 100);
                    });
                }
                
                resolve();
            }, i * 500); // 500ms entre equipos
        });
    }
}

// Crear tarjeta de equipo
function crearTarjetaEquipo(equipo) {
    const miembrosHTML = equipo.miembros.map(miembro => 
        `<li>👤 ${escapeHTML(miembro)}</li>`
    ).join('');
    
    return `
        <div class="team-card">
            <div class="team-title">${escapeHTML(equipo.titulo)}</div>
            <ul class="team-members">
                ${miembrosHTML}
            </ul>
            <div style="margin-top: 10px; font-size: 12px; text-align: center; opacity: 0.8;">
                📊 ${equipo.miembros.length} participantes
            </div>
        </div>
    `;
}

// Escapar HTML para evitar inyección
function escapeHTML(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===========================================
// FUNCIONALIDADES ADICIONALES (F4)
// ===========================================

// Descargar como JPG
async function descargarComoJPG() {
    // Mostrar mensaje de carga
    mostrarMensajeTemporal('📸 Generando imagen, por favor espera...', 'alert-info');
    
    // Crear un contenedor temporal para la captura
    const contenedorOriginal = document.getElementById('resultadosEquipos');
    const equiposHTML = contenedorOriginal.innerHTML;
    
    // Crear un elemento contenedor para la captura
    const capturaDiv = document.createElement('div');
    capturaDiv.style.position = 'absolute';
    capturaDiv.style.top = '-9999px';
    capturaDiv.style.left = '-9999px';
    capturaDiv.style.backgroundColor = '#f8f9fa';
    capturaDiv.style.padding = '30px';
    capturaDiv.style.borderRadius = '20px';
    capturaDiv.style.width = '800px';
    capturaDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    // Título para la imagen
    const titulo = document.createElement('h1');
    titulo.textContent = '🏆 Sorteo de Equipos';
    titulo.style.textAlign = 'center';
    titulo.style.color = '#333';
    titulo.style.marginBottom = '10px';
    titulo.style.fontSize = '24px';
    
    const fecha = document.createElement('p');
    fecha.textContent = `Generado el: ${new Date().toLocaleString()}`;
    fecha.style.textAlign = 'center';
    fecha.style.color = '#666';
    fecha.style.marginBottom = '30px';
    fecha.style.fontSize = '12px';
    
    capturaDiv.appendChild(titulo);
    capturaDiv.appendChild(fecha);
    
    // Crear grid para equipos
    const gridDiv = document.createElement('div');
    gridDiv.style.display = 'grid';
    gridDiv.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    gridDiv.style.gap = '20px';
    
    // Recorrer equipos y crear tarjetas para captura
    equiposGenerados.forEach(equipo => {
        const tarjeta = document.createElement('div');
        tarjeta.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tarjeta.style.borderRadius = '15px';
        tarjeta.style.padding = '20px';
        tarjeta.style.color = 'white';
        tarjeta.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        
        const tituloEquipo = document.createElement('div');
        tituloEquipo.textContent = equipo.titulo;
        tituloEquipo.style.fontSize = '20px';
        tituloEquipo.style.fontWeight = 'bold';
        tituloEquipo.style.textAlign = 'center';
        tituloEquipo.style.marginBottom = '15px';
        tituloEquipo.style.paddingBottom = '10px';
        tituloEquipo.style.borderBottom = '2px solid rgba(255, 255, 255, 0.3)';
        
        const lista = document.createElement('ul');
        lista.style.listStyle = 'none';
        lista.style.padding = '0';
        lista.style.margin = '0';
        
        equipo.miembros.forEach(miembro => {
            const item = document.createElement('li');
            item.textContent = `👤 ${miembro}`;
            item.style.padding = '8px 12px';
            item.style.margin = '5px 0';
            item.style.background = 'rgba(255, 255, 255, 0.2)';
            item.style.borderRadius = '8px';
            item.style.fontSize = '14px';
            lista.appendChild(item);
        });
        
        const contador = document.createElement('div');
        contador.textContent = `📊 ${equipo.miembros.length} participantes`;
        contador.style.marginTop = '10px';
        contador.style.fontSize = '12px';
        contador.style.textAlign = 'center';
        contador.style.opacity = '0.8';
        
        tarjeta.appendChild(tituloEquipo);
        tarjeta.appendChild(lista);
        tarjeta.appendChild(contador);
        gridDiv.appendChild(tarjeta);
    });
    
    capturaDiv.appendChild(gridDiv);
    
    // Agregar pie de página
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.marginTop = '30px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '1px solid #ddd';
    footer.style.fontSize = '11px';
    footer.style.color = '#999';
    footer.textContent = 'Generado con Aula Virtual - Sorteo de Equipos';
    capturaDiv.appendChild(footer);
    
    document.body.appendChild(capturaDiv);
    
    try {
        // Esperar un momento para que se renderice
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(capturaDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false
        });
        
        const link = document.createElement('a');
        const fechaArchivo = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `sorteo-equipos-${fechaArchivo}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        
        mostrarMensajeTemporal('✅ Imagen descargada exitosamente', 'alert-success');
    } catch (error) {
        console.error('Error al generar imagen:', error);
        mostrarError('Error al generar la imagen. Por favor intenta nuevamente.');
    } finally {
        // Limpiar el elemento temporal
        document.body.removeChild(capturaDiv);
    }
}   

// Copiar al portapapeles
function copiarPortapapeles() {
    let texto = '';
    equiposGenerados.forEach(equipo => {
        texto += `${equipo.titulo}:\n`;
        equipo.miembros.forEach(miembro => {
            texto += `  - ${miembro}\n`;
        });
        texto += '\n';
    });
    
    navigator.clipboard.writeText(texto).then(() => {
        mostrarMensajeTemporal('✅ Equipos copiados al portapapeles', 'alert-success');
    }).catch(() => {
        mostrarError('No se pudo copiar al portapapeles');
    });
}

// Copiar equipos en columnas
function copiarEquiposColumnas() {
    const maxMiembros = Math.max(...equiposGenerados.map(e => e.miembros.length));
    let textoColumnas = '';
    
    // Encabezados
    const encabezados = equiposGenerados.map(e => e.titulo).join('\t');
    textoColumnas += encabezados + '\n';
    
    // Filas
    for (let i = 0; i < maxMiembros; i++) {
        const fila = equiposGenerados.map(equipo => {
            return equipo.miembros[i] || '';
        }).join('\t');
        textoColumnas += fila + '\n';
    }
    
    navigator.clipboard.writeText(textoColumnas).then(() => {
        mostrarMensajeTemporal('✅ Equipos copiados en formato de columnas', 'alert-success');
    }).catch(() => {
        mostrarError('No se pudo copiar al portapapeles');
    });
}

// ===========================================
// UTILIDADES Y MENSAJES
// ===========================================

function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-info';
    errorDiv.style.background = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.border = '1px solid #f5c6cb';
    errorDiv.style.marginBottom = '15px';
    errorDiv.innerHTML = `❌ ${mensaje}`;
    
    const container = document.querySelector('.container');
    const existingError = container.querySelector('.alert-danger');
    if (existingError) existingError.remove();
    
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 4000);
}

function mostrarMensajeTemporal(mensaje, clase) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `alert ${clase}`;
    msgDiv.innerHTML = mensaje;
    
    const container = document.querySelector('.container');
    container.insertBefore(msgDiv, container.firstChild);
    
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// Cambiar texto del label según tipo de sorteo
function actualizarLabelCantidad() {
    const tipoSorteo = document.getElementById('tipoSorteo').value;
    const labelCantidad = document.getElementById('labelCantidad');
    const inputCantidad = document.getElementById('cantidadValor');
    
    if (tipoSorteo === 'equipos') {
        labelCantidad.textContent = 'Número de equipos:';
        inputCantidad.max = 50;
        inputCantidad.value = Math.min(inputCantidad.value, 50);
    } else {
        labelCantidad.textContent = '👥 Participantes por equipo:';
        inputCantidad.max = 100;
    }
}

// Cambiar entre pantallas
function mostrarPantallaConfiguracion() {
    document.getElementById('pantallaConfiguracion').style.display = 'block';
    document.getElementById('pantallaResultados').style.display = 'none';
    equiposGenerados = [];
}

function mostrarPantallaResultados() {
    document.getElementById('pantallaConfiguracion').style.display = 'none';
    document.getElementById('pantallaResultados').style.display = 'block';
}

// Evento principal de generación
async function onGenerarEquipos() {
    const equipos = generarEquipos();
    
    if (equipos && equipos.length > 0) {
        equiposGenerados = equipos;
        mostrarPantallaResultados();
        await mostrarEquiposConAnimacion(equipos);
    }
}

// ===========================================
// INICIALIZACIÓN Y EVENTOS
// ===========================================

function init() {
    // Cargar datos guardados
    cargarDatosIniciales();
    
    // Eventos
    document.getElementById('btnGenerar').addEventListener('click', onGenerarEquipos);
    document.getElementById('btnVolverConfiguracion').addEventListener('click', mostrarPantallaConfiguracion);
    document.getElementById('btnDescargarJPG').addEventListener('click', descargarComoJPG);
    document.getElementById('btnCopiarPortapapeles').addEventListener('click', copiarPortapapeles);
    document.getElementById('btnCopiarColumnas').addEventListener('click', copiarEquiposColumnas);
    document.getElementById('tipoSorteo').addEventListener('change', actualizarLabelCantidad);
    document.getElementById('listaParticipantes').addEventListener('input', function() {
        guardarParticipantes();
    });
    
    // Actualizar label inicial
    actualizarLabelCantidad();
    
    console.log('✅ Sorteo de equipos inicializado correctamente');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}