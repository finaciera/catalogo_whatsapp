<!-- src/lib/components/ui/LocationPicker.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { MapPin, Navigation, ExternalLink } from 'lucide-svelte';
  
  const dispatch = createEventDispatcher();
  
  export let ubicacion = {
    latitud: null,
    longitud: null,
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    google_maps_url: ''
  };
  export let disabled = false;
  
  function handleChange() {
    dispatch('change', ubicacion);
  }
  
  function generarUrlGoogleMaps() {
    if (ubicacion.latitud && ubicacion.longitud) {
      ubicacion.google_maps_url = `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;
    } else if (ubicacion.direccion) {
      const query = encodeURIComponent(`${ubicacion.direccion}, ${ubicacion.ciudad}, ${ubicacion.estado} ${ubicacion.codigo_postal}`);
      ubicacion.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    handleChange();
  }
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2 mb-4">
    <MapPin class="w-5 h-5 text-primary-600" />
    <h3 class="font-semibold text-gray-800">Ubicación del Negocio</h3>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="md:col-span-2">
      <label class="label">Dirección</label>
      <input
        type="text"
        bind:value={ubicacion.direccion}
        on:input={handleChange}
        placeholder="Calle Principal 123"
        class="input"
        {disabled}
      />
    </div>
    
    <div>
      <label class="label">Ciudad</label>
      <input
        type="text"
        bind:value={ubicacion.ciudad}
        on:input={handleChange}
        placeholder="Ciudad de México"
        class="input"
        {disabled}
      />
    </div>
    
    <div>
      <label class="label">Estado</label>
      <input
        type="text"
        bind:value={ubicacion.estado}
        on:input={handleChange}
        placeholder="CDMX"
        class="input"
        {disabled}
      />
    </div>
    
    <div>
      <label class="label">Código Postal</label>
      <input
        type="text"
        bind:value={ubicacion.codigo_postal}
        on:input={handleChange}
        placeholder="01000"
        class="input"
        {disabled}
      />
    </div>
    
    <div>
      <label class="label">
        Coordenadas GPS (opcional)
        <span class="text-xs text-gray-500 font-normal ml-2">Para mayor precisión</span>
      </label>
      <div class="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.000001"
          bind:value={ubicacion.latitud}
          on:input={handleChange}
          placeholder="Latitud"
          class="input text-sm"
          {disabled}
        />
        <input
          type="number"
          step="0.000001"
          bind:value={ubicacion.longitud}
          on:input={handleChange}
          placeholder="Longitud"
          class="input text-sm"
          {disabled}
        />
      </div>
    </div>
  </div>
  
  <div class="flex gap-3 pt-2">
    <button
      type="button"
      on:click={generarUrlGoogleMaps}
      disabled={disabled || (!ubicacion.direccion && (!ubicacion.latitud || !ubicacion.longitud))}
      class="btn-secondary flex items-center gap-2"
    >
      <Navigation class="w-4 h-4" />
      Generar enlace de Google Maps
    </button>
    
    {#if ubicacion.google_maps_url}
      <a
        href={ubicacion.google_maps_url}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-outline flex items-center gap-2"
      >
        <ExternalLink class="w-4 h-4" />
        Ver en mapa
      </a>
    {/if}
  </div>
  
  {#if ubicacion.google_maps_url}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-800 font-medium mb-2">📍 Vista previa de ubicación</p>
      <a 
        href={ubicacion.google_maps_url}
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-blue-600 hover:text-blue-800 break-all underline"
      >
        {ubicacion.google_maps_url}
      </a>
    </div>
  {/if}
  
  <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
    <p class="font-medium mb-2">💡 Cómo obtener coordenadas GPS:</p>
    <ol class="list-decimal pl-4 space-y-1">
      <li>Abre Google Maps y busca tu negocio</li>
      <li>Haz clic derecho en la ubicación exacta</li>
      <li>Copia las coordenadas que aparecen (Ej: 19.432608, -99.133209)</li>
      <li>Pega la latitud y longitud aquí</li>
    </ol>
  </div>
</div>