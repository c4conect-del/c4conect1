import { useState } from 'react';
import type { Brand } from '@/data/brands';
export function BrandLogo({ brand, size = 100 }: { brand: Brand; size?: number }) {
  const [failed, setFailed] = useState('');
  return brand.logo && failed !== brand.logo ? <span className="brand-logo-frame" style={{ width: size, height: size }}><img style={{ transform: `translate(${brand.logoX ?? 0}%, ${brand.logoY ?? 0}%) scale(${brand.logoScale ?? 1})` }} src={brand.logo} alt={brand.name} width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(brand.logo)}/></span> : <span className="brand-monogram" aria-label={brand.name}>{brand.name.slice(0, 2).toUpperCase()}</span>;
}
