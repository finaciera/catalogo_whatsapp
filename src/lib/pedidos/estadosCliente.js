// src/lib/pedidos/estados.js
// ✅ ÚNICO ARCHIVO DE ESTADOS - Compartido entre cliente y servidor

// ========================================
// ESTADOS DEL PEDIDO
// ========================================
export const ESTADOS = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  PAGADO: 'pagado',
  PREPARANDO: 'preparando',
  ENVIADO: 'enviado',
  RECIBIDO: 'recibido',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
};

// ========================================
// ESTADOS DE PAGO
// ========================================
export const ESTADOS_PAGO = {
  SIN_PAGO: 'sin_pago',
  PENDIENTE_VALIDACION: 'pendiente_validacion',
  PAGADO: 'pagado',
  RECHAZADO: 'rechazado'
};

// ========================================
// CONFIGURACIÓN UI (solo cliente)
// ========================================
export const CONFIG_ESTADOS = {
  [ESTADOS.PENDIENTE]: {
    label: 'Pendiente',
    descripcion: 'Pedido recibido, esperando confirmación',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: '⏳'
  },
  [ESTADOS.CONFIRMADO]: {
    label: 'Confirmado',
    descripcion: 'Stock validado, esperando pago',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: '✓'
  },
  // ... resto de configuraciones
};

// ========================================
// TRANSICIONES PERMITIDAS (solo servidor)
// ========================================
export const TRANSICIONES_PERMITIDAS = {
  [ESTADOS.PENDIENTE]: [ESTADOS.CONFIRMADO, ESTADOS.CANCELADO],
  [ESTADOS.CONFIRMADO]: [ESTADOS.PAGADO, ESTADOS.CANCELADO, ESTADOS.PENDIENTE],
  [ESTADOS.PAGADO]: [ESTADOS.PREPARANDO, ESTADOS.ENVIADO, ESTADOS.CANCELADO],
  [ESTADOS.PREPARANDO]: [ESTADOS.ENVIADO, ESTADOS.CANCELADO],
  [ESTADOS.ENVIADO]: [ESTADOS.RECIBIDO, ESTADOS.ENTREGADO],
  [ESTADOS.RECIBIDO]: [ESTADOS.ENTREGADO],
  [ESTADOS.ENTREGADO]: [],
  [ESTADOS.CANCELADO]: []
};

// ========================================
// VALIDACIONES (solo servidor)
// ========================================
export function validarTransicion(estadoActual, estadoNuevo) {
  const permitidas = TRANSICIONES_PERMITIDAS[estadoActual] || [];
  
  if (!permitidas.includes(estadoNuevo)) {
    return {
      valido: false,
      mensaje: `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`
    };
  }
  
  return { valido: true };
}

export function esEditable(pedido) {
  // Un pedido es editable si:
  // 1. La bandera editable es true
  // 2. El pago NO está validado
  // 3. El estado permite edición
  
  if (pedido.editable === false) return false;
  if (pedido.estado_pago === ESTADOS_PAGO.PAGADO) return false;
  
  const estadosEditables = [ESTADOS.PENDIENTE, ESTADOS.CONFIRMADO];
  return estadosEditables.includes(pedido.estado);
}

// ========================================
// HELPERS UI (cliente y servidor)
// ========================================
export function obtenerColorEstado(estado) {
  const config = CONFIG_ESTADOS[estado];
  return {
    bg: config?.bgColor || 'bg-gray-100',
    text: config?.textColor || 'text-gray-800',
    border: config?.borderColor || 'border-gray-200'
  };
}
