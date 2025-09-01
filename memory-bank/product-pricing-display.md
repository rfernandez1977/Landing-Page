# Visualización de Precios con Impuestos en Listas de Productos

## Problema Identificado

Los usuarios necesitaban ver tanto el valor neto como el valor con impuestos incluidos directamente en las listas de productos, para tener una mejor comprensión de los precios finales antes de agregar productos al carrito.

## Solución Implementada

### 1. Función de Cálculo de Precios con Impuestos

Se creó la función `calculatePriceWithTaxes` en `components/sections/digipos-page-section.tsx`:

```typescript
const calculatePriceWithTaxes = (product: Product): { netPrice: number; totalPrice: number; hasOtherTax: boolean } => {
  const netPrice = product.price;
  let totalPrice = netPrice;
  
  // Agregar IVA (19%)
  const ivaAmount = netPrice * 0.19;
  totalPrice += ivaAmount;
  
  // Agregar impuestos adicionales si existen
  const hasOtherTax = !!product.category?.otherTax;
  if (hasOtherTax) {
    const otherTaxAmount = netPrice * (product.category.otherTax!.percent / 100);
    totalPrice += otherTaxAmount;
  }
  
  return {
    netPrice,
    totalPrice: Math.round(totalPrice),
    hasOtherTax
  };
};
```

### 2. Modificación de Tarjetas de Productos

Se modificaron las tarjetas de productos en dos secciones:

#### **Productos Iniciales (filteredProducts)**
- Sección "Todos" - productos cargados inicialmente desde la API

#### **Resultados de Búsqueda (searchProductsResults)**
- Sección "Buscar Productos" - productos encontrados por búsqueda

### 3. Nueva Estructura de Visualización

Cada tarjeta de producto ahora muestra:

```typescript
<div className="flex-1">
  <h3 className="font-medium text-slate-900 dark:text-slate-100">
    {product.name}
  </h3>
  <div className="mt-2 space-y-1">
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Valor Neto: {formatPrice(product.price)}
    </p>
    {(() => {
      const { totalPrice, hasOtherTax } = calculatePriceWithTaxes(product);
      return (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Valor con Impuestos: {formatPrice(totalPrice)}
          {hasOtherTax && (
            <span className="ml-1 text-xs text-orange-500">*</span>
          )}
        </p>
      );
    })()}
  </div>
</div>
```

### 4. Indicadores Visuales

#### **Colores de Precios**
- **Valor Neto**: Gris (`text-slate-500 dark:text-slate-400`) - texto pequeño
- **Valor con Impuestos**: Verde (`text-green-600 dark:text-green-400`) - texto destacado

#### **Asterisco Naranja**
- Productos con impuestos adicionales muestran un asterisco naranja (`*`)
- Indica que el precio incluye impuestos adicionales además del IVA

### 5. Leyendas Informativas

Se agregaron leyendas condicionales que aparecen solo cuando hay productos con impuestos adicionales:

```typescript
{filteredProducts.some(product => product.category?.otherTax) && (
  <div className="inline-flex items-center px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs">
    <span className="mr-1">*</span>
    Incluye impuestos adicionales
  </div>
)}
```

## Beneficios de la Implementación

1. **Transparencia de Precios**: Los usuarios ven claramente el valor neto y el valor final con impuestos
2. **Diferenciación Visual**: Colores distintos para neto vs. total con impuestos
3. **Indicadores Claros**: Asterisco naranja para productos con impuestos adicionales
4. **Leyendas Informativas**: Explicación automática cuando hay productos con impuestos adicionales
5. **Consistencia**: Misma visualización en productos iniciales y resultados de búsqueda
6. **No Afecta Carrito**: La funcionalidad del carrito permanece intacta

## Flujo de Usuario

1. **Usuario ve lista de productos**
2. **Cada producto muestra**:
   - Nombre del producto
   - Valor Neto (gris, pequeño)
   - Valor con Impuestos (verde, destacado)
   - Asterisco naranja (*) si tiene impuestos adicionales
3. **Leyenda aparece** si hay productos con impuestos adicionales
4. **Usuario puede tomar decisiones informadas** sobre precios antes de agregar al carrito

## Cálculos Implementados

### **Productos Sin Impuestos Adicionales**
- Valor Neto: $6.380
- IVA (19%): $1.212
- **Valor con Impuestos**: $7.592

### **Productos Con Impuestos Adicionales**
- Valor Neto: $6.380
- IVA (19%): $1.212
- Impuesto Adicional (20.5%): $1.308
- **Valor con Impuestos**: $8.900

## Notas Técnicas

- La función `calculatePriceWithTaxes` es independiente de las funciones del carrito
- Los cálculos se realizan en tiempo real para cada producto
- El redondeo se aplica al valor final con impuestos
- La leyenda solo aparece cuando hay al menos un producto con impuestos adicionales
- El diseño es responsive y mantiene la funcionalidad existente
