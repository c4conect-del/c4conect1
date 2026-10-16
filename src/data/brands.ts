export interface Brand { slug: string; name: string; logo: string; logoScale?: number; logoX?: number; logoY?: number }

import logo01 from "@/assets/logo-01.png";
import logo02 from "@/assets/logo-02.png";
import logo03 from "@/assets/logo-03.png";
import logo04 from "@/assets/logo-04.png";
import logo05 from "@/assets/logo-05.png";
import logo06 from "@/assets/logo-06.png";
import logo07 from "@/assets/logo-07.png";

export type CatalogBrand = { id: string; slug: string; name: string; logoUrl: string; logoKey: string; active: boolean; logoScale: number; logoX: number; logoY: number };
const logos: Record<string, string> = { 'gold-premium': logo04, landerlan: logo05, zphc: logo06, 'cooper-pharma': logo07, 'canada-labs': logo01, 'alpha-pharma': logo03, pharmacom: logo02 };
export function brandView(brand: CatalogBrand): Brand { return { ...brand, logo: brand.logoUrl ? (/^\/api\/logos\/[a-f0-9-]{36}$/.test(brand.logoUrl) ? `${brand.logoUrl}/preview` : brand.logoUrl) : logos[brand.logoKey] || '' }; }
