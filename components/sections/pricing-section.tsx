"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PricingPlan } from "@/types";
import { ContactForm } from "@/components/ui/contact-form";

const monthlyPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter : 200 DTE",
    description: "Para pequeños negocios que comienzan con ventas digitales.:",
    price: "$59.900",
    features: [
      "1 dispositivo",
      "Módulo DigiPos",
      "Gestión básica de inventario",
      "Soporte por correo electrónico",
      "Actualizaciones mensuales"
    ],
    cta: "Comenzar Gratis"
  },
  {
    id: "pro",
    name: "Professional: 500 DTE",
    description: "Para negocios en crecimiento que necesitan más funcionalidades.",
    price: "$89.990",
    features: [
      "3 dispositivos",
      "Módulos DigiPos y ViewPos",
      "Gestión avanzada de inventario",
      "Reportes personalizados",
      "Soporte prioritario 24/5",
      "Actualizaciones semanales"
    ],
    cta: "Prueba Gratuita",
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise : 1500 DTE",
    description: "Solución completa para operaciones comerciales a gran escala.",
    price: "$179.900",
    features: [
      "Dispositivos ilimitados",
      "Todos los módulos (DigiPos, ViewPos, VozPos)",
      "Asistente IA avanzado",
      "Integración con sistemas existentes",
      "Gestión multi-tienda",
      "Soporte 24/7 con gestor de cuenta",
      "Actualizaciones prioritarias"
    ],
    cta: "Contactar Ventas"
  }
];

const monthlyPlansWithAccounting: PricingPlan[] = [
  {
    id: "starter-accounting",
    name: "Starter + Contabilidad",
    description: "Plan Starter con servicio contable completo incluido.",
    price: "$94.900",
    originalPrice: "$59.900",
    accountingPrice: "$35.000",
    features: [
      "1 dispositivo",
      "Módulo DigiPos",
      "Gestión básica de inventario",
      "Soporte por correo electrónico",
      "Actualizaciones mensuales",
      "Contabilidad completa mensual",
      "Declaración F29 mensual",
      "Asesoría contable por WhatsApp",
      "Trámites SII incluidos",
      "Diagnóstico empresarial inicial"
    ],
    cta: "Comenzar Gratis"
  },
  {
    id: "pro-accounting",
    name: "Professional + Contabilidad",
    description: "Plan Professional con servicio contable avanzado incluido.",
    price: "$144.990",
    originalPrice: "$89.990",
    accountingPrice: "$55.000",
    features: [
      "3 dispositivos",
      "Módulos DigiPos y ViewPos",
      "Gestión avanzada de inventario",
      "Reportes personalizados",
      "Soporte prioritario 24/5",
      "Actualizaciones semanales",
      "Contabilidad completa mensual",
      "Declaración F29 mensual",
      "Asesoría contable por WhatsApp",
      "Trámites SII incluidos",
      "Resumen ejecutivo mensual",
      "Planificación tributaria anual",
      "Prebalance anual (octubre)"
    ],
    cta: "Prueba Gratuita",
    popular: true
  },
  {
    id: "enterprise-accounting",
    name: "Enterprise + Contabilidad",
    description: "Plan Enterprise con servicio contable premium incluido.",
    price: "$252.900",
    originalPrice: "$179.900",
    accountingPrice: "$73.000",
    features: [
      "Dispositivos ilimitados",
      "Todos los módulos (DigiPos, ViewPos, VozPos)",
      "Asistente IA avanzado",
      "Integración con sistemas existentes",
      "Gestión multi-tienda",
      "Soporte 24/7 con gestor de cuenta",
      "Actualizaciones prioritarias",
      "Contabilidad completa mensual",
      "Declaración F29 mensual",
      "Asesoría contable por WhatsApp",
      "Trámites SII incluidos",
      "Resumen ejecutivo mensual",
      "Planificación tributaria anual",
      "Prebalance trimestral",
      "Contador asignado dedicado"
    ],
    cta: "Contactar Ventas"
  }
];

const yearlyPlans: PricingPlan[] = monthlyPlans.map(plan => ({
  ...plan,
  price: `$${parseInt(plan.price.substring(1)) * 10}`,
}));

