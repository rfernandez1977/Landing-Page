# Configuración de Imágenes por Empresa + Integración Pexels

## Resumen
- Se implementó una sección para configurar imágenes por empresa (Company ID), con búsqueda por actividades, selección de imágenes y guardado centralizado.
- Integración con Pexels API (si hay API key); fallback a imágenes placeholder cuando no hay API key o la búsqueda falla.
- Cache inteligente por empresa (TTL 24h) y cache de búsquedas por término.
- Indicador visual minimalista (punto en esquina superior) para imágenes placeholder.
- Auto-retracción de la sección al guardar y refresco de productos en DigiPos.

## Archivos clave
- `components/sections/image-config-section.tsx`
  - UI principal de Configuración de Imágenes
  - Búsqueda de actividades, sugerencias, resultados y seleccionadas
  - Panel de estadísticas de cache y botón "Ocultar/Mostrar Configuración"
  - Auto-retracción tras guardar + dispatch de evento `imagesConfigUpdated`
- `components/sections/digipos-page-section.tsx`
  - Integra imágenes dinámicas por empresa usando `ImageCacheService`
  - Listener de `imagesConfigUpdated` que fuerza `loadProductsFromAPI()`
- `app/api/pexels/route.ts`
  - GET: consulta Pexels si hay API key; si no, usa placeholders con variación en URL
  - POST: stub para futuro guardado en servidor
- `lib/image-cache-service.ts`
  - Cache por empresa (TTL 24h), cache de búsquedas, limpieza y utilidades de consulta
- `lib/pexels-config.ts`
  - Config de Pexels + helpers de headers y validación de API key
- `components/ui/placeholder-image-indicator.tsx`
  - Componente indicador (punto naranja) para imágenes placeholder
- `components/sections/image-usage-indicator.tsx`
  - Métricas: productos, imágenes en uso, cache hit rate, desglose por actividad
- `components/sections/visual-theme-selector.tsx`
  - Temas visuales (6 predefinidos) con persistencia por empresa

## Flujo funcional
1. Usuario ingresa actividades (máx. 3). Se consulta `/api/pexels?query=...&companyId=...`.
   - Si hay `PEXELS_API_KEY`, se obtienen imágenes reales de Pexels.
   - Si no, placeholders con URLs únicas (`&v=timestamp&q=...&i=...&c=...`).
2. Usuario selecciona imágenes y guarda:
   - Se guarda en cache por empresa (`ImageCacheService.saveCompanyConfig`).
   - Se hace POST a `/api/pexels` (stub actual).
   - Se dispara `window.dispatchEvent(new CustomEvent('imagesConfigUpdated', { detail: { companyId, config } }))`.
   - La sección se auto-retrae (colapsa) tras guardar.
3. DigiPos escucha `imagesConfigUpdated` y ejecuta `loadProductsFromAPI()` para recargar productos y reasignar imágenes dinámicas.

## Indicador placeholder
- Implementado en `components/ui/placeholder-image-indicator.tsx`.
- Punto minimalista (naranja) en esquina superior derecha, con pulsación sutil.
- Se muestra cuando `photographer` incluye "Placeholder" (solo en fallback).

## Cache
- `ImageCacheService` mantiene:
  - Config de imágenes por empresa: actividades + lista de imágenes.
  - Cache de resultados de búsqueda por (companyId + query).
  - TTL 24h y limpieza de entradas antiguas.

## Pexels API
- Configuración: `lib/pexels-config.ts`.
- Variable de entorno requerida:
  - `PEXELS_API_KEY=HItuaDlUPyJ82eGmkC8QYHuW7JG92fB1ABuykNMjHAr3rpjS6CyQPxkm`
- Requiere reiniciar el servidor tras cambiar `.env.local`.

## UX/Comportamiento
- Botón "Ocultar/Mostrar Configuración" en el header de la tarjeta.
- Auto-retracción al guardar.
- Indicador visual en placeholders.
- Panel de estadísticas (cache) con limpieza por empresa o global.
- Temas visuales con persistencia por empresa.

## Pruebas sugeridas
1. Sin API key:
   - Buscar actividades, seleccionar imágenes, guardar.
   - Ver indicador placeholder en resultados/seleccionadas.
   - Confirmar auto-colapso y recarga de productos.
2. Con API key:
   - Añadir `PEXELS_API_KEY` y reiniciar.
   - Repetir flujo y confirmar que ahora predominan imágenes reales (sin indicador).
3. Persistencia:
   - Recargar página y validar que actividades, imágenes y tema visual se conservan por empresa.

## Próximos pasos
- Persistencia real en backend para la configuración (reemplazar POST stub).
- Sugerencias de actividades dinámicas (historial/telemetría por empresa).
- Alineación con categorías reales de productos del dominio.
- Mayor variedad de placeholders y control de calidad por actividad.
