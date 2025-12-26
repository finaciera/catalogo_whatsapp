<!-- src/lib/components/dashboard/ProductForm.svelte -->
<!--revisar -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let producto = null;
  export let onSuccess = null;

  let categorias = [];
  let loading = false;
  let error = '';
  let success = '';

  // Form data con valores por defecto
  let formData = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    imagen_url: '',
    destacado: false,
    activo: true,
    slug: '',
    descuento: '',
    sku: ''
  };

  // Validaciones en tiempo real
  let validationErrors = {
    nombre: '',
    precio: '',
    categoria_id: ''
  };

  onMount(async () => {
    await loadCategorias();
    
    if (producto) {
      formData = {
        ...producto,
        categoria_id: producto.categoria_id?.toString() || '',
        precio: producto.precio?.toString() || '',
        stock: producto.stock?.toString() || '',
        descuento: producto.descuento?.toString() || '',
        destacado: Boolean(producto.destacado),
        activo: producto.activo !== false
      };
    }
  });

  async function loadCategorias() {
    try {
      const res = await fetch('api/categorias');
      if (res.ok) {
        categorias = await res.json();
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  }

  function validateField(field) {
    validationErrors[field] = '';
    
    if (field === 'nombre' && !formData.nombre.trim()) {
      validationErrors.nombre = 'El nombre es obligatorio';
      return false;
    }
    
    if (field === 'precio') {
      const precio = parseFloat(formData.precio);
      if (isNaN(precio) || precio < 0) {
        validationErrors.precio = 'El precio debe ser un número válido';
        return false;
      }
    }
    
    if (field === 'categoria_id' && !formData.categoria_id) {
      validationErrors.categoria_id = 'Debe seleccionar una categoría';
      return false;
    }
    
    return true;
  }

  function validateForm() {
    let isValid = true;
    
    isValid = validateField('nombre') && isValid;
    isValid = validateField('precio') && isValid;
    isValid = validateField('categoria_id') && isValid;
    
    return isValid;
  }

  async function handleSubmit() {
    error = '';
    success = '';
    
    if (!validateForm()) {
      error = 'Por favor corrige los errores en el formulario';
      return;
    }
    
    loading = true;

    try {
      // Preparar datos para enviar
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        precio: formData.precio,
        stock: formData.stock || null,
        categoria_id: parseInt(formData.categoria_id),
        imagen_url: formData.imagen_url?.trim() || null,
        destacado: formData.destacado,
        activo: formData.activo,
        slug: formData.slug?.trim() || null,
        descuento: formData.descuento || null,
        sku: formData.sku?.trim() || null
      };

      console.log('📤 Enviando datos:', dataToSend);

      const url = producto ? 'api/productos' : 'api/productos';
      const method = producto ? 'PUT' : 'POST';

      if (producto) {
        dataToSend.id = producto.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const responseData = await res.json();
      console.log('📥 Respuesta:', responseData);

      if (!res.ok) {
        throw new Error(responseData.error || 'Error al guardar el producto');
      }

      success = producto 
        ? '✅ Producto actualizado correctamente'
        : '✅ Producto creado correctamente';

      // Limpiar formulario si es nuevo producto
      if (!producto) {
        formData = {
          nombre: '',
          descripcion: '',
          precio: '',
          stock: '',
          categoria_id: '',
          imagen_url: '',
          destacado: false,
          activo: true,
          slug: '',
          descuento: '',
          sku: ''
        };
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(responseData), 1000);
      } else {
        setTimeout(() => goto('/dashboard/productos'), 1500);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Mensajes de error/éxito -->
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
      <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span>{error}</span>
    </div>

  <!-- Botones de acción -->
  <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
    <button
      type="submit"
      disabled={loading}
      class="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg
             hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
             disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors
             flex items-center justify-center"
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Guardando...
      {:else}
        {producto ? 'Actualizar Producto' : 'Crear Producto'}
      {/if}
    </button>

    <button
      type="button"
      on:click={() => goto('/dashboard/productos')}
      disabled={loading}
      class="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300
             hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Cancelar
    </button>
  </div>
</form>
  {/if}

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
      <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>{success}</span>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Nombre -->
    <div class="md:col-span-2">
      <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
        Nombre del Producto <span class="text-red-500">*</span>
      </label>
      <input
        id="nombre"
        type="text"
        bind:value={formData.nombre}
        on:blur={() => validateField('nombre')}
        disabled={loading}
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               {validationErrors.nombre ? 'border-red-500' : 'border-gray-300'}
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Ej: Producto ejemplo"
      />
      {#if validationErrors.nombre}
        <p class="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
      {/if}
    </div>

    <!-- Categoría -->
    <div>
      <label for="categoria" class="block text-sm font-medium text-gray-700 mb-2">
        Categoría <span class="text-red-500">*</span>
      </label>
      <select
        id="categoria"
        bind:value={formData.categoria_id}
        on:blur={() => validateField('categoria_id')}
        disabled={loading}
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               {validationErrors.categoria_id ? 'border-red-500' : 'border-gray-300'}
               disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Seleccionar categoría</option>
        {#each categorias as cat}
          <option value={cat.id}>{cat.nombre}</option>
        {/each}
      </select>
      {#if validationErrors.categoria_id}
        <p class="mt-1 text-sm text-red-600">{validationErrors.categoria_id}</p>
      {/if}
    </div>

    <!-- Precio -->
    <div>
      <label for="precio" class="block text-sm font-medium text-gray-700 mb-2">
        Precio <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <span class="absolute left-3 top-2 text-gray-500">$</span>
        <input
          id="precio"
          type="number"
          step="0.01"
          min="0"
          bind:value={formData.precio}
          on:blur={() => validateField('precio')}
          disabled={loading}
          class="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 {validationErrors.precio ? 'border-red-500' : 'border-gray-300'}
                 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="0.00"
        />
      </div>
      {#if validationErrors.precio}
        <p class="mt-1 text-sm text-red-600">{validationErrors.precio}</p>
      {/if}
    </div>

    <!-- Stock -->
    <div>
      <label for="stock" class="block text-sm font-medium text-gray-700 mb-2">
        Stock
      </label>
      <input
        id="stock"
        type="number"
        min="0"
        bind:value={formData.stock}
        disabled={loading}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Dejar vacío si no aplica"
      />
    </div>

    <!-- SKU -->
    <div>
      <label for="sku" class="block text-sm font-medium text-gray-700 mb-2">
        SKU / Código
      </label>
      <input
        id="sku"
        type="text"
        bind:value={formData.sku}
        disabled={loading}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Ej: PROD-001"
      />
    </div>

    <!-- Descuento -->
    <div>
      <label for="descuento" class="block text-sm font-medium text-gray-700 mb-2">
        Descuento (%)
      </label>
      <input
        id="descuento"
        type="number"
        step="0.01"
        min="0"
        max="100"
        bind:value={formData.descuento}
        disabled={loading}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="0"
      />
    </div>

    <!-- Slug -->
    <div>
      <label for="slug" class="block text-sm font-medium text-gray-700 mb-2">
        Slug (URL)
      </label>
      <input
        id="slug"
        type="text"
        bind:value={formData.slug}
        disabled={loading}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Se genera automáticamente"
      />
      <p class="mt-1 text-xs text-gray-500">Dejar vacío para generar automáticamente</p>
    </div>

    <!-- Imagen URL -->
    <div class="md:col-span-2">
      <label for="imagen" class="block text-sm font-medium text-gray-700 mb-2">
        URL de Imagen
      </label>
      <input
        id="imagen"
        type="url"
        bind:value={formData.imagen_url}
        disabled={loading}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="https://ejemplo.com/imagen.jpg"
      />
      {#if formData.imagen_url}
        <div class="mt-3">
          <img 
            src={formData.imagen_url} 
            alt="Preview" 
            class="h-32 w-32 object-cover rounded-lg border border-gray-200"
            on:error={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'}
          />
        </div>
      {/if}
    </div>

    <!-- Descripción -->
    <div class="md:col-span-2">
      <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-2">
        Descripción
      </label>
      <textarea
        id="descripcion"
        bind:value={formData.descripcion}
        disabled={loading}
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        placeholder="Descripción detallada del producto..."
      />
    </div>

    <!-- Checkboxes -->
    <div class="md:col-span-2 flex flex-wrap gap-6">
      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={formData.destacado}
          disabled={loading}
          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:cursor-not-allowed"
        />
        <span class="ml-2 text-sm text-gray-700">Producto destacado</span>
      </label>

      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={formData.activo}
          disabled={loading}
          class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:cursor-not-allowed"
        />
        <span class="ml-2 text-sm text-gray-700">Producto activo</span>
      </label>
    </div>
  </div>