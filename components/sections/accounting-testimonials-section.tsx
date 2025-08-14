"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialType } from "@/types";

const accountingTestimonials: TestimonialType[] = [
  {
    id: "accounting-1",
    name: "Patricia Silva",
    role: "Contadora",
    company: "Estudio Contable Silva & Asociados",
    content: "Desde que contratamos el Plan + Contabilidad de Factura Movil, hemos reducido el tiempo de procesamiento de declaraciones en un 60%. La integración automática con el SII nos permite estar siempre al día con las obligaciones tributarias. Nuestros clientes están más tranquilos sabiendo que su contabilidad está en orden.",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "accounting-2",
    name: "Roberto Herrera",
    role: "Director Financiero",
    company: "Distribuidora del Sur",
    content: "El servicio contable incluido en nuestro plan Enterprise ha sido revolucionario. Antes pasábamos horas revisando documentos y preparando declaraciones. Ahora todo es automático y tenemos un contador dedicado que resuelve nuestras dudas en minutos. La planificación tributaria anual nos ha ahorrado miles de pesos.",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "accounting-3",
    name: "Carmen Valenzuela",
    role: "Propietaria",
    company: "Restaurante La Tradición",
    content: "Como dueña de un restaurante, la contabilidad siempre fue mi mayor dolor de cabeza. Con el Plan + Contabilidad de Factura Movil, ya no me preocupo por declaraciones tardías o errores. El resumen ejecutivo mensual me permite tomar decisiones informadas sobre mi negocio. Es como tener un departamento contable completo.",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "accounting-4",
    name: "Diego Morales",
    role: "Gerente General",
    company: "Farmacia Central",
    content: "La combinación del sistema POS con el servicio contable ha transformado completamente nuestra operación. Antes teníamos que coordinar entre el sistema de ventas y nuestro contador externo. Ahora todo está integrado y sincronizado. El prebalance trimestral nos da una visión clara de nuestra salud financiera.",
    image: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

export function AccountingTestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % accountingTestimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [autoplay]);

  const nextTestimonial = () => {
    setAutoplay(false);
    setActiveTestimonial((prev) => (prev + 1) % accountingTestimonials.length);
  };

  const prevTestimonial = () => {
    setAutoplay(false);
    setActiveTestimonial((prev) => (prev - 1 + accountingTestimonials.length) % accountingTestimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setAutoplay(false);
    setActiveTestimonial(index);
  };

  const currentTestimonial = accountingTestimonials[activeTestimonial];

  return (
    <section 
      id="accounting-testimonials" 
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
            Lo Que Dicen Nuestros Clientes Contables
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Descubre cómo el Plan + Contabilidad ha transformado la gestión financiera de empresas,
            ahorrando tiempo, reduciendo errores y optimizando la toma de decisiones.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden shadow-xl">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                {/* Left Section - Gradient Background with Profile */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 lg:p-12 flex flex-col items-center justify-center text-white">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  {/* Quote Icon */}
                  <div className="relative z-10 mb-8">
                    <Quote size={80} className="text-blue-200 opacity-50" />
                  </div>

                  {/* Profile Section */}
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20">
                      <img 
                        src={currentTestimonial.image} 
                        alt={currentTestimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">
                      {currentTestimonial.name}
                    </h3>
                    
                    <p className="text-blue-100 mb-4">
                      {currentTestimonial.role}
                    </p>
                    
                    <p className="text-blue-200 font-medium">
                      {currentTestimonial.company}
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center mt-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={20} 
                          className="text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section - Testimonial Content */}
                <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 flex flex-col justify-center relative">
                  {/* Quote Icon */}
                  <div className="absolute top-8 left-8">
                    <Quote size={60} className="text-blue-200" />
                  </div>

                  {/* Testimonial Text */}
                  <div className="flex-grow flex items-center">
                    <blockquote className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{currentTestimonial.content}"
                    </blockquote>
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between">
                    {/* Dots */}
                    <div className="flex space-x-2">
                      {accountingTestimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToTestimonial(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === activeTestimonial
                              ? 'bg-blue-600'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Arrows */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevTestimonial}
                        className="w-10 h-10 rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextTestimonial}
                        className="w-10 h-10 rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ChevronRight size={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
