"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Mic, Pause, Play, Volume2, ShoppingBag, Check, Wifi, Battery, Signal, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function VozPosSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioVisualizer, setAudioVisualizer] = useState<number[]>([]);
  const [productFound, setProductFound] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const productTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clientTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ticketTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      recordingTimerRef.current = timer;
      return () => clearInterval(timer);
    }
  }, [isRecording]);

  useEffect(() => {
    // Generate random audio visualizer bars
    const generateVisualizer = () => {
      const interval = setInterval(() => {
        if (isRecording) {
          const bars = Array.from({ length: 20 }, () => 
            Math.floor(Math.random() * 50) + 10
          );
          setAudioVisualizer(bars);
        } else {
          setAudioVisualizer(Array(20).fill(5));
        }
      }, 100);
      
      return () => clearInterval(interval);
    };
    
    const visualizerInterval = generateVisualizer();
    return () => visualizerInterval();
  }, [isRecording]);

  // Effect to handle client search after product is found
  useEffect(() => {
    if (productFound && !clientFound && !clientTimerRef.current) {
      clientTimerRef.current = setTimeout(() => {
        setRecognizedText("Buscando Cliente Montemar el Tabo...");
        
        setTimeout(() => {
          setClientFound(true);
        }, 2000);
      }, 2000);
    }
    
    return () => {
      if (clientTimerRef.current) {
        clearTimeout(clientTimerRef.current);
      }
    };
  }, [productFound, clientFound]);

  // Effect to handle ticket creation after client is found
  useEffect(() => {
    if (clientFound && !isCreatingTicket && !ticketTimerRef.current) {
      ticketTimerRef.current = setTimeout(() => {
        setRecognizedText("Creando Factura...");
        setIsCreatingTicket(true);
        
        setTimeout(() => {
          setShowTicket(true);
        }, 2000);
      }, 2000);
    }
    
    return () => {
      if (ticketTimerRef.current) {
        clearTimeout(ticketTimerRef.current);
      }
    };
  }, [clientFound, isCreatingTicket]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setRecognizedText("Escuchando comando...");
      setProductFound(false);
      setClientFound(false);
      setIsCreatingTicket(false);
      setShowTicket(false);
      
      // Set a timer to show the recognized command after 2 seconds
      setTimeout(() => {
        setRecognizedText("Buscar COCA COLA");
      }, 2000);
      
      // Set a timer to show the product after 5 seconds
      productTimerRef.current = setTimeout(() => {
        setProductFound(true);
      }, 5000);
    } else {
      // Stop recording
      setIsRecording(false);
      setRecordingTime(0);
      setRecognizedText("");
      setProductFound(false);
      setClientFound(false);
      setIsCreatingTicket(false);
      setShowTicket(false);
      
      // Clear timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      if (productTimerRef.current) {
        clearTimeout(productTimerRef.current);
        productTimerRef.current = null;
      }
      
      if (clientTimerRef.current) {
        clearTimeout(clientTimerRef.current);
        clientTimerRef.current = null;
      }
      
      if (ticketTimerRef.current) {
        clearTimeout(ticketTimerRef.current);
        ticketTimerRef.current = null;
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  // Time for smartphone
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <section 
      id="vozpos" 
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
            VozPos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">
            Pronto liberaremos esta nueva versión.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Sistema de punto de venta controlado por voz, que te permite realizar ventas
            y gestionar tu inventario usando comandos por voz.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    Comandos de Voz Intuitivos
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Utiliza comandos naturales como "Agregar café a la orden" o "Aplicar descuento del 10%" para operar el sistema sin tocar la pantalla.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    Reconocimiento Multilingual
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Soporte para múltiples idiomas permitiendo que tu personal trabaje en su idioma nativo, mejorando la precisión y reduciendo errores.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    Operación Manos Libres
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Ideal para entornos donde la higiene es crítica, como restaurantes y clínicas, permitiendo operar sin contacto físico con el dispositivo.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
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
                  <div className="p-4 overflow-auto h-[calc(100%-8rem)]">
                    <div className="text-center mb-4">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        Factura Movil - VozPos
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Prueba el Reconocimiento de Voz
                      </p>
                    </div>
                    
                    {!showTicket ? (
                      <>
                        {/* Audio Visualizer */}
                        <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 p-2 flex items-end justify-center space-x-1">
                          {audioVisualizer.map((height, index) => (
                            <div 
                              key={index}
                              className="w-1 bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-100"
                              style={{ height: `${height}%` }}
                            ></div>
                          ))}
                        </div>

                        {/* Recording Time */}
                        <div className="mb-4 text-center">
                          <span className={`text-xl font-mono ${isRecording ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatTime(recordingTime)}
                          </span>
                          {isRecording && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                        </div>

                        {/* Mic Button */}
                        <div className="flex justify-center mb-4">
                          <Button
                            onClick={toggleRecording}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors relative ${
                              isRecording 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <span className="absolute inset-0 w-full h-full rounded-full bg-purple-600/50 animate-ping opacity-75"></span>
                            <div className="z-10 flex items-center justify-center w-14 h-14 rounded-full animate-pulse">
                              <Mic size={22} />
                            </div>
                          </Button>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center space-x-3 mb-4">
                          <Button variant="outline" size="icon" className="rounded-full h-7 w-7">
                            <Pause size={14} />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-full h-7 w-7">
                            <Play size={14} />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-full h-7 w-7">
                            <Volume2 size={14} />
                          </Button>
                        </div>

                        {/* Recognized Command */}
                        {isRecording && recognizedText && (
                          <div className="mb-4 w-full">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-2 text-center">
                              <p className={`text-blue-800 dark:text-blue-300 text-xs font-medium ${recognizedText.includes("Escuchando") || recognizedText.includes("Buscando") || recognizedText.includes("Creando") ? "animate-pulse" : ""}`}>
                                {recognizedText}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Client info after voice recognition */}
                        {clientFound && (
                          <motion.div 
                            className="w-full mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Card className="overflow-hidden border border-blue-200 dark:border-blue-900">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-2 flex items-center justify-center">
                                      <User size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <div className="flex items-center mb-1">
                                        <div className="bg-green-500 text-white rounded-full p-0.5 mr-1 flex items-center justify-center" style={{ width: "16px", height: "16px" }}>
                                          <Check size={10} />
                                        </div>
                                        <span className="text-xs text-green-600 dark:text-green-400">Cliente encontrado</span>
                                      </div>
                                      <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                        Montemar el Tabo
                                      </h3>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        RUT: 76.345.321-K
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Av. Principal 123, El Tabo
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {/* Product found after voice recognition */}
                        {productFound && (
                          <motion.div 
                            className="w-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Card className="overflow-hidden border border-green-200 dark:border-green-900">
                              <div className="h-24 overflow-hidden">
                                <img 
                                  src="https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&w=600" 
                                  alt="Coca Cola" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center mb-1">
                                      <div className="bg-green-500 text-white rounded-full p-0.5 mr-1 flex items-center justify-center" style={{ width: "16px", height: "16px" }}>
                                        <Check size={10} />
                                      </div>
                                      <span className="text-xs text-green-600 dark:text-green-400">Producto encontrado</span>
                                    </div>
                                    <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                      Coca Cola
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      $15.99 / 340g
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-2"
                                  >
                                    <ShoppingBag size={12} className="mr-1" /> Añadir
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      // Ticket Screen
                      <motion.div 
                        className="w-full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          duration: 0.6, 
                          bounce: 0.3 
                        }}
                      >
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center mb-4">
                          <div className="flex justify-center items-center mb-2">
                            <FileText size={18} className="text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-green-800 dark:text-green-300 text-sm font-semibold">Factura Generada</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-400">Factura electrónica #F-9876</p>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4">
                          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                            <h3 className="font-bold text-sm">FACTURA MOVIL DEMO</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Av. Tecnológica 123, Ciudad Innovación</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.543.210-8</p>
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2">FACTURA ELECTRÓNICA</p>
                            <p className="text-xs font-bold">N° F-9876</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold mb-1">CLIENTE:</h4>
                            <p className="text-xs">Montemar el Tabo</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.345.321-K</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Av. Principal 123, El Tabo</p>
                          </div>
                          
                          <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                              <span>Producto</span>
                              <span>Total</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <div>
                                <span>Coca Cola 340g</span>
                                <br />
                                <span className="text-slate-600 dark:text-slate-400">1 x $15.99</span>
                              </div>
                              <span>$15.99</span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
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
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full mt-4 bg-blue-600"
                          onClick={toggleRecording}
                        >
                          Iniciar Nuevo Comando
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Home indicator */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                    <div className="w-28 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </div>
              
              {/* Glowing effect behind the phone */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -z-10 -top-10 -left-10 w-32 h-32 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20 blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}