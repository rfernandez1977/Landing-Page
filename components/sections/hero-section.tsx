"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link as ScrollLink } from "react-scroll";
import { motion } from "framer-motion";
import { ChevronDown, Wifi, Battery, Signal, Search, ShoppingBag, ArrowLeft, ChevronRight, Plus, Minus, Mic, Clock, Calendar, DollarSign, CreditCard, User, Building2, FileText, Package, Receipt, BarChart, MapPin, Check, Filter, X, Phone, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// Export the PhoneInputForm component so it can be used elsewhere
export const PhoneInputForm = ({ onClose }: { onClose: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberConfirmation, setPhoneNumberConfirmation] = useState("");
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [showPhoneSubmitSuccess, setShowPhoneSubmitSuccess] = useState(false);
  const [phoneSubmitError, setPhoneSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneSubmit = async () => {
    setPhoneSubmitError("");
    // Validate phone number format (Chilean format: 9 digits starting with 9)
    const phoneRegex = /^9\d{8}$/;
    
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneSubmitError("Ingresa un número válido de 9 dígitos que comience con 9");
      return;
    }
    
    if (phoneNumber !== phoneNumberConfirmation) {
      setPhoneSubmitError("Los números de teléfono no coinciden");
      return;
    }
    
    // If validation passes
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el número de teléfono');
      }

      // Success handling
      setIsPhoneNumberValid(true);
      setShowPhoneSubmitSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        onClose();
        setPhoneNumber("");
        setPhoneNumberConfirmation("");
        setIsPhoneNumberValid(false);
        setShowPhoneSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting phone number:', error);
      setPhoneSubmitError(error instanceof Error ? error.message : 'Error al guardar el número de teléfono');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md"
    >
      {showPhoneSubmitSuccess ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">¡Solicitud Recibida!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Te contactaremos pronto al +56 {phoneNumber} para agendar una demostración personalizada.
          </p>
        </motion.div>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Solicitar Demo</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ingresa tu número de teléfono y te contactaremos para agendar una demostración personalizada.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de teléfono
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                  +56
                </span>
                <Input
                  type="tel"
                  maxLength={9}
                  placeholder="912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formato: 9XXXXXXXX (9 dígitos)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar número
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                  +56
                </span>
                <Input
                  type="tel"
                  maxLength={9}
                  placeholder="912345678"
                  value={phoneNumberConfirmation}
                  onChange={(e) => setPhoneNumberConfirmation(e.target.value.replace(/\D/g, ''))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            {phoneSubmitError && (
              <div className="text-sm text-red-500 dark:text-red-400">
                {phoneSubmitError}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handlePhoneSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export function HeroSection() {
  // Current time for the phone status bar
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Sample products for the QuickScreen
  const products = [
    { id: '1', name: 'Café Americano', price: 4.50, image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '2', name: 'Sandwich Vegano', price: 8.95, image: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '3', name: 'Jugo de Naranja', price: 3.50, image: 'https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '4', name: 'Croissant', price: 2.99, image: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '5', name: 'Cappuccino', price: 4.99, image: 'https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '6', name: 'Agua Mineral', price: 1.50, image: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

  // State to track the current screen
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // State to track the selected document type
  const [documentType, setDocumentType] = useState<'boleta' | 'factura'>('boleta');
  
  // State to show the generated ticket
  const [showTicket, setShowTicket] = useState(false);
  
  // State for ticket processing
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for phone number input and validation
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  
  // Total number of screens 
  const totalScreens = 4;

  // Function to go to the next screen
  const goToNextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % totalScreens);
  };

  // Function to go to the previous screen
  const goToPrevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + totalScreens) % totalScreens);
  };

  // Function to generate a ticket based on the selected document type
  const generateTicket = () => {
    setIsProcessing(true);
    // Add a 2-second delay before showing the ticket
    setTimeout(() => {
      setIsProcessing(false);
      setShowTicket(true);
    }, 2000);
  };

  // Function to reset and hide the ticket
  const resetTicket = () => {
    setShowTicket(false);
  };

  // BoletaTicket Component
  const BoletaTicket = () => {
    return (
      <div className="h-full bg-slate-100 dark:bg-slate-800 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center flex-1">
            <div className="flex justify-center items-center mb-2">
              <Receipt size={18} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-300 text-sm font-semibold">Boleta Generada</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">Boleta electrónica #B-5678</p>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="ml-2" 
            onClick={resetTicket}
          >
            <RefreshCw size={18} />
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            duration: 0.6, 
            bounce: 0.3 
          }}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto"
        >
          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
            <h3 className="font-bold text-sm">FACTURA MOVIL DEMO</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Av. Tecnológica 123, Ciudad Innovación</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.543.210-8</p>
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">BOLETA ELECTRÓNICA</p>
            <p className="text-xs font-bold">N° B-5678</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          
          <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Producto</span>
              <span>Total</span>
            </div>
            {products.slice(0, 3).map(product => (
              <div key={product.id} className="flex justify-between text-xs mb-1">
                <div>
                  <span>{product.name}</span>
                  <br />
                  <span className="text-slate-600 dark:text-slate-400">1 x ${product.price.toFixed(2)}</span>
                </div>
                <span>${product.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Subtotal</span>
              <span>$16.95</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span>IVA (19%)</span>
              <span>$3.22</span>
            </div>
            <div className="flex justify-between text-sm font-bold mt-2">
              <span>TOTAL</span>
              <span>$20.17</span>
            </div>
          </div>
          
          <div className="text-center text-xs mt-auto">
            <p>GRACIAS POR SU COMPRA</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
          </div>
        </motion.div>
        
        <Button
          className="w-full mt-4 bg-blue-600"
          onClick={resetTicket}
        >
          Volver
        </Button>
      </div>
    );
  };

  // FacturaTicket Component
  const FacturaTicket = () => {
    return (
      <div className="h-full bg-slate-100 dark:bg-slate-800 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center flex-1">
            <div className="flex justify-center items-center mb-2">
              <FileText size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-blue-800 dark:text-blue-300 text-sm font-semibold">Factura Generada</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">Factura electrónica #F-9876</p>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="ml-2" 
            onClick={resetTicket}
          >
            <RefreshCw size={18} />
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            duration: 0.6, 
            bounce: 0.3 
          }}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto"
        >
          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
            <h3 className="font-bold text-sm">FACTURA MOVIL DEMO</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Av. Tecnológica 123, Ciudad Innovación</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.543.210-8</p>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2">FACTURA ELECTRÓNICA</p>
            <p className="text-xs font-bold">N° F-9876</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          
          <div className="mb-3">
            <h4 className="text-xs font-semibold mb-1">CLIENTE:</h4>
            <p className="text-xs">Distribuidora Nacional Ltda.</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 77.123.456-7</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Av. Providencia 1234, Providencia</p>
          </div>
          
          <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Producto</span>
              <span>Total</span>
            </div>
            {products.slice(0, 3).map(product => (
              <div key={product.id} className="flex justify-between text-xs mb-1">
                <div>
                  <span>{product.name}</span>
                  <br />
                  <span className="text-slate-600 dark:text-slate-400">1 x ${product.price.toFixed(2)}</span>
                </div>
                <span>${product.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Subtotal</span>
              <span>$16.95</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span>IVA (19%)</span>
              <span>$3.22</span>
            </div>
            <div className="flex justify-between text-sm font-bold mt-2">
              <span>TOTAL</span>
              <span>$20.17</span>
            </div>
          </div>
          
          <div className="text-center text-xs mt-auto">
            <p>GRACIAS POR SU COMPRA</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
          </div>
        </motion.div>
        
        <Button
          className="w-full mt-4 bg-blue-600"
          onClick={resetTicket}
        >
          Volver
        </Button>
      </div>
    );
  };

  // Touch POS Screen Component
  const TouchPosScreen = () => {
    const documentTypes = [
      {
        id: 'factura',
        title: 'Factura Electrónica',
        description: 'Documento tributario para operaciones con empresas',
        icon: <FileText size={24} className="text-blue-500" />,
        color: 'bg-blue-100',
        active: true
      },
      {
        id: 'boleta',
        title: 'Boleta Electrónica',
        description: 'Documento para operaciones con consumidores finales',
        icon: <Receipt size={24} className="text-green-500" />,
        color: 'bg-green-100',
        active: true
      },
      {
        id: 'guia',
        title: 'Guía de Despacho',
        description: 'Documento para el traslado de mercaderías',
        icon: <Package size={24} className="text-amber-500" />,
        color: 'bg-amber-100',
        active: false
      },
      {
        id: 'nota',
        title: 'Nota de Venta',
        description: 'Documento interno no tributario',
        icon: <BarChart size={24} className="text-purple-500" />,
        color: 'bg-purple-100',
        active: false
      }
    ];

    return (
      <div className="px-4 pt-1 pb-3 flex flex-col h-full bg-white overflow-auto">
        <h2 className="text-center font-semibold text-base text-slate-800 pb-2">TouchPos</h2>
        
        <div className="mb-4">
          <h3 className="text-base font-medium mb-1 text-slate-900">Documentos Electrónicos</h3>
          <p className="text-xs text-slate-600 mb-3">
            Seleccione el tipo de documento que desea emitir
          </p>
        </div>
        
        <div className="space-y-3 overflow-auto">
          {documentTypes.map((doc) => (
            <div 
              key={doc.id} 
              className={`flex items-center p-3 rounded-lg border ${doc.active ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}
            >
              <div className={`${doc.color} rounded-full p-3 mr-3`}>
                {doc.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-slate-900">{doc.title}</h4>
                <p className="text-xs text-slate-600">{doc.description}</p>
              </div>
              {!doc.active && (
                <div className="bg-slate-200 rounded-full px-2 py-1">
                  <span className="text-xs text-slate-600">Próximamente</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Factura Electronica Screen Component
  const FacturaElectronicaScreen = () => {
    return (
      <div className="px-4 pt-1 pb-3 flex flex-col h-full bg-white overflow-auto">
        <h2 className="text-center font-semibold text-base text-slate-800 pb-2">Factura Electrónica</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded mb-4">
          <div className="flex items-center">
            <span className="text-xs font-medium text-blue-800">ID de Factura:</span>
            <span className="text-xs ml-1 text-slate-800">F-12345</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-slate-900">Cabecera</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Fecha de Emisión *</label>
              <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                <span className="text-xs">14/05/2025</span>
                <Calendar size={14} className="text-slate-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Fecha de Vencimiento</label>
              <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                <span className="text-xs">No aplica</span>
                <Calendar size={14} className="text-slate-500" />
              </div>
            </div>
          </div>
          
          <label className="text-xs text-slate-600 mb-1 block">Forma de Pago *</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 border border-blue-300 text-blue-700 text-xs font-medium p-2 rounded text-center">
              Contado
            </div>
            <div className="bg-slate-100 text-slate-500 text-xs p-2 rounded text-center">
              Crédito
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-900">Cliente</h3>
            <button className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Search size={14} className="text-white" />
            </button>
          </div>
          
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-2">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900">Distribuidora Nacional Ltda.</h4>
                <p className="text-xs text-slate-600">RUT: 77.123.456-7</p>
              </div>
            </div>
            
            <div className="flex items-center mt-2 bg-slate-100 p-2 rounded">
              <MapPin size={14} className="text-slate-500 mr-2" />
              <div>
                <p className="text-xs text-slate-700">Av. Providencia 1234, Providencia</p>
                <p className="text-xs text-slate-500">Santiago</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-900">Productos</h3>
            <button className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </button>
          </div>
          
          <div className="border border-slate-200 rounded overflow-hidden mb-3">
            <div className="bg-slate-100 p-2 text-xs grid grid-cols-4">
              <div className="col-span-2 font-medium text-slate-700">Producto</div>
              <div className="text-right font-medium text-slate-700">Precio</div>
              <div className="text-right font-medium text-slate-700">Total</div>
            </div>
            
            <div className="p-2 border-t border-slate-200">
              <div className="grid grid-cols-4 mb-1">
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-800">Café Americano</p>
                  <p className="text-[10px] text-slate-500">SKU: CAF-001</p>
                  <div className="flex items-center mt-1">
                    <span className="text-[10px] text-slate-600 mr-1">Cant:</span>
                    <span className="text-xs font-medium">2</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600">$4.500</div>
                <div className="text-right flex justify-end items-start">
                  <span className="text-xs font-medium text-slate-800 mr-1">$9.000</span>
                  <button className="text-red-500">
                    <Minus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-slate-900">Totales</h3>
            <div className="bg-slate-50 rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Monto Neto</span>
                <span className="text-xs text-slate-800">$9.000</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">IVA (19%)</span>
                <span className="text-xs text-slate-800">$1.710</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-900">Total</span>
                <span className="text-sm font-bold text-blue-600">$10.710</span>
              </div>
            </div>
          </div>
          
          <button className="bg-blue-600 text-white text-sm font-medium w-full py-2 rounded mt-4">
            Generar Factura
          </button>
        </div>
      </div>
    );
  };

  // Boleta Electronica Screen Component 
  const BoletaElectronicaScreen = () => {
    return (
      <div className="px-4 pt-1 pb-3 flex flex-col h-full bg-white overflow-auto">
        <h2 className="text-center font-semibold text-base text-slate-800 pb-2">Boleta Electrónica</h2>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-slate-900">Cabecera</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Fecha de Emisión *</label>
              <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                <span className="text-xs">14/05/2025</span>
                <Calendar size={14} className="text-slate-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Forma de Pago</label>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-blue-50 border border-blue-300 text-blue-700 text-[10px] font-medium p-1 rounded text-center">
                  Contado
                </div>
                <div className="bg-slate-100 text-slate-500 text-[10px] p-1 rounded text-center">
                  Crédito
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-900">Cliente</h3>
            <button className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Search size={14} className="text-white" />
            </button>
          </div>
          
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center justify-center">
              <div className="bg-slate-200 rounded-full w-12 h-12 flex items-center justify-center">
                <User size={24} className="text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">
              Seleccionar Cliente
            </p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-900">Productos</h3>
            <button className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </button>
          </div>
          
          <div className="border border-slate-200 rounded overflow-hidden mb-3">
            <div className="bg-slate-100 p-2 text-xs grid grid-cols-4">
              <div className="col-span-2 font-medium text-slate-700">Producto</div>
              <div className="text-right font-medium text-slate-700">Precio</div>
              <div className="text-right font-medium text-slate-700">Total</div>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-sm text-slate-400">No hay productos agregados</p>
              <button className="bg-blue-100 text-blue-600 text-xs font-medium px-4 py-2 rounded mt-2">
                Agregar Producto
              </button>
            </div>
          </div>
          
          <button className="bg-slate-300 text-slate-500 text-sm font-medium w-full py-2 rounded mt-4">
            Generar Boleta
          </button>
        </div>
      </div>
    );
  };
  
  // Clients List Screen Component
  const ClientsListScreen = () => {
    return (
      <div className="px-4 pt-1 pb-3 flex flex-col h-full bg-white overflow-auto">
        <h2 className="text-center font-semibold text-base text-slate-800 pb-2">Clientes</h2>
        
        <div className="flex items-center mb-3">
          <div className="flex-1 relative mr-2">
            <input 
              type="text" 
              placeholder="Buscar por nombre, RUT..." 
              className="w-full bg-slate-100 rounded-lg px-8 py-2 text-xs" 
            />
            <Search size={14} className="absolute left-2 top-2 text-slate-400" />
          </div>
          <button className="p-2 bg-slate-100 rounded-lg">
            <Filter size={16} className="text-blue-500" />
          </button>
        </div>
        
        <div className="bg-blue-500 text-white rounded-lg py-2 px-3 mb-4 flex items-center justify-center">
          <Plus size={14} className="mr-1" />
          <span className="text-xs font-medium">Crear Cliente</span>
        </div>
        
        <div className="space-y-3 overflow-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex">
                <div className="bg-blue-100 rounded-full p-2 mr-2">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-900">{`Empresa ${i} Ltda.`}</h4>
                  <p className="text-xs text-slate-600">{`RUT: 77.${i}23.456-7`}</p>
                  
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    <Phone size={12} className="mr-1" />
                    <span>{`+56 9 ${i}234 5678`}</span>
                  </div>
                  
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    <MapPin size={12} className="mr-1" />
                    <span>{`Dirección ${i}, Santiago`}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
        
        <button className="fixed bottom-6 right-6 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
          <Plus size={24} className="text-white" />
        </button>
      </div>
    );
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Quick y TouchPos<br />
              <span className="text-cyan-300">El Futuro del POS</span>
            </motion.h1>
            <motion.p 
              className="text-lg text-slate-100 mb-8 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Vive la experiencia.<br />
              Interactúa con todos nuestros sistemas inteligentes de punto de venta y vive la experiencia.<br />
              Presiona "Crear boleta" en todos nuestros módulos y descubre tú mismo todas las funcionalidades.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {showPhoneInput ? (
                <PhoneInputForm onClose={() => setShowPhoneInput(false)} />
              ) : (
                <>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-slate-100 hover:text-blue-700 rounded-full px-8 py-6 text-lg"
                    onClick={() => setShowPhoneInput(true)}
                  >
                    Solicitar Demo
                  </Button>
                  <ScrollLink
                    to="pricing"
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                  >
                    <Button 
                      variant="outline" 
                      className="bg-white text-blue-600 hover:bg-blue-50 border-white rounded-full px-8 py-6 text-lg"
                    >
                      Ver Precios
                    </Button>
                  </ScrollLink>
                </>
              )}
            </motion.div>
          </div>

          <motion.div 
            className="lg:w-1/2 mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Smartphone Frame */}
            <div className="relative mx-auto max-w-xs md:max-w-sm">
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
                  
                  {/* App Content */}
                  <div className="h-full overflow-hidden">
                    {/* Header with navigation buttons */}
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700"
                        onClick={goToPrevScreen}>
                        <ArrowLeft size={16} className="text-white" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700"
                        onClick={goToNextScreen}>
                        <ChevronRight size={16} className="text-white" />
                      </button>
                    </div>
                    
                    {/* Conditionally render the current screen */}
                    <div className="h-[calc(100%-48px)] overflow-hidden">
                      {currentScreen === 0 && (
                        <div className="h-full bg-slate-800">
                          {!showTicket ? (
                            <>
                              {/* QuickScreen App Content */}
                              {/* Main Action Button */}
                              <div className="flex justify-center items-center py-4 px-4">
                                {isProcessing ? (
                                  <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                                      <Loader2 size={28} className="text-blue-400 animate-spin" />
                                    </div>
                                    <p className="text-white text-sm mt-2 animate-pulse">Procesando...</p>
                                  </div>
                                ) : (
                                  <div 
                                    className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:animate-none transition-all duration-300 hover:scale-110 animate-bounce"
                                    onClick={generateTicket}
                                    style={{animationDuration: '2s', animationIterationCount: 'infinite'}}
                                  >
                                    {/* Efecto de brillo pulsante */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 rounded-full opacity-0 animate-ping" style={{animationDuration: '3s'}}></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                    <div className="relative z-10">
                                    {documentType === 'boleta' ? (
                                      <Receipt size={28} className="text-white" />
                                    ) : (
                                      <FileText size={28} className="text-white" />
                                    )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center mb-2 text-white text-sm font-medium">
                                {isProcessing ? 'Generando documento...' : `Crear ${documentType === 'boleta' ? 'Boleta' : 'Factura'}`}
                              </div>
                              
                              {/* Products Grid */}
                              <div className="bg-slate-900 rounded-t-xl p-3 overflow-y-auto h-[calc(100%-190px)]">
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center">
                                    <span className="text-white font-semibold mr-2">Voz</span>
                                    <button className="w-6 h-6 bg-purple-600/50 rounded-full flex items-center justify-center">
                                      <Mic size={12} className="text-white" />
                                    </button>
                                  </div>
                                  <button className="w-6 h-6 bg-blue-600/50 rounded-full flex items-center justify-center">
                                    <Search size={12} className="text-white" />
                                  </button>
                                </div>
                                
                                {/* Products grid */}
                                <div className="grid grid-cols-3 gap-2">
                                  {products.map(product => (
                                    <div key={product.id} className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
                                      <div className="w-14 h-14 rounded-md overflow-hidden mb-1">
                                        <img 
                                          src={product.image} 
                                          alt={product.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="text-white text-xs line-clamp-1 text-center">{product.name}</span>
                                      <span className="text-blue-400 text-xs font-medium">${product.price.toFixed(2)}</span>
                                      
                                      <div className="flex justify-between items-center w-full mt-1">
                                        <span className="text-slate-400 text-[10px]">Cant: <span className="text-green-400">1</span></span>
                                        <span className="text-blue-300 text-[10px]">${product.price.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Order Summary */}
                                <div className="bg-slate-800 rounded-md p-3 mt-3">
                                  <div className="flex justify-between items-center text-xs text-white mb-1">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span>$26.43</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-white mb-1">
                                    <span className="text-slate-400">IVA (19%)</span>
                                    <span>$5.02</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm text-white font-bold pt-1 border-t border-slate-700 mt-1">
                                    <span>Total</span>
                                    <span className="text-blue-400">$31.45</span>
                                  </div>
                                </div>
                                
                                {/* Payment Buttons */}
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  <button className="bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center">
                                    <DollarSign size={12} className="mr-1" />
                                    Efectivo
                                  </button>
                                  <button className="bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center">
                                    <CreditCard size={12} className="mr-1" />
                                    Tarjeta
                                  </button>
                                </div>
                                
                                {/* Date and payment options */}
                                <div className="bg-slate-800 rounded-md p-2 mt-3 flex items-center justify-between">
                                  <div className="flex items-center text-slate-300 text-xs">
                                    <Calendar size={12} className="mr-1" />
                                    <span>14 Mayo 2025</span>
                                  </div>
                                  <div className="flex items-center text-slate-300 text-xs">
                                    <Clock size={12} className="mr-1" />
                                    <span>Contado</span>
                                  </div>
                                </div>
                                
                                {/* Client Information */}
                                <div className="bg-slate-800 rounded-md p-2 mt-3 flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-2">
                                    <Building2 size={16} className="text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-white text-xs font-medium block">Distribuidora Nacional Ltda.</span>
                                    <span className="text-slate-400 text-[10px] block">RUT: 87654321-0</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bottom Tabs */}
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-950 flex items-center">
                                <div 
                                  className={`flex-1 flex items-center justify-center py-2 ${documentType === 'boleta' ? 'bg-pink-600 text-white' : 'bg-transparent text-slate-400'} text-xs font-medium cursor-pointer`}
                                  onClick={() => setDocumentType('boleta')}
                                >
                                  Boleta
                                </div>
                                <div 
                                  className={`flex-1 flex items-center justify-center py-2 ${documentType === 'factura' ? 'bg-pink-600 text-white' : 'bg-transparent text-slate-400'} text-xs font-medium cursor-pointer`}
                                  onClick={() => setDocumentType('factura')}
                                >
                                  Factura
                                </div>
                              </div>
                            </>
                          ) : (
                            // Show the appropriate ticket based on document type
                            documentType === 'boleta' ? <BoletaTicket /> : <FacturaTicket />
                          )}
                        </div>
                      )}
                      
                      {currentScreen === 1 && <TouchPosScreen />}
                      {currentScreen === 2 && <FacturaElectronicaScreen />}
                      {currentScreen === 3 && <BoletaElectronicaScreen />}
                    </div>
                  </div>
                  
                  {/* Home indicator */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                    <div className="w-28 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </motion.div>
        </div>
        

      </div>
    </section>
  );
}