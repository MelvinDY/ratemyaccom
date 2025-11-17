import Hero from '@/components/ui/Hero';
import Features from '@/components/sections/Features';
import AboutUs from '@/components/sections/AboutUs';
import FAQ from '@/components/sections/FAQ';

export default function Home() {
  return (
    <div className="bg-gray-900">
      <Hero />
      <Features />
      <AboutUs />
      <FAQ />
    </div>
  );
}
