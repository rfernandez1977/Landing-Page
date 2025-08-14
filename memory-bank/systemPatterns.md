# FACTURA MOVIL - PATRONES DEL SISTEMA

## VISIÓN GENERAL DE LA ARQUITECTURA

La landing page de Factura Movil sigue una arquitectura moderna basada en componentes construida en Next.js 13 con App Router, enfatizando rendimiento, mantenibilidad y escalabilidad.

## 🏗️ ARQUITECTURA DEL SISTEMA

### ARQUITECTURA EN CAPAS
```
┌─────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN      │
│  (Componentes React, Biblioteca UI) │
├─────────────────────────────────────┤
│           CAPA DE LÓGICA DE NEGOCIO │
│  (Hooks Personalizados, Gestión de Estado) │
├─────────────────────────────────────┤
│           CAPA DE ACCESO A DATOS    │
│  (Rutas API, Cliente Supabase)      │
├─────────────────────────────────────┤
│           SERVICIOS EXTERNOS        │
│  (Supabase, Procesadores de Pago)   │
└─────────────────────────────────────┘
```

### JERARQUÍA DE COMPONENTES
```
RootLayout
├── ThemeProvider
├── Header
├── Contenido Principal
│   ├── HeroSection
│   │   ├── PhoneInputForm
│   │   └── Elementos Interactivos
│   ├── VozPosSection
│   ├── ViewPosSection
│   ├── DigiPosSection
│   ├── AIAssistantSection
│   ├── TestimonialsSection
│   └── PricingSection
└── Footer
```

## 🎯 PATRONES DE DISEÑO

### 1. PATRÓN DE COMPOSICIÓN DE COMPONENTES
**Propósito**: Construir UIs complejas desde componentes simples y reutilizables

**Implementación**:
```typescript
// Componentes UI base (shadcn/ui)
<Button variant="default" size="lg">
  <Icon className="mr-2" />
  Texto de Acción
</Button>

// Componentes de sección
<HeroSection>
  <PhoneInputForm onClose={handleClose} />
  <InteractiveDemo />
</HeroSection>
```

**Beneficios**:
- Componentes reutilizables entre secciones
- Estilos y comportamiento consistentes
- Mantenimiento y actualizaciones fáciles
- Interfaces de componentes con tipos seguros

### 2. PATRÓN DE HOOKS PERSONALIZADOS
**Propósito**: Extraer y reutilizar lógica con estado

**Ejemplos**:
```typescript
// Hook de validación de formulario
const usePhoneValidation = (phoneNumber: string) => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const phoneRegex = /^9\d{8}$/;
    setIsValid(phoneRegex.test(phoneNumber));
  }, [phoneNumber]);
  
  return { isValid, error };
};

// Hook de animación
const useScrollAnimation = (threshold: number) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, isVisible };
};
```

### 3. PATRÓN DE PROVEEDOR DE CONTEXTO
**Propósito**: Compartir estado entre árboles de componentes

**Implementación**:
```typescript
// Contexto de tema
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4. PATRÓN DE RUTAS API
**Propósito**: Manejar operaciones del lado del servidor y persistencia de datos

**Estructura**:
```
app/api/
├── phone-numbers/
│   └── route.ts          # POST /api/phone-numbers
├── analytics/
│   └── route.ts          # POST /api/analytics
└── webhooks/
    └── supabase/
        └── route.ts      # POST /api/webhooks/supabase
```

**Implementación**:
```typescript
// POST /api/phone-numbers
export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    // Validación
    if (!/^9\d{8}$/.test(phoneNumber)) {
      return Response.json(
        { error: "Formato de número de teléfono inválido" },
        { status: 400 }
      );
    }
    
    // Operación de base de datos
    const { data, error } = await supabase
      .from('phone_numbers')
      .insert([{ phone_number: phoneNumber }]);
    
    if (error) throw error;
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
```

## 🎨 PATRONES DE UI/UX

### 1. PATRÓN DE DISEÑO RESPONSIVO
**Estrategia de Puntos de Ruptura**:
```css
/* Enfoque Mobile First */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1024px;
  }
}
```

### 2. PATRONES DE ANIMACIÓN
**Integración de Framer Motion**:
```typescript
// Animación escalonada para listas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, index) => (
    <motion.div key={index} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 3. PATRONES DE FORMULARIOS
