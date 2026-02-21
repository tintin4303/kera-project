"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-kera-dark p-1.5 rounded-lg">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-kera-dark tracking-tight">KERA</span>
                        </Link>
                    </div>

                    {/* Right Section - Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="text-sm font-medium text-gray-600 hover:text-kera-dark cursor-pointer transition-colors">
                            English <span className="text-gray-300 mx-2">|</span> <span className="font-burmese">မြန်မာ</span>
                        </div>
                        <Link href="/pricing" className="text-sm font-semibold text-gray-600 hover:text-kera-dark transition-colors">
                            Pricing
                        </Link>
                        <Link href="/#install" className="text-sm font-semibold text-gray-600 hover:text-kera-dark transition-colors">
                            Install App
                        </Link>
                        <Link href="/signin" className="text-sm font-semibold text-kera-dark hover:text-kera-vibrant transition-colors">
                            Sign in
                        </Link>
                        <Link href="/signup" className="bg-kera-vibrant hover:bg-[#00a855] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-kera-dark focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute top-20 left-0 w-full animate-in slide-in-from-top-2">
                    <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-900">Language</span>
                            <div className="text-sm font-medium text-gray-600">
                                English <span className="text-gray-300 mx-2">|</span> <span className="font-burmese">မြန်မာ</span>
                            </div>
                        </div>
                        <Link href="/pricing" className="block text-base font-medium text-gray-700 hover:text-kera-dark hover:bg-gray-50 px-3 py-2 rounded-md">
                            Pricing
                        </Link>
                        <Link href="/#install" className="block text-base font-medium text-gray-700 hover:text-kera-dark hover:bg-gray-50 px-3 py-2 rounded-md">
                            Install App
                        </Link>
                        <Link href="/signin" className="block text-base font-medium text-gray-700 hover:text-kera-dark hover:bg-gray-50 px-3 py-2 rounded-md">
                            Sign in
                        </Link>
                        <Link href="/signup" className="block w-full text-center bg-kera-vibrant text-white px-5 py-3 rounded-xl font-bold hover:bg-[#00a855] transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
