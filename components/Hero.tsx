"use client";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-kera-dark">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
            >
            </div>
            <div className="absolute inset-0 bg-linear-to-b from-kera-dark/90 via-kera-dark/80 to-kera-dark/95 z-0"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                    Be There, <span className="text-kera-vibrant">From Here</span>
                </h1>

                <p className="mt-4 max-w-xl md:max-w-2xl mx-auto text-lg md:text-xl text-gray-200 leading-relaxed font-light">
                    KERA is a proxy platform that connects migrant workers abroad with trusted carers in Myanmar. Monitor health, get smart reminders, receive regular reports, and chat in Burmese—all from one place.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/signup"
                        className="group flex items-center justify-center gap-2 bg-white text-kera-dark px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/#install"
                        className="group flex items-center justify-center gap-2 border border-white/50 text-white px-8 py-4 rounded-full text-lg font-bold hover:border-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Install App
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Stats Band */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10 w-full">
                        <div className="flex-1 flex flex-col items-center pt-4 md:pt-0 w-full">
                            <span className="text-3xl font-bold text-white mb-1">2 Million+</span>
                            <span className="text-xs md:text-sm text-gray-300 uppercase tracking-wider font-semibold">Burmese in Thailand</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center pt-4 md:pt-0 w-full">
                            <span className="text-3xl font-bold text-white mb-1">500+</span>
                            <span className="text-xs md:text-sm text-gray-300 uppercase tracking-wider font-semibold">Professional Carers</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center pt-4 md:pt-0 pb-4 md:pb-0 w-full">
                            <span className="text-3xl font-bold text-white mb-1">50+</span>
                            <span className="text-xs md:text-sm text-gray-300 uppercase tracking-wider font-semibold">Partners</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
