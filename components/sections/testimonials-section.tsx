"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialType } from "@/types";

const testimonials: TestimonialType[] = [
  {
    id: "1",
    name: "Elena Rodríguez",
    role: "Propietaria",
    company: "Café Milagro",
    content: "Desde que implementamos Factura Movil, hemos aumentado la rapidez de servicio en un 40%. El reconocimiento por voz nos permite tomar pedidos mientras preparamos bebidas, lo que ha transformado por completo nuestro flujo de trabajo.",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    role: "Director",
    company: "Restaurante El Fogón",
    content: "La función de reconocimiento visual ha minimizado errores de inventario y nos permite identificar productos sin etiquetas dañadas. El soporte 24/7 a través del asistente IA es como tener un experto técnico siempre disponible.",
    image: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "3",
    name: "María González",
    role: "Gerente",
    company: "Boutique Elegance",
    content: "Como tienda de ropa pequeña pero de alta gama, necesitábamos una solución POS que fuera tan elegante como nuestra marca. Factura Movil no solo ha mejorado nuestra operación, sino que ha impresionado a nuestros clientes con su interfaz moderna.",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "4",
    name: "Gimmy Foitzick",
    role: "Director de Operaciones",
    company: "PRODUCTOS ARTESANALES D LILIS SPA",
    content: "En el sector Confites, la precisión es crucial. El sistema ViewPos de Factura Movil identifica correctamente los productos, reduciendo errores potencialmente en las entregas. La integración con nuestro inventario es perfecta.",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay]);

  const nextTestimonial = () => {
    setAutoplay(false);
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setAutoplay(false);
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setAutoplay(false);
    setActiveTestimonial(index);
  };

  return (
    <section 
      id="testimonials" 
      className="py-24 bg-slate-50 dark:bg-slate-900"
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
            ¿Necesitas que te ayudemos con la contabilidad?
          </h2>
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Simplifica tu contabilidad y enfócate en crecer.
          </h3>
          <div className="relative">
            <div className="absolute -top-8 -left-8 text-blue-200 dark:text-blue-800/30 opacity-60">
              <Quote size={80} />
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto relative z-10">
              Con nuestro servicio, tienes soporte prioritario 24/5 y actualizaciones semanales. Nos encargamos de tu contabilidad completa y la declaración mensual del F29, incluyendo todos los trámites del SII. Además, te ofrecemos asesoría por WhatsApp y una planificación tributaria anual para que siempre estés un paso adelante.
            </p>
            <div className="absolute -bottom-8 -right-8 text-blue-200 dark:text-blue-800/30 opacity-60 transform rotate-180">
              <Quote size={80} />
            </div>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-white dark:bg-slate-800 shadow-xl border-none overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    {/* Testimonial Image */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 relative">
                      <div className="absolute inset-0 opacity-20 bg-pattern"></div>
                      <div className="h-full flex items-center justify-center p-6 lg:p-8">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden mx-auto">
                            <img 
                              src={testimonials[activeTestimonial].image} 
                              alt={testimonials[activeTestimonial].name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-4 text-center">
                            <h3 className="text-white font-semibold text-xl">
                              {testimonials[activeTestimonial].name}
                            </h3>
                            <p className="text-blue-100 text-sm">
                              {testimonials[activeTestimonial].role}
                            </p>
                            <p className="text-blue-200 text-sm">
                              {testimonials[activeTestimonial].company}
                            </p>
                          </div>
                          <div className="absolute -top-8 -left-8 text-white/20">
                            <Quote size={64} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating Stars */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="fill-current text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Testimonial Content */}
                    <div className="lg:col-span-3 p-6 lg:p-12 flex flex-col justify-between">
                      <div>
                        <div className="mb-6">
                          <Quote className="h-12 w-12 text-blue-200 dark:text-blue-800/30" />
                        </div>
                        <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed">
                          {testimonials[activeTestimonial].content}
                        </p>
                      </div>
                      
                      {/* Navigation Controls */}
                      <div className="mt-8 flex items-center justify-between">
                        <div className="flex space-x-2">
                          {testimonials.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToTestimonial(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === activeTestimonial
                                  ? "bg-blue-600 dark:bg-blue-500"
                                  : "bg-slate-300 dark:bg-slate-600 hover:bg-blue-400 dark:hover:bg-blue-700"
                              }`}
                              aria-label={`Go to testimonial ${index + 1}`}
                            />
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={prevTestimonial}
                            className="h-8 w-8 rounded-full p-0"
                          >
                            <ChevronLeft size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={nextTestimonial}
                            className="h-8 w-8 rounded-full p-0"
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}