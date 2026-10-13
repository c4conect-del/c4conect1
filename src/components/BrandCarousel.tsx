import logo01 from "@/assets/carousel-01.png";
import logo02 from "@/assets/carousel-02.png";
import logo03 from "@/assets/carousel-03.png";
import logo04 from "@/assets/carousel-04.png";
import logo05 from "@/assets/carousel-05.png";
import logo06 from "@/assets/carousel-06.png";
import logo07 from "@/assets/carousel-07.png";

const logos = [
  { src: logo01, alt: "Canada Labs" },
  { src: logo02, alt: "Pharmacom Labs" },
  { src: logo03, alt: "Alpha Pharma" },
  { src: logo04, alt: "Gold Premium Series" },
  { src: logo05, alt: "ZPHC" },
  { src: logo06, alt: "Landerlan" },
  { src: logo07, alt: "Cooper Pharma" },
];

export function BrandCarousel() {
  // duplicate for seamless infinite loop
  const items = [...logos, ...logos];

  return (
    <div className="w-full overflow-hidden mask-fade">
      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
        Marcas parceiras
      </p>
      <div className="relative">
        <div className="flex gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
          {items.map((logo, i) => (
            <div
              key={i}
              className="flex h-20 w-32 shrink-0 items-center justify-center sm:h-24 sm:w-40"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-full max-w-full object-contain opacity-90"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
