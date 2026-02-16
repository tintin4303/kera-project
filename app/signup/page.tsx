"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignUp() {
    const router = useRouter();
    const [role, setRole] = useState<'MIGRANT' | 'CARER'>('MIGRANT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            // Register user
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Something went wrong');
            }

            // Sign in immediately
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Account created but failed to sign in automatically.');
            } else {
                router.push(role === 'CARER' ? '/carer' : '/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            console.error('Registration error:', err);
            if (err instanceof Error) {
                setError(err.message || 'Something went wrong');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-outfit">
            <Navbar />

            <main className="grow flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

                    {/* Header */}
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Join thousands of families connecting through KERA
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('MIGRANT')}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'MIGRANT'
                                ? 'border-kera-vibrant bg-kera-vibrant/5 ring-1 ring-kera-vibrant'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="mx-auto w-10 h-10 mb-2 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                                🌏
                            </div>
                            <div className={`text-sm font-bold ${role === 'MIGRANT' ? 'text-kera-vibrant' : 'text-gray-900'}`}>
                                Migrant Worker
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole('CARER')}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'CARER'
                                ? 'border-kera-vibrant bg-kera-vibrant/5 ring-1 ring-kera-vibrant'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="mx-auto w-10 h-10 mb-2 bg-green-100 rounded-full flex items-center justify-center text-xl">
                                🩺
                            </div>
                            <div className={`text-sm font-bold ${role === 'CARER' ? 'text-kera-vibrant' : 'text-gray-900'}`}>
                                Professional Carer
                            </div>
                        </button>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        disabled={isLoading}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:border-transparent transition-all sm:text-sm disabled:opacity-50"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        disabled={isLoading}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:border-transparent transition-all sm:text-sm disabled:opacity-50"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        disabled={isLoading}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:border-transparent transition-all sm:text-sm disabled:opacity-50"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-kera-vibrant focus:ring-kera-vibrant border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I agree to the <a href="#" className="font-medium text-kera-vibrant hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-kera-vibrant hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-kera-vibrant hover:bg-[#00a855] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-1 gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </form>

                    {/* Footer Link */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/signin" className="font-semibold text-kera-vibrant hover:text-kera-dark transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
