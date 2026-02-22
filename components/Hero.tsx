"use client";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const stats = [
    { value: '2M+', label: 'Burmese in Thailand' },
    { value: '500+', label: 'Professional Carers' },
    { value: '50+', label: 'Partners' },
];

export default function Hero() {
    return (
        <div className="relative w-full bg-kera-dark overflow-hidden mt-10">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-kera-dark/90 via-kera-dark/80 to-kera-dark/95 z-0" />

            {/* Content — all in flow, no absolute positioning */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pb-28">

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
                    Be There, <span className="text-kera-vibrant">From Here</span>
                </h1>

                {/* Subheading */}
                <p className="mt-6 max-w-xl md:max-w-2xl text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed font-light">
                    KERA connects migrant workers abroad with trusted carers in Myanmar. Monitor health, get smart reminders, receive regular reports, and chat in Burmese—all from one place.
                </p>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 w-full max-w-xs sm:max-w-none">
                    <Link
                        href="/signup"
                        className="group flex items-center justify-center gap-2 bg-white text-kera-dark px-8 py-4 rounded-full text-base font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/#install"
                        className="group flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full text-base font-bold hover:border-white/80 hover:bg-white/5 transition-all"
                    >
                        Install App
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Stats row — naturally below buttons, never overlapping */}
                <div className="mt-10 flex flex-row items-start justify-center gap-10 sm:gap-16">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{stat.value}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-medium">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
