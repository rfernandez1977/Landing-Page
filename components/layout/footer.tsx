"use client";

import { Link as ScrollLink } from "react-scroll";
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mt-4">
              Sistema POS avanzado con reconocimiento de voz, imágenes y asistente virtual con IA para revolucionar la gestión de tu negocio.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Productos</h4>
            <ul className="space-y-2">
              <li>
                <ScrollLink 
                  to="vozpos" 
                  spy={true} 
                  smooth={true} 
                  offset={-70} 
                  duration={500}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  VozPos
                </ScrollLink>
              </li>
              <li>
                <ScrollLink 
                  to="viewpos" 
                  spy={true} 
                  smooth={true} 
                  offset={-70} 
                  duration={500}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ViewPos
                </ScrollLink>
              </li>
              <li>
                <ScrollLink 
                  to="digipos" 
                  spy={true} 
                  smooth={true} 
                  offset={-70} 
                  duration={500}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  DigiPos
                </ScrollLink>
              </li>
              <li>
                <ScrollLink 
                  to="ai-assistant" 
                  spy={true} 
                  smooth={true} 
                  offset={-70} 
                  duration={500}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Asistente IA
                </ScrollLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-slate-400">
                  Av. San Sebastian 2807, Las Condes ,Santiago
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-slate-400">+56 930314810</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-slate-400">info@facturamovil.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {currentYear} Factura Movil. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-slate-500 text-sm hover:text-white transition-colors">
              Política de Privacidad
            </span>
            <span className="text-slate-500 text-sm hover:text-white transition-colors">
              Términos de Servicio
            </span>
            <span className="text-slate-500 text-sm hover:text-white transition-colors">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}