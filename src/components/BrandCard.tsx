import { BrandLogo } from './BrandLogo';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import type { Brand } from '@/data/brands';
export function BrandCard({ brand, index, count = 0 }: { brand: Brand; index: number; count?: number }) {
  return <Link to="/marca/$slug" params={{ slug: brand.slug }} className="brand-card" style={{ animationDelay: `${index * 35}ms` }}>
    <span className="brand-arrow"><ArrowUpRight size={16}/></span>
    <div className="brand-image"><BrandLogo brand={brand} size={100}/></div>
    <strong>{brand.name}</strong><span>{count ? `${count} produtos` : 'Conheça a marca'}</span>
  </Link>;
}
