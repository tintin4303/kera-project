"use client";
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import StepsSection from '../../components/StepsSection';
import Testimonials from '../../components/Testimonials';
import Footer from '../../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <Hero />
      <StepsSection />
      <Testimonials />
      <Footer />
    </main>
  );
}
