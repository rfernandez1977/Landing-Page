import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const token = searchParams.get('token');
  const search = searchParams.get('search');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  try {
    const baseUrl = 'http://produccion.facturamovil.cl';
    let url = `${baseUrl}${endpoint}`;
    
    // Agregar término de búsqueda al final del path si está presente
    if (search) {
      url += `/${encodeURIComponent(search)}`;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Agregar token si está presente
    if (token) {
      headers['FACMOV_T'] = token;
    }

    console.log('🔄 Proxy request:', { url, headers });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    console.log('✅ Proxy response:', { status: response.status, data });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from external API' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const token = searchParams.get('token');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  try {
    const baseUrl = 'http://produccion.facturamovil.cl';
    const url = `${baseUrl}${endpoint}`;
    const body = await request.json();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Agregar token si está presente
    if (token) {
      headers['FACMOV_T'] = token;
    }

    console.log('🔄 Proxy POST request:', { url, headers, body });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('✅ Proxy POST response:', { status: response.status, data });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to post data to external API' }, 
      { status: 500 }
    );
  }
}
