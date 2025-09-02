"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Check, Loader2, X, User, Building2, Mail, Phone, MessageSquare } from "lucide-react";

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
}

interface ContactFormProps {
  onClose: () => void;
}

export function ContactForm({ onClose }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    interest: ""
  });
  
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.company.trim()) {
      newErrors.company = "La empresa es requerida";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^9\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Formato: 9XXXXXXXX (9 dígitos)";
    }

    if (!formData.interest.trim()) {
      newErrors.interest = "El interés es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar la solicitud');
      }

      // Éxito
      setShowSuccess(true);
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        onClose();
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          interest: ""
        });
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ 
        interest: error instanceof Error ? error.message : 'Error al enviar la solicitud' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center"
      >
        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          ¡Solicitud Enviada!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Gracias por tu interés. Nuestro equipo te contactará pronto para agendar una demostración personalizada.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Nombre: {formData.name}</p>
          <p>Empresa: {formData.company}</p>
          <p>Contacto: {formData.email} / +56 {formData.phone}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Solicitar Demo
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Completa el formulario y nuestro equipo te contactará para agendar una demostración personalizada de FacturaMovil DigiPos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Nombre completo *
          </label>
          <Input
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Building2 className="inline h-4 w-4 mr-2" />
            Empresa *
          </label>
          <Input
            type="text"
            placeholder="Nombre de tu empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={errors.company ? 'border-red-500' : ''}
          />
          {errors.company && (
            <p className="text-sm text-red-500 mt-1">{errors.company}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail className="inline h-4 w-4 mr-2" />
            Email *
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="inline h-4 w-4 mr-2" />
            Teléfono *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
              +56
            </span>
            <Input
              type="tel"
              maxLength={9}
              placeholder="912345678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
              className={`rounded-l-none ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formato: 9XXXXXXXX (9 dígitos)
          </p>
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Interés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MessageSquare className="inline h-4 w-4 mr-2" />
            ¿En qué estás interesado? *
          </label>
          <Input
            type="text"
            placeholder="Ej: Sistema POS, Facturación electrónica, etc."
            value={formData.interest}
            onChange={(e) => handleInputChange('interest', e.target.value)}
            className={errors.interest ? 'border-red-500' : ''}
          />
          {errors.interest && (
            <p className="text-sm text-red-500 mt-1">{errors.interest}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Solicitar Demo'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
