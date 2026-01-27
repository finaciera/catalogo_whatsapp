// src/lib/server/whatsapp/mensajes.js
import { supabaseAdmin } from '$lib/supabaseServer';

export async function generarMensajeWhatsApp(pedido, tipo, metadata = null) {
  try {
    // Obtener configuración
    const { data: config } = await supabaseAdmin
      .from('configuracion')
      .select('*')
      .single();
    
    if (!config) throw new Error('Configuración no encontrada');
    
    const cuentasPago = config.cuentas_pago 
      ? (typeof config.cuentas_pago === 'string' ? JSON.parse(config.cuentas_pago) : config.cuentas_pago)
      : [];
    
    let mensaje = '';
    
    switch (tipo) {
      case 'pedido_recibido':
        mensaje = `🛍️ *Pedido Recibido*

Hola ${pedido.cliente_nombre}! 

Recibimos tu pedido #${pedido.numero_pedido}

📦 *Productos:*
${pedido.items.map(i => `• ${i.cantidad}x ${i.producto_nombre} - $${i.subtotal}`).join('\n')}

💰 *Total:* $${pedido.total}

⏳ *Próximo paso:*
Validaremos stock y costos. Te contactaremos pronto.

¿Dudas? Responde este mensaje.`;
        break;
      
      case 'pedido_confirmado':
        const datosBancarios = cuentasPago.length > 0 
          ? cuentasPago.map(c => `
🏦 *${c.banco}*
Titular: ${c.titular}
${c.numero_cuenta ? `Cuenta: ${c.numero_cuenta}` : ''}
${c.clabe ? `CLABE: ${c.clabe}` : ''}`).join('\n')
          : 'Te enviaremos los datos bancarios en breve.';
        
        mensaje = `✅ *Pedido Confirmado*

${pedido.cliente_nombre}, tu pedido #${pedido.numero_pedido} está confirmado!

💵 *Monto a pagar:* $${pedido.total}
${pedido.costo_envio > 0 ? `📦 Incluye envío: $${pedido.costo_envio}` : ''}

${datosBancarios}

📸 *IMPORTANTE:*
Después de realizar el pago, sube tu comprobante en:
${config.dominio || 'https://tudominio.com'}/carrito/mis-pedidos

Ingresa tu WhatsApp: ${pedido.cliente_whatsapp}`;
        break;
      
      case 'pago_validado':
        mensaje = `💚 *Pago Validado*

Excelente ${pedido.cliente_nombre}!

Tu pago del pedido #${pedido.numero_pedido} fue validado.

✅ Estamos preparando tu pedido
📦 Te notificaremos cuando esté listo para envío

Gracias por tu compra!`;
        break;
      
      case 'pago_rechazado':
        mensaje = `⚠️ *Comprobante Requiere Corrección*

${pedido.cliente_nombre}, revisamos tu comprobante del pedido #${pedido.numero_pedido}

❌ *Motivo:* ${metadata?.motivo || 'Imagen no legible'}

Por favor, sube un nuevo comprobante que:
✓ Sea legible y claro
✓ Muestre monto correcto: $${pedido.total}
✓ Incluya fecha y titular

Ingresa aquí:
${config.dominio || 'https://tudominio.com'}/carrito/mis-pedidos`;
        break;
      
      case 'pedido_enviado':
        mensaje = `🚚 *Pedido en Camino*

${pedido.cliente_nombre}, tu pedido #${pedido.numero_pedido} ya está en camino!

${metadata?.guia_envio ? `📦 Guía: ${metadata.guia_envio}` : ''}
${metadata?.transportadora ? `🚛 Paquetería: ${metadata.transportadora}` : ''}

Te llegará pronto. Confirma la recepción cuando lo recibas en:
${config.dominio || 'https://tudominio.com'}/carrito/mis-pedidos`;
        break;
      
      case 'pedido_cancelado':
        mensaje = `❌ *Pedido Cancelado*

${pedido.cliente_nombre}, lamentamos informarte que tu pedido #${pedido.numero_pedido} fue cancelado.

Motivo: ${metadata?.motivo || pedido.motivo_cancelacion || 'Sin especificar'}

Si tienes dudas, contáctanos.`;
        break;
      
      default:
        throw new Error(`Tipo de mensaje no reconocido: ${tipo}`);
    }
    
    const whatsappUrl = `https://wa.me/${pedido.cliente_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    
    return {
      mensaje,
      url: whatsappUrl,
      telefono: pedido.cliente_whatsapp
    };
    
  } catch (error) {
    console.error('Error generando mensaje:', error);
    throw error;
  }
}