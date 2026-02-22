"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import StepsSection from '../../components/StepsSection';
import Testimonials from '../../components/Testimonials';
import Footer from '../../components/Footer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installReady, setInstallReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallReady(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallReady(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallReady(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <Hero />
      <StepsSection />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-kera-dark mb-4">
                Transparent pricing for families abroad
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                The core plan includes health monitoring, smart medication reminders, regular checkups, health reports, Burmese language UI, and secure chat with the patient&apos;s carer.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-2xl bg-kera-dark text-white px-6 py-4 shadow-lg">
                  <div className="text-sm uppercase tracking-wide text-white/70">Core Plan</div>
                  <div className="text-3xl font-bold">990 THB</div>
                </div>
                <div className="rounded-2xl bg-kera-light text-kera-dark px-6 py-4 shadow-lg">
                  <div className="text-sm uppercase tracking-wide text-kera-dark/70">Add-ons</div>
                  <div className="text-3xl font-bold">+250 THB each</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Add-on services</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center justify-between">
                  <span>Transportation for appointments</span>
                  <span className="font-semibold text-kera-dark">+250 THB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Video consults with partnered doctors</span>
                  <span className="font-semibold text-kera-dark">+250 THB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Regular medicine refills</span>
                  <span className="font-semibold text-kera-dark">+250 THB</span>
                </li>
              </ul>
              <div className="mt-6">
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-kera-vibrant text-white px-6 py-3 font-semibold hover:bg-[#00a855] transition-colors"
                >
                  View pricing details
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="install" className="py-20 bg-kera-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Install KERA as a PWA on any device
              </h2>
              <p className="text-lg text-white/80 mb-6">
                Use the app like a native experience on iOS, Android, or desktop. Access the migrant worker or carer portal based on your login role.
              </p>
              <button
                onClick={handleInstallClick}
                disabled={!installReady}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold transition-colors ${installReady ? "bg-white text-kera-dark hover:bg-gray-100" : "bg-white/40 text-white/80 cursor-not-allowed"}`}
              >
                {isInstalled ? "App installed" : "Install App"}
              </button>
              <div className="mt-4 text-sm text-white/70">
                If the install button is unavailable, open your browser menu and select “Add to Home Screen”.
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Quick install steps</h3>
              <ul className="space-y-4 text-white/80">
                <li>iOS Safari: Share → Add to Home Screen</li>
                <li>Android Chrome: Menu → Install app</li>
                <li>Desktop Chrome/Edge: Install icon in the address bar</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      <Footer />
    </main>
  );
}
