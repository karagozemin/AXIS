import { Hero } from '@/components/landing';

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Placeholder for future sections */}
      <section className="relative py-32 bg-void">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/30 font-mono text-sm tracking-widest uppercase">
            // More sections coming soon
          </p>
        </div>
      </section>
    </main>
  );
}
