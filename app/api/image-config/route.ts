import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'image-config.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ companies: {} }, null, 2), 'utf8');
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDataFile();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'companyId es requerido' }, { status: 400 });
    }
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const db = JSON.parse(raw || '{"companies":{}}');
    const config = db.companies?.[companyId] || null;
    return NextResponse.json({ success: true, companyId, config });
  } catch (err) {
    return NextResponse.json({ error: 'Error leyendo configuración', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataFile();
    const body = await request.json();
    const { companyId, activities, images, lastUpdated } = body || {};
    if (!companyId || !Array.isArray(activities) || !Array.isArray(images)) {
      return NextResponse.json({ error: 'companyId, activities e images son requeridos' }, { status: 400 });
    }
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const db = JSON.parse(raw || '{"companies":{}}');
    if (!db.companies) db.companies = {};
    db.companies[String(companyId)] = {
      companyId,
      activities,
      images,
      lastUpdated: lastUpdated || Date.now()
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
    return NextResponse.json({ success: true, companyId, saved: db.companies[String(companyId)] });
  } catch (err) {
    return NextResponse.json({ error: 'Error guardando configuración', details: String(err) }, { status: 500 });
  }
}
