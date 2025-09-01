"use client";

import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, User, LogOut } from "lucide-react";
import { LoginModal } from "@/components/ui/login-modal";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Inicio", href: "hero" },
  { title: "VozPos", href: "vozpos" },
  { title: "ViewPos", href: "viewpos" },
  { title: "DigiPos", href: "digipos" },
  { title: "Asistente IA", href: "ai-assistant" },
  { title: "Testimonios", href: "testimonials" },
  { title: "Precios", href: "pricing" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            {/* Logo removed as requested */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <ScrollLink
                key={item.href}
                to={item.href}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className={cn(
                  "text-sm font-medium cursor-pointer transition-colors",
                  isScrolled
                    ? "text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                    : "text-gray-100 hover:text-white dark:text-gray-300 dark:hover:text-white"
                )}
              >
                {item.title}
              </ScrollLink>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <User size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {user?.name || 'Usuario'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} className="mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className={cn(
                  "ml-4 transition-all",
                  isScrolled
                    ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    : "border-white text-white hover:bg-white hover:text-blue-600"
                )}
              >
                Ingresar
              </Button>
            )}

            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>

          {/* Mobile Navigation Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <ScrollLink
                key={item.href}
                to={item.href}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800"
              >
                {item.title}
              </ScrollLink>
            ))}
            <div className="px-3 py-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {user?.name || 'Usuario'}
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={logout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Salir
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => setShowLoginModal(true)}
                >
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
}