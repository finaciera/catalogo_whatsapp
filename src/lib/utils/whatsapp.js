/**
 * Utilidades para generar enlaces de WhatsApp
 */

/**
 * Genera un enlace de WhatsApp para un pedido completo
 * @param {Object} pedido - Objeto del pedido
 * @param {Array} productos - Lista de productos en el carrito
 * @param {Object} config - Configuración de la empresa
 * @returns {string} URL de WhatsApp
 */
export function generarEnlacePedido(pedido, productos, config) {
  if (!productos || productos.length === 0) {
    throw new Error('No hay productos en el pedido');
  }
  
  const { nombre_empresa = 'CatálogoExpress', whatsapp_numero, moneda_simbolo = 'S/', impuesto_porcentaje = 18 } = config;
  
  // Calcular totales
  const subtotal = productos.reduce((total, item) => 
    total + (item.precio_unitario * item.cantidad), 0
  );
  const impuesto = subtotal * (impuesto_porcentaje / 100);
  const total = subtotal + impuesto;
  
  // Construir mensaje
  let mensaje = `*${nombre_empresa} - Nuevo Pedido*%0A%0A`;
  
  // Información del cliente si está disponible
  if (pedido.cliente_nombre || pedido.cliente_whatsapp) {
    mensaje += '*Información del Cliente:*%0A';
    if (pedido.cliente_nombre) mensaje += `Nombre: ${pedido.cliente_nombre}%0A`;
    if (pedido.cliente_whatsapp) mensaje += `WhatsApp: ${pedido.cliente_whatsapp}%0A`;
    mensaje += '%0A';
  }
  
  // Detalles del pedido
  mensaje += '*Detalles del Pedido:*%0A%0A';
  
  productos.forEach((item, index) => {
    const itemTotal = item.precio_unitario * item.cantidad;
    mensaje += `*${index + 1}. ${item.nombre}*%0A`;
    mensaje += `   Cantidad: ${item.cantidad}%0A`;
    mensaje += `   Precio unitario: ${moneda_simbolo}${item.precio_unitario.toFixed(2)}%0A`;
    mensaje += `   Subtotal: ${moneda_simbolo}${itemTotal.toFixed(2)}%0A`;
    
    // Información adicional del producto si está disponible
    if (item.id) mensaje += `   Código: ${item.id}%0A`;
    if (item.marca) mensaje += `   Marca: ${item.marca}%0A`;
    
    mensaje += '%0A';
  });
  
  // Resumen de totales
  mensaje += '*Resumen de Totales:*%0A';
  mensaje += `Subtotal: ${moneda_simbolo}${subtotal.toFixed(2)}%0A`;
  mensaje += `Impuestos (${impuesto_porcentaje}%): ${moneda_simbolo}${impuesto.toFixed(2)}%0A`;
  mensaje += `*TOTAL: ${moneda_simbolo}${total.toFixed(2)}*%0A%0A`;
  
  // Mensaje final
  mensaje += '¡Hola! Me gustaría realizar este pedido. Por favor, confírmenme disponibilidad y forma de pago.';
  
  // Codificar y generar URL
  const encodedMessage = encodeURIComponent(mensaje);
  return `https://wa.me/${whatsapp_numero}?text=${encodedMessage}`;
}

/**
 * Genera un enlace de WhatsApp para preguntar por un producto específico
 * @param {Object} producto - Objeto del producto
 * @param {Object} config - Configuración de la empresa
 * @returns {string} URL de WhatsApp
 */
export function generarEnlacePregunta(producto, config) {
  const { nombre_empresa = 'CatálogoExpress', whatsapp_numero, moneda_simbolo = 'S/' } = config;
  
  let mensaje = `*${nombre_empresa} - Consulta por Producto*%0A%0A`;
  mensaje += `¡Hola! Me interesa el siguiente producto:%0A%0A`;
  mensaje += `*${producto.nombre}*%0A`;
  mensaje += `Precio: ${moneda_simbolo}${producto.precio.toFixed(2)}%0A`;
  
  if (producto.id) mensaje += `Código: ${producto.id}%0A`;
  if (producto.marca) mensaje += `Marca: ${producto.marca}%0A`;
  if (producto.descripcion_larga) {
    mensaje += `Descripción: ${producto.descripcion_larga.substring(0, 100)}...%0A`;
  }
  
  mensaje += '%0A';
  mensaje += 'Por favor, envíenme más información sobre:';
  mensaje += '%0A- Disponibilidad';
  mensaje += '%0A- Tiempo de entrega';
  mensaje += '%0A- Descuentos por cantidad';
  mensaje += '%0A- Otras características';
  
  const encodedMessage = encodeURIComponent(mensaje);
  return `https://wa.me/${whatsapp_numero}?text=${encodedMessage}`;
}

/**
 * Genera un enlace de WhatsApp para consultas generales
 * @param {Object} config - Configuración de la empresa
 * @returns {string} URL de WhatsApp
 */
export function generarEnlaceConsultaGeneral(config) {
  const { nombre_empresa = 'CatálogoExpress', whatsapp_numero } = config;
  
  const mensaje = `¡Hola ${nombre_empresa}! Tengo una consulta general.`;
  const encodedMessage = encodeURIComponent(mensaje);
  
  return `https://wa.me/${whatsapp_numero}?text=${encodedMessage}`;
}

/**
 * Formatea un número de teléfono para WhatsApp
 * @param {string} numero - Número de teléfono
 * @returns {string} Número formateado
 */
export function formatearNumeroWhatsApp(numero) {
  // Eliminar espacios, guiones, paréntesis
  let numeroLimpio = numero.replace(/[\s\-()]/g, '');
  
  // Si empieza con 0, reemplazar con código de país (Perú: 51)
  if (numeroLimpio.startsWith('0')) {
    numeroLimpio = '51' + numeroLimpio.substring(1);
  }
  
  // Si empieza con +, eliminar el +
  if (numeroLimpio.startsWith('+')) {
    numeroLimpio = numeroLimpio.substring(1);
  }
  
  return numeroLimpio;
}

/**
 * Valida si un número es válido para WhatsApp
 * @param {string} numero - Número a validar
 * @returns {boolean} true si es válido
 */
export function validarNumeroWhatsApp(numero) {
  const numeroLimpio = formatearNumeroWhatsApp(numero);
  // Mínimo 10 dígitos, máximo 15
  return /^\d{10,15}$/.test(numeroLimpio);
}