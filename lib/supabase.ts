import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vvhgwdkicqjuxacgfxkr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGd3ZGtpY3FqdXhhY2dmeGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NTI3NjIsImV4cCI6MjA3MjQyODc2Mn0.AXJInKws0_PnYl9mM3QjBTL-1wiWZh5nn8nJrE9HjwE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la tabla de contactos
export interface ContactForm {
  id?: string
  name: string
  company: string
  email: string
  phone: string
  interest: string
  created_at?: string
  status?: 'pending' | 'contacted' | 'converted'
}

// Función para insertar un nuevo contacto
export async function insertContact(contact: Omit<ContactForm, 'id' | 'created_at' | 'status'>) {
  try {
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([{
        ...contact,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error inserting contact:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in insertContact:', error)
    return { data: null, error }
  }
}

// Función para obtener todos los contactos (para dashboard)
export async function getContacts() {
  try {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getContacts:', error)
    return { data: null, error }
  }
}