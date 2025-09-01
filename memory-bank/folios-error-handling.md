# Manejo de Errores de Folios Agotados

## Problema Identificado

Cuando la empresa no tiene folios disponibles para generar documentos (boletas/facturas), la API devuelve un error específico:

```json
{
  "success": false,
  "code": "000",
  "details": "Error al generar documento. No hay suficientes folios disponibles para agregar los solicitados. Quedan 0 y se solicitaron 1"
}
```

## Solución Implementada

### 1. Detección Específica del Error

Se implementó detección específica para el error de folios agotados en `components/sections/digipos-page-section.tsx`:

```typescript
if (responseData.code === '000' && responseData.details?.includes('folios')) {
  // Mostrar mensaje específico para folios agotados
  toast({
    title: "⚠️ Folios Agotados",
    description: "No hay suficientes folios disponibles para generar documentos. Contacte al administrador del sistema.",
    variant: "destructive",
    duration: 8000, // 8 segundos para que el usuario pueda leer
  });
  throw new Error('Error: No hay folios disponibles para generar documentos. Contacte al administrador del sistema.');
}
```

### 2. Mensajes de Toast Informativos

Se implementaron tres tipos de mensajes de toast:

#### **Folios Agotados**
- **Título**: "⚠️ Folios Agotados"
- **Descripción**: "No hay suficientes folios disponibles para generar documentos. Contacte al administrador del sistema."
- **Duración**: 8 segundos
- **Variante**: Destructive (rojo)

#### **Otros Errores de API**
- **Título**: "❌ Error de la API"
- **Descripción**: Detalles específicos del error
- **Duración**: 5 segundos
- **Variante**: Destructive

#### **Errores Genéricos**
- **Título**: "❌ Error"
- **Descripción**: "Respuesta inválida de la API"
- **Duración**: 5 segundos
- **Variante**: Destructive

### 3. Manejo en Catch

Se agregó manejo adicional en el bloque catch para asegurar que siempre se muestre un mensaje al usuario:

```typescript
} catch (error) {
  // Si no se mostró un toast específico, mostrar uno genérico
  if (!error.message.includes('folios disponibles')) {
    toast({
      title: "❌ Error al Generar Documento",
      description: error.message || "Error desconocido al generar el documento",
      variant: "destructive",
      duration: 5000,
    });
  }
}
```

## Dependencias Agregadas

### Importación del Hook useToast
```typescript
import { useToast } from "@/hooks/use-toast";
```

### Inicialización en el Componente
```typescript
export function DigiPosPageSection() {
  const { toast } = useToast();
  // ... resto del componente
}
```

## Beneficios de la Implementación

1. **Experiencia de Usuario Mejorada**: El usuario recibe mensajes claros y específicos sobre el problema
2. **Diferencia de Errores**: Se distinguen entre folios agotados y otros tipos de errores
3. **Duración Apropiada**: 8 segundos para folios agotados (más tiempo para leer), 5 segundos para otros errores
4. **Fallback Seguro**: Siempre se muestra un mensaje, incluso si falla la detección específica
5. **Desarrollo Continuo**: El sistema sigue funcionando en modo de prueba cuando hay errores

## Flujo de Usuario

1. **Usuario intenta generar documento**
2. **API responde con error de folios agotados**
3. **Sistema detecta el error específico**
4. **Se muestra toast informativo por 8 segundos**
5. **Se continúa con datos de prueba para desarrollo**
6. **Usuario puede ver el mensaje y contactar al administrador**

## Notas Técnicas

- Los mensajes de toast usan el sistema de notificaciones de shadcn/ui
- La detección se basa en el código de error "000" y la presencia de la palabra "folios" en los detalles
- El sistema mantiene compatibilidad con el modo de desarrollo usando datos de prueba
- Los logs de consola se mantienen para debugging técnico
