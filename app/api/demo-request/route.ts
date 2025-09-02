import { NextRequest, NextResponse } from 'next/server'
import { insertContact, ContactForm } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body: Omit<ContactForm, 'id' | 'created_at' | 'status'> = await request.json()
    
    // Validar campos requeridos
    const { name, company, email, phone, interest } = body
    
    if (!name || !company || !email || !phone || !interest) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar formato de teléfono chileno
    const phoneRegex = /^9\d{8}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido. Debe ser 9XXXXXXXX' },
        { status: 400 }
      )
    }

    // Insertar en Supabase
    const { data, error } = await insertContact({
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      interest: interest.trim()
    })

    if (error) {
      console.error('Error inserting contact:', error)
      return NextResponse.json(
        { error: 'Error al guardar la solicitud' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud de demo enviada exitosamente',
      data
    })

  } catch (error) {
    console.error('Error in demo request API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'API de solicitudes de demo' },
    { status: 200 }
  )
}