**Validación y Envío**:
```typescript
// Gestión de estado del formulario
const [formData, setFormData] = useState({
  phoneNumber: "",
  confirmation: ""
});

const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

// Función de validación
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.phoneNumber) {
    newErrors.phoneNumber = "El número de teléfono es requerido";
  } else if (!/^9\d{8}$/.test(formData.phoneNumber)) {
    newErrors.phoneNumber = "Formato de número de teléfono inválido";
  }
  
  if (formData.phoneNumber !== formData.confirmation) {
    newErrors.confirmation = "Los números de teléfono no coinciden";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Manejador de envío
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/phone-numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: formData.phoneNumber })
    });
    
    if (!response.ok) throw new Error('Envío fallido');
    
    // Manejo de éxito
  } catch (error) {
    // Manejo de errores
  } finally {
    setIsSubmitting(false);
  }
};
```

## 🔧 PATRONES DE GESTIÓN DE ESTADO

### 1. PATRÓN DE ESTADO LOCAL
**Estado a nivel de componente**:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

### 2. PATRÓN DE ESTADO ELEVADO
**Estado compartido entre componentes**:
```typescript
// El componente padre maneja el estado compartido
const [theme, setTheme] = useState<Theme>("light");
const [user, setUser] = useState<User | null>(null);

// Pasado a componentes hijos
<Header theme={theme} onThemeChange={setTheme} />
<MainContent user={user} />
```

### 3. PATRÓN DE ESTADO DE CONTEXTO
**Gestión de estado global**:
```typescript
// Estado de toda la aplicación
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  const value = {
    user,
    setUser,
    analytics,
    setAnalytics
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

## 🚀 PATRONES DE OPTIMIZACIÓN DE RENDIMIENTO

### 1. DIVISIÓN DE CÓDIGO
**Imports dinámicos para componentes grandes**:
```typescript
// Carga diferida de componentes pesados
const AIAssistantSection = dynamic(() => import('./ai-assistant-section'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});
```

### 2. PATRONES DE MEMOIZACIÓN
**React.memo para componentes costosos**:
```typescript
const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Lógica del componente
  return <div>{/* JSX */}</div>;
});
```

### 3. PATRONES DE OPTIMIZACIÓN
**useMemo y useCallback**:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  // Lógica del manejador de eventos
}, [dependencies]);
```

## 🔒 PATRONES DE SEGURIDAD

### 1. VALIDACIÓN DE ENTRADA
**Validación del lado del cliente y servidor**:
```typescript
// Validación del lado del cliente
const validatePhoneNumber = (phone: string): boolean => {
  return /^9\d{8}$/.test(phone);
};

// Validación del lado del servidor
export async function POST(request: Request) {
  const { phoneNumber } = await request.json();
  
  if (!validatePhoneNumber(phoneNumber)) {
    return Response.json({ error: "Entrada inválida" }, { status: 400 });
  }
  
  // Procesar entrada válida
}
```

### 2. MANEJO DE ERRORES
**Manejo de errores elegante**:
```typescript
// Try-catch con mensajes amigables al usuario
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operación falló:', error);
  return { error: "Algo salió mal. Por favor intenta de nuevo." };
}
```

## 📊 PATRONES DE FLUJO DE DATOS

### 1. FLUJO DE DATOS UNIDIRECCIONAL
```
Acción del Usuario → Estado del Componente → Llamada API → Base de Datos → Actualización de UI
```

### 2. PATRONES ORIENTADOS A EVENTOS
```typescript
// Eventos personalizados para comunicación entre componentes
const handlePhoneSubmit = () => {
  // Actualizar estado local
  setPhoneSubmitted(true);
  
  // Disparar analytics
  trackEvent('phone_submitted', { phoneNumber });
  
  // Mostrar mensaje de éxito
  showToast('Número de teléfono enviado exitosamente');
};
```

## 🔄 PATRONES DE INTEGRACIÓN

### 1. INTEGRACIÓN CON SUPABASE
**Operaciones de base de datos**:
```typescript
// Operación de inserción
const { data, error } = await supabase
  .from('phone_numbers')
  .insert([{ phone_number: phoneNumber, created_at: new Date() }]);

// Operación de consulta
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('event_type', 'phone_submission')
  .gte('created_at', startDate);
```

### 2. INTEGRACIÓN DE API
**Llamadas a servicios externos**:
```typescript
// Fetch con manejo de errores
const fetchData = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP! estado: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error de fetch:', error);
    throw error;
  }
};
```

---

**Principios de Patrones**: El sistema sigue las mejores prácticas de React y Next.js, enfatizando la reutilización de componentes, optimización de rendimiento y estructura de código mantenible mientras proporciona una experiencia de usuario perfecta para el mercado chileno.
