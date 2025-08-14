"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Camera, Check, RefreshCw, Plus, X, Wifi, Battery, Signal, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ViewPosSection() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate recognition process
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2000);
  };

  const resetScan = () => {
    setHasScanned(false);
    setShowReceipt(false);
  };

  const handleAddToOrder = () => {
    setIsPrinting(true);
    
    // Simulate printing process
    setTimeout(() => {
      setIsPrinting(false);
      setShowReceipt(true);
    }, 2000);
  };

  // Time for smartphone
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <section 
      id="viewpos" 
      className="py-24 bg-white dark:bg-slate-800 relative overflow-hidden"
      ref={ref}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-16 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-70 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-32 -ml-16 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-70 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-transparent bg-clip-text">
            ViewPos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">
            Pronto liberaremos esta tecnología.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Sistema de reconocimiento visual que identifica productos automáticamente a través de la cámara, 
            agilizando el proceso de venta sin necesidad de códigos de barras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            {/* Smartphone Frame */}
            <div className="relative">
              {/* Phone shadow */}
              <div className="absolute inset-0 translate-x-2 translate-y-4 rounded-[3rem] bg-black/20 blur-md"></div>
              
              {/* Phone frame */}
              <div className="relative w-[320px] h-[640px] bg-black rounded-[2.5rem] p-3 shadow-xl border border-gray-800">
                {/* Power button */}
                <div className="absolute -right-1 top-28 w-1.5 h-16 bg-gray-800 rounded-l-md"></div>
                
                {/* Volume buttons */}
                <div className="absolute -left-1 top-28 w-1.5 h-8 bg-gray-800 rounded-r-md"></div>
                <div className="absolute -left-1 top-40 w-1.5 h-8 bg-gray-800 rounded-r-md"></div>
                
                {/* Phone screen */}
                <div className="relative bg-slate-100 dark:bg-slate-900 h-full w-full rounded-[2.3rem] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                    <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
                  </div>
                  
                  {/* Status bar */}
                  <div className="h-8 px-8 flex items-center justify-between bg-slate-800 text-white text-xs">
                    <span>{currentTime}</span>
                    <div className="flex items-center space-x-1">
                      <Signal size={12} />
                      <Wifi size={12} />
                      <Battery size={14} />
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="overflow-auto h-[calc(100%-8rem)]">
                    {!showReceipt ? (
                      <>
                        <div className="p-3 bg-slate-800 text-white text-center text-sm font-medium">
                          Factura Movil - ViewPos
                        </div>
                        
                        {/* Camera viewfinder */}
                        <div className="aspect-[4/3] relative">
                          <div className={`absolute inset-0 ${hasScanned ? 'bg-blue-900/40' : 'bg-black'} flex items-center justify-center`}>
                            {!hasScanned ? (
                              isScanning ? (
                                // Scanning animation
                                <div className="w-full h-full relative">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-opacity-80 text-sm">Escaneando...</div>
                                  </div>
                                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-scan"></div>
                                </div>
                              ) : (
                                // Camera ready state
                                <div className="flex flex-col items-center justify-center">
                                  <Camera size={40} className="text-slate-500 mb-3" />
                                  <p className="text-slate-500 text-xs">Presiona escanear para iniciar</p>
                                </div>
                              )
                            ) : (
                              // Product recognized state
                              <div className="w-full h-full flex items-center justify-center">
                                <img 
                                  src="https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&w=600" 
                                  alt="Coca Cola Reconocido" 
                                  className="w-full h-full object-cover opacity-70" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-black/30">
                                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg text-white border border-white/20">
                                    <div className="flex items-center mb-1">
                                      <div className="bg-green-500 rounded-full p-0.5 mr-1 flex items-center justify-center">
                                        <Check size={12} />
                                      </div>
                                      <span className="font-semibold text-sm">Producto Reconocido</span>
                                    </div>
                                    <p className="text-base font-bold">Coca Cola</p>
                                    <p className="text-xs text-green-300">$15.99 / 340g</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Camera controls */}
                        <div className="bg-slate-800 p-3 flex justify-between items-center">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-slate-300 hover:text-white h-8 w-8"
                            onClick={resetScan}
                            disabled={isScanning || !hasScanned}
                          >
                            <RefreshCw size={16} />
                          </Button>
                          
                          <Button
                            className={`${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-full px-4 py-1 text-xs`}
                            onClick={handleScan}
                            disabled={isScanning || hasScanned}
                          >
                            {isScanning ? 'Cancelar' : 'Escanear'}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-slate-300 hover:text-white h-8 w-8"
                            disabled={!hasScanned}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        {/* Product summary (after scan) */}
                        {hasScanned && (
                          <div className="p-3">
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                              <div className="p-3">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Coca Cola</h3>
                                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">$15.99</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">340g • SKU: CC001-REG</p>
                              </div>
                              <div className="border-t border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded-md">
                                    <X size={12} />
                                  </Button>
                                  <span className="text-xs font-medium">1</span>
                                  <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded-md">
                                    <Plus size={12} />
                                  </Button>
                                </div>
                                {isPrinting ? (
                                  <Button size="sm" className="rounded-md bg-slate-500 h-7 text-xs" disabled>
                                    <span className="mr-1 animate-spin">⊚</span> Procesando...
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    className="rounded-md bg-blue-600 h-7 text-xs"
                                    onClick={handleAddToOrder}
                                  >
                                    Crear Boleta
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center h-full">
                        {/* Receipt Header */}
                        <div className="bg-green-100 dark:bg-green-900/30 w-full p-3 text-center">
                          <div className="flex justify-center items-center mb-2">
                            <CheckCircle2 size={24} className="text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-green-800 dark:text-green-300 text-sm font-semibold">Boleta Generada</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-400">Boleta electrónica #B-5678</p>
                        </div>
                        
                        {/* Receipt Image */}
                        <div className="p-3 flex-1 flex items-center justify-center w-full overflow-auto">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                              type: "spring", 
                              duration: 0.6, 
                              bounce: 0.3 
                            }}
                            className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-md rounded p-4 max-w-full"
                          >
                            <div className="flex flex-col items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                              <h3 className="font-bold text-sm text-center">FACTURA MOVIL DEMO</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Av. Tecnológica 123, Ciudad Innovación</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">RUT: 76.543.210-8</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">BOLETA ELECTRÓNICA</p>
                              <p className="text-xs font-bold">N° B-5678</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                              </p>
                            </div>
                            
                            <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                              <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium">Producto</span>
                                <span className="font-medium">Total</span>
                              </div>
                              <div className="flex justify-between text-xs mb-1">
                                <div>
                                  <span>Coca Cola 340g</span>
                                  <br />
                                  <span className="text-gray-500 dark:text-gray-400">1 x $15.99</span>
                                </div>
                                <span>$15.99</span>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Subtotal</span>
                                <span>$15.99</span>
                              </div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>IVA (19%)</span>
                                <span>$3.04</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold mt-2">
                                <span>TOTAL</span>
                                <span>$19.03</span>
                              </div>
                            </div>
                            
                            <div className="text-center text-xs">
                              <p>GRACIAS POR SU COMPRA</p>
                              <p className="mt-2 text-gray-500 dark:text-gray-400">www.facturamovil.com</p>
                            </div>
                          </motion.div>
                        </div>
                        
                        {/* Back Button */}
                        <div className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                          <Button
                            onClick={resetScan}
                            className="w-full bg-blue-600"
                          >
                            <RefreshCw size={16} className="mr-2" /> Escanear Nuevo Producto
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Home indicator */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                    <div className="w-28 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </div>
              
              {/* Glowing effect behind the phone */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-32 h-32 bg-cyan-400 dark:bg-cyan-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -z-10 -top-10 -left-10 w-32 h-32 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20 blur-xl"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-6">
              <Card className="overflow-hidden border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
                    Reconocimiento Inteligente
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Identifica productos instantáneamente mediante imágenes, sin necesidad de 
                    códigos de barras o etiquetas especiales. Ideal para tiendas con gran 
                    variedad de productos.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-400">
                    Aprendizaje Continuo
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    El sistema aprende y mejora con cada uso, aumentando su precisión 
                    en la identificación de productos y adaptándose a las condiciones 
                    específicas de tu negocio.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-l-4 border-l-cyan-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-cyan-700 dark:text-cyan-400">
                    Verificación Instantánea de Precios
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Permite a los clientes verificar precios y detalles de productos 
                    simplemente colocándolos frente a la cámara, mejorando la experiencia 
                    de compra y reduciendo consultas.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-amber-700 dark:text-amber-400">
                    Inventario Visual
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Facilita la toma de inventario utilizando reconocimiento visual 
                    para identificar y contar productos rápidamente, ahorrando tiempo 
                    y reduciendo errores en el proceso.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}