"use client";
import React, { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';
import { User } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const { t, language, setLanguage } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'language') {
            setLanguage(value as 'en' | 'my');
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                await update({ ...session, user: { ...session?.user, name: updatedUser.name, email: updatedUser.email } });
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        if (typeof window !== "undefined") {
            if ("caches" in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((key) => caches.delete(key)));
            }
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map((registration) => registration.unregister()));
            }
            window.location.href = "/signin";
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('profile.subtitle')}</p>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{t('profile.photo')}</h3>
                            <div className="mt-2 flex space-x-3">
                                <button type="button" className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant">
                                    {t('profile.change')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-6">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('profile.name')}</label>
                                <div className="mt-1">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        id="name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
                                <div className="mt-1">
                                    <input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('profile.language')}</label>
                                <div className="mt-1">
                                    <select 
                                        id="language" 
                                        name="language" 
                                        value={language}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    >
                                        <option value="en">English</option>
                                        <option value="my">မြန်မာ (Burmese)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="sm:col-span-6 text-right">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-kera-vibrant border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-[#00a855] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : t('profile.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{t('profile.signout')}</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>{t('profile.signout_desc')}</p>
                    </div>
                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        >
                            {t('profile.signout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
