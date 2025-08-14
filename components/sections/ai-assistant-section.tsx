"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Bot, SendHorizontal, RotateCcw, Zap, BrainCircuit, Headphones, PencilLine, Wifi, Battery, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Hola, soy tu asistente virtual de Factura Movil. ¿En qué puedo ayudarte hoy?',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 5000),
  }
];

const suggestedQuestions = [
  "¿Cómo puedo crear un nuevo producto?",
  "Necesito generar un reporte de ventas",
  "¿Puedes mostrarme cómo aplicar un descuento?",
  "¿Cómo configuro diferentes métodos de pago?"
];

export function AIAssistantSection() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  // Client-side only time state
  const [currentTime, setCurrentTime] = useState("00:00");
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Update time on client-side only
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate the conversation flow
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (inView) {
      if (conversationStage === 0) {
        timeoutId = setTimeout(() => {
          const question1: Message = {
            id: Date.now().toString(),
            text: "Tengo quiebre de Stock esta semana.",
            sender: 'user',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, question1]);
          setIsTyping(true);
          setConversationStage(1);
        }, 1500);
      } else if (conversationStage === 1) {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          const response1: Message = {
            id: (Date.now() + 1).toString(),
            text: "Los productos con quiebre de stock esta semana son: Café Colombiano (15 unidades), Azúcar Refinada (22 unidades), Leche Deslactosada (8 unidades).",
            sender: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response1]);
          setConversationStage(2);
        }, 2000);
      } else if (conversationStage === 2) {
        timeoutId = setTimeout(() => {
          const question2: Message = {
            id: Date.now().toString(),
            text: "Cual es el producto que mas compra el cliente: Almacen el Sol.",
            sender: 'user',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, question2]);
          setIsTyping(true);
          setConversationStage(3);
        }, 1500);
      } else if (conversationStage === 3) {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          const response2: Message = {
            id: (Date.now() + 1).toString(),
            text: "Los productos más comprados por Almacen el Sol son: Arroz Premium (120 unidades mensuales), Aceite de Oliva (95 unidades mensuales), Harina Todo Uso (70 unidades mensuales).",
            sender: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response2]);
          setConversationStage(4);
        }, 2000);
      } else if (conversationStage === 4) {
        timeoutId = setTimeout(() => {
          const question3: Message = {
            id: Date.now().toString(),
            text: "Cuanto he vendido esta semana y comparalo con el mes pasado.",
            sender: 'user',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, question3]);
          setIsTyping(true);
          setConversationStage(5);
        }, 1500);
      } else if (conversationStage === 5) {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
          const response3: Message = {
            id: (Date.now() + 1).toString(),
            text: "Esta semana has vendido $4,875,300 en total, lo que representa un aumento del 15.3% comparado con el mismo periodo del mes pasado cuando tus ventas alcanzaron $4,227,800. Los días martes y viernes han sido particularmente fuertes este mes, con un incremento de 23% en ventas de productos estacionales.",
            sender: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response3]);
          setConversationStage(6);
        }, 2000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [conversationStage, inView]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setInput("");
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        const responses = [
          "Por supuesto, puedo ayudarte con eso. Para crear un nuevo producto, ve a la sección 'Inventario' y haz clic en 'Agregar Producto'.",
          "Claro, para generar un reporte de ventas, navega a la sección 'Reportes' en el panel izquierdo y selecciona el período que deseas analizar.",
          "Los descuentos se pueden aplicar de dos formas: por porcentaje o por monto fijo. Selecciona el producto y haz clic en 'Aplicar Descuento'.",
          "Puedo mostrarte paso a paso cómo configurar diferentes métodos de pago en tu sistema. ¿Te gustaría ver un tutorial?"
        ];
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const resetChat = () => {
    setMessages(initialMessages);
    setConversationStage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section 
      id="ai-assistant" 
      className="py-24 bg-white dark:bg-slate-800 relative overflow-hidden"
      ref={ref}
    >
      {/* Decorative background elements */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-70 blur-3xl -mr-48 -mb-48"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-70 blur-3xl -ml-48 -mt-48"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Asistente IA
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            "Pronto liberaremos esta innovación."
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Aprovecha el poder de la inteligencia artificial para obtener respuestas instantáneas,
            solucionar problemas y optimizar el funcionamiento de tu negocio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-8">
              <motion.div variants={fadeInUpVariants} initial="hidden" animate={inView ? "visible" : "hidden"}>
                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-6 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BrainCircuit size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-400">
                        Asistencia Personalizada
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        El asistente IA aprende de tus interacciones y se adapta a las necesidades 
                        específicas de tu negocio, ofreciendo sugerencias cada vez más relevantes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUpVariants} initial="hidden" animate={inView ? "visible" : "hidden"} transition={{ delay: 0.2 }}>
                <Card className="overflow-hidden border-l-4 border-l-purple-500">
                  <CardContent className="p-6 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Headphones size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-400">
                        Soporte 24/7
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Disponible en cualquier momento, el asistente virtual resuelve dudas operativas 
                        y técnicas instantáneamente, sin esperas ni horarios de atención.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUpVariants} initial="hidden" animate={inView ? "visible" : "hidden"} transition={{ delay: 0.4 }}>
                <Card className="overflow-hidden border-l-4 border-l-cyan-500">
                  <CardContent className="p-6 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <Zap size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-cyan-700 dark:text-cyan-400">
                        Automatización Inteligente
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Automatiza tareas rutinarias como reordenar inventario, programar promociones
                        y generar informes personalizados según tus parámetros preferidos.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUpVariants} initial="hidden" animate={inView ? "visible" : "hidden"} transition={{ delay: 0.6 }}>
                <Card className="overflow-hidden border-l-4 border-l-amber-500">
                  <CardContent className="p-6 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <PencilLine size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        Análisis Predictivo
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Anticipa tendencias de ventas, sugiere ajustes de inventario y 
                        recomienda estrategias de precios basadas en datos históricos y 
                        patrones de mercado.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                <div className="relative bg-white dark:bg-slate-900 h-full w-full rounded-[2.3rem] overflow-hidden">
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

                  {/* Chat App Content */}
                  <div className="h-[calc(100%-8rem)] flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center">
                      <div className="bg-white/20 rounded-full p-2 mr-3">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Asistente IA</h3>
                        <p className="text-blue-100 text-sm">En línea</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="ml-auto text-white hover:bg-white/10"
                        onClick={resetChat}
                      >
                        <RotateCcw size={16} />
                      </Button>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                          }`}>
                            <p>{message.text}</p>
                            <span className={`text-xs block mt-1 ${
                              message.sender === 'user'
                                ? 'text-blue-100'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Suggested Questions */}
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex overflow-x-auto space-x-2 pb-2">
                        {suggestedQuestions.map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap text-xs"
                            onClick={() => handleSuggestedQuestion(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <div className="flex items-center">
                        <Input
                          placeholder="Escribe tu pregunta..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="flex-1"
                        />
                        <Button 
                          className="ml-2 bg-blue-600 hover:bg-blue-700"
                          onClick={handleSendMessage}
                          disabled={!input.trim()}
                        >
                          <SendHorizontal size={18} />
                        </Button>
                      </div>
                    </div>
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