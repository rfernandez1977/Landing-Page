import { DigiPosPageSection } from '@/components/sections/digipos-page-section';

export const metadata = {
  title: 'DigiPos | Sistema POS Digital - Factura Movil',
  description: 'Solución POS digital tradicional con interfaz moderna e intuitiva para administrar ventas, inventario y reportes desde cualquier dispositivo.',
};

export default function DigiPosPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <DigiPosPageSection />
    </main>
  );
}
