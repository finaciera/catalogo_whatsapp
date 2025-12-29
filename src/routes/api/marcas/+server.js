// src/routes/api/marcas/+server.js
// ✅ API REST completa para Marcas
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

function generateSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = supabase
      .from('marcas')
      .select('id')
      .eq('nombre', slug);
    
    if (excludeId) {
      query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking slug:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ========================================
// GET - Listar marcas
// ========================================
export async function GET({ url }) {
  try {
    const activas = url.searchParams.get('activas');
    
    let query = supabase
      .from('marcas')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (activas === 'true') {
      query = query.eq('activo', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error GET marcas:', error);
    return json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// POST - Crear marca
// ========================================
export async function POST({ request }) {
  try {
    const body = await request.json();
    
    // Validaciones
    if (!body.nombre?.trim()) {
      return json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }
    
    const marcaData = {
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() || null,
      logo_url: body.logo_url?.trim() || null,
      activo: body.activo !== false
    };
    
    const { data, error } = await supabase
      .from('marcas')
      .insert([marcaData])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return json(
          { success: false, error: 'Ya existe una marca con ese nombre' },
          { status: 409 }
        );
      }
      throw error;
    }
    
    return json({
      success: true,
      data,
      message: 'Marca creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error POST marca:', error);
    return json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// PUT - Actualizar marca
// ========================================
export async function PUT({ request }) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return json(
        { success: false, error: 'ID de marca requerido' },
        { status: 400 }
      );
    }
    
    const updateData = {};
    const camposPermitidos = ['nombre', 'descripcion', 'logo_url', 'activo'];
    
    camposPermitidos.forEach(campo => {
      if (body[campo] !== undefined) {
        updateData[campo] = body[campo];
      }
    });
    
    // Si se actualiza el nombre, trim
    if (updateData.nombre) {
      updateData.nombre = updateData.nombre.trim();
    }
    
    const { data, error } = await supabase
      .from('marcas')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return json({
      success: true,
      data,
      message: 'Marca actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error PUT marca:', error);
    return json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE - Eliminar marca
// ========================================
export async function DELETE({ url }) {
  try {
    const id = url.searchParams.get('id');
    
    if (!id) {
      return json(
        { success: false, error: 'ID de marca requerido' },
        { status: 400 }
      );
    }
    
    // Verificar si hay productos usando esta marca
    const { data: productosConMarca, error: errorCheck } = await supabase
      .from('productos')
      .select('id')
      .eq('marca_id', id)
      .limit(1);
    
    if (errorCheck) throw errorCheck;
    
    if (productosConMarca && productosConMarca.length > 0) {
      return json(
        { 
          success: false, 
          error: 'No se puede eliminar. Hay productos usando esta marca. Primero elimina o reasigna los productos.' 
        },
        { status: 409 }
      );
    }
    
    // Eliminar marca
    const { error } = await supabase
      .from('marcas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return json({
      success: true,
      message: 'Marca eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error DELETE marca:', error);
    return json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}