const yearlyPlansWithAccounting: PricingPlan[] = monthlyPlansWithAccounting.map(plan => ({
  ...plan,
  price: `$${parseInt(plan.price.substring(1)) * 10}`,
  originalPrice: `$${parseInt(plan.originalPrice!.substring(1)) * 10}`,
  accountingPrice: `$${parseInt(plan.accountingPrice!.substring(1)) * 10}`,
}));

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [planType, setPlanType] = useState<"basic" | "accounting">("basic");
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const getPlans = () => {
    if (planType === "accounting") {
      return billingCycle === "monthly" ? monthlyPlansWithAccounting : yearlyPlansWithAccounting;
    }
    return billingCycle === "monthly" ? monthlyPlans : yearlyPlans;
  };

  const plans = getPlans();

  const comparePlans = [
    { feature: "Dispositivos", starter: "1", pro: "3", enterprise: "Ilimitados" },
    { feature: "DigiPos", starter: true, pro: true, enterprise: true },
    { feature: "ViewPos", starter: false, pro: true, enterprise: true },
    { feature: "VozPos", starter: false, pro: false, enterprise: true },
    { feature: "Asistente IA", starter: "Básico", pro: "Estándar", enterprise: "Avanzado" },
    { feature: "Reportes", starter: "Básicos", pro: "Personalizados", enterprise: "Avanzados" },
    { feature: "Multi-tienda", starter: false, pro: false, enterprise: true },
    { feature: "Soporte", starter: "Correo", pro: "24/5", enterprise: "24/7 Dedicado" },
    { feature: "Integración con impresoras Térmicas 80M", starter: true, pro: true, enterprise: true },
    { feature: "Módulo Web", starter: true, pro: true, enterprise: true },
  ];

  return (
    <section 
      id="pricing" 
      className="py-24 bg-white dark:bg-slate-800"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Planes y Precios
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu negocio.
            Todos los planes incluyen la version web de gestion.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          {/* Plan Type Toggle */}
          <div className="flex justify-center mb-8">
            <Tabs 
              defaultValue="basic" 
              className="w-full max-w-2xl"
              onValueChange={(value) => setPlanType(value as "basic" | "accounting")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Solo Plan</TabsTrigger>
                <TabsTrigger value="accounting" className="text-sm">
                  Plan + Contabilidad
                  <Badge className="ml-2 bg-green-500 hover:bg-green-600" variant="secondary">
                    Recomendado
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-10">
            <Tabs 
              defaultValue="monthly" 
              className="w-full max-w-md"
              onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Mensual</TabsTrigger>
                <TabsTrigger value="yearly">
                  Anual
                  <Badge className="ml-2 bg-green-500 hover:bg-green-600" variant="secondary">
                    20% ahorro
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <Card className={`h-full flex flex-col ${
                  plan.popular 
                    ? 'border-blue-500 dark:border-blue-400 shadow-lg relative' 
                    : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-blue-600">Más Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-8 pt-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        /{billingCycle === "monthly" ? "mes" : "año"}
                      </span>
                    </div>
                    {planType === "accounting" && plan.originalPrice && plan.accountingPrice && (
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between items-center">
                          <span>Plan: {plan.originalPrice}</span>
                          <span>+</span>
                          <span>Contabilidad: {plan.accountingPrice}</span>
                        </div>
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                          Ahorras tiempo y dinero con todo incluido
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : ''
                      }`}
                      onClick={() => plan.id === "enterprise" && setShowPhoneForm(true)}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Comparación de Características
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Característica</th>
                  <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Starter</th>
                  <th className="text-center p-4 font-semibold text-blue-600 dark:text-blue-400">Professional</th>
                  <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparePlans.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-slate-200 dark:border-slate-700 ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-4 text-slate-700 dark:text-slate-300 flex items-center">
                      {item.feature}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                              <HelpCircle size={14} className="text-slate-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Información adicional sobre {item.feature}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="p-4 text-center">
                      {typeof item.starter === 'boolean' ? (
                        item.starter ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{item.starter}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-blue-50 dark:bg-blue-900/10">
                      {typeof item.pro === 'boolean' ? (
                        item.pro ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{item.pro}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof item.enterprise === 'boolean' ? (
                        item.enterprise ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{item.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQs Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-24 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 lg:p-12 shadow-xl">
            {showPhoneForm ? (
              <div className="flex justify-center">
                <ContactForm onClose={() => setShowPhoneForm(false)} />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">
                  ¿Tienes un erp o necesitas un plan personalizado?
                </h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Si las opciones estándar no se ajustan a tus necesidades exactas, podemos crear un plan a la medida.
                  Nuestro equipo trabajará contigo para diseñar la solución perfecta para tu negocio.
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowPhoneForm(true)}
                >
                  Contacta con Ventas
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}