import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ibagué decide | Sondeo de Opinión Pública Ciudadana',
  description:
    'Participe en el sondeo ciudadano "Ibagué decide". Su percepción sobre la situación de la ciudad, los principales retos y el panorama político de Ibagué es fundamental.',
  openGraph: {
    title: 'Ibagué decide | Sondeo de Opinión Pública',
    description:
      'Participe en el sondeo ciudadano "Ibagué decide". Su opinión cuenta para conocer la percepción ciudadana sobre el futuro de Ibagué.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ibagué decide | Sondeo de Opinión Pública',
    description:
      'Participe en el sondeo ciudadano "Ibagué decide". Su percepción sobre la situación de la ciudad es fundamental.',
  },
}

export default function EncuestaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
