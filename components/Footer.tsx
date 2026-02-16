"use client";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 text-center md:text-left">
                <div className="flex items-center gap-2">
                    <div className="bg-kera-dark p-1.5 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900">KERA</span>
                </div>

                <div className="text-sm text-gray-500 order-last md:order-0">
                    © 2025 Kera. All rights reserved.
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <a href="#" className="text-gray-400 hover:text-gray-600 hover:underline">Privacy Policy</a>
                    <a href="#" className="text-gray-400 hover:text-gray-600 hover:underline">Terms of Service</a>
                    <a href="#" className="text-gray-400 hover:text-gray-600 hover:underline">Contact</a>
                </div>
            </div>
        </footer>
    );
}
