"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, ShoppingBag, DollarSign, CreditCard, Receipt, BarChart, RefreshCw, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const products = [
  { id: 1, name: "Café Americano", price: 3.99, image: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 2, name: "Cappuccino", price: 4.50, image: "https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 3, name: "Croissant", price: 2.99, image: "https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 4, name: "Sándwich Vegano", price: 7.49, image: "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=600" }
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export function DigiPosSection() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [documentType, setDocumentType] = useState<'boleta' | 'factura'>('boleta');
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const addToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate printing process with 2-second delay
    setTimeout(() => {
      setIsPrinting(false);
      setShowReceipt(true);
    }, 2000);
  };

  const resetReceipt = () => {
    setShowReceipt(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BoletaReceipt = () => (
    <div className="h-full flex flex-col">
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
          onClick={resetReceipt}
        >
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto">
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
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-xs mb-1">
              <div>
                <span>{item.name}</span>
                <br />
                <span className="text-slate-600 dark:text-slate-400">{item.quantity} x ${item.price.toFixed(2)}</span>
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>IVA (19%)</span>
            <span>${(calculateTotal() * 0.19).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-2">
            <span>TOTAL</span>
            <span>${(calculateTotal() * 1.19).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center text-xs mt-auto">
          <p>GRACIAS POR SU COMPRA</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
        </div>
      </div>
      
      <Button
        className="w-full mt-4 bg-blue-600"
        onClick={resetReceipt}
      >
        Volver
      </Button>
    </div>
  );

  const FacturaReceipt = () => (
    <div className="h-full flex flex-col">
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
          onClick={resetReceipt}
        >
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto">
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
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-xs mb-1">
              <div>
                <span>{item.name}</span>
                <br />
                <span className="text-slate-600 dark:text-slate-400">{item.quantity} x ${item.price.toFixed(2)}</span>
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>IVA (19%)</span>
            <span>${(calculateTotal() * 0.19).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-2">
            <span>TOTAL</span>
            <span>${(calculateTotal() * 1.19).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center text-xs mt-auto">
          <p>GRACIAS POR SU COMPRA</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
        </div>
      </div>
      
      <Button
        className="w-full mt-4 bg-blue-600"
        onClick={resetReceipt}
      >
        Volver
      </Button>
    </div>
  );

  return (
    <section 
      id="digipos" 
      className="py-24 bg-slate-50 dark:bg-slate-900 relative"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
            DigiPos
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Solución POS digital tradicional con una interfaz moderna e intuitiva para administrar
            ventas, inventario y reportes desde cualquier dispositivo.
          </p>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Panel - Categories & Products */}
            <div className="lg:col-span-2 border-r border-slate-200 dark:border-slate-700">
              {/* Search & Tabs */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar productos..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="ml-3" variant="outline">
                    <BarChart size={18} className="mr-2" />
                    Reportes
                  </Button>
                </div>
              </div>

              {/* Tabs & Products */}
              <Tabs defaultValue="all" className="p-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="coffee">Café</TabsTrigger>
                  <TabsTrigger value="food">Comida</TabsTrigger>
                  <TabsTrigger value="merch">Merchandising</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.map(product => (
                      <Card key={product.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="h-32 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                {product.name}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(product)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ShoppingBag size={16} className="mr-1" /> Añadir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="coffee">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Café
                  </div>
                </TabsContent>
                
                <TabsContent value="food">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Comida
                  </div>
                </TabsContent>
                
                <TabsContent value="merch">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Merchandising
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="flex flex-col bg-white dark:bg-slate-900/50">
              {showReceipt ? (
                <div className="p-4 h-full">
                  {documentType === 'boleta' ? <BoletaReceipt /> : <FacturaReceipt />}
                </div>
              ) : (
                <>
                  {/* Cart Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                        <ShoppingBag size={18} className="mr-2" />
                        Carrito de Compra
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                        Limpiar
                      </Button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-1 overflow-auto p-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                        <p className="text-center">Tu carrito está vacío</p>
                        <p className="text-sm text-center mt-2">
                          Agrega productos desde el catálogo
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="w-12 h-12 rounded overflow-hidden mr-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {item.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  ${item.price.toFixed(2)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    -
                                  </Button>
                                  <span className="text-sm font-medium w-4 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button 
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => addToCart(item)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                        <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Impuestos</span>
                        <span className="font-medium">${(calculateTotal() * 0.07).toFixed(2)}</span>
                      </div>
                      <div className="pt-1.5 mt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">${(calculateTotal() * 1.07).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Document Type Selection */}
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={documentType === 'boleta' ? 'default' : 'outline'} 
                          className={documentType === 'boleta' ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => setDocumentType('boleta')}
                        >
                          <Receipt size={16} className="mr-2" /> Boleta
                        </Button>
                        <Button 
                          variant={documentType === 'factura' ? 'default' : 'outline'} 
                          className={documentType === 'factura' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          onClick={() => setDocumentType('factura')}
                        >
                          <FileText size={16} className="mr-2" /> Factura
                        </Button>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <DollarSign size={16} className="mr-1" /> Efectivo
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <CreditCard size={16} className="mr-1" /> Tarjeta
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handlePrint}
                      disabled={isPrinting || cart.length === 0}
                    >
                      {isPrinting ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" /> Procesando...
                        </>
                      ) : (
                        <>
                          <Receipt size={16} className="mr-2" /> Imprimir Factura o Boleta
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <BarChart size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  Reportes en Tiempo Real
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Visualiza el rendimiento de tu negocio al instante con informes detallados 
                  de ventas, inventario y ganancias actualizados en tiempo real.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  Pagos Flexibles
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Acepta múltiples métodos de pago, desde efectivo y tarjetas hasta pagos móviles 
                  y criptomonedas, adaptándote a las preferencias de tus clientes.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  Gestión desde la Web
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Controla tu inventario sin esfuerzo con actualizaciones automáticas, 
                  alertas de stock bajo y seguimiento detallado de productos y proveedores.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}