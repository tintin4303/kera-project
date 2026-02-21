"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { User, Mail, LogOut, Shield } from "lucide-react";
import { useLanguage } from '@/components/LanguageContext';

export default function CarerProfilePage() {
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
                alert(language === 'en' ? 'Profile updated successfully!' : 'ပရိုဖိုင် အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ!');
            } else {
                alert(language === 'en' ? 'Failed to update profile.' : 'ပရိုဖိုင် ပြင်ဆင်မရနိုင်ပါ။');
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert(language === 'en' ? 'An error occurred.' : 'အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။');
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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-linear-to-r from-purple-500 to-indigo-600 h-32"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="h-24 w-24 bg-white rounded-full p-1 shadow-md">
                            <div className="h-full w-full bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-purple-600" />
                                )}
                            </div>
                        </div>
                        <div className="mb-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('carer.title')}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile.name')}</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile.language')}</label>
                            <select 
                                name="language" 
                                value={language} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                            >
                                <option value="en">English</option>
                                <option value="my">မြန်မာ (Burmese)</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {saving ? t('common.loading') : t('profile.save')}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-gray-100 pt-6">
                        <button
                            onClick={handleSignOut}
                            type="button"
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            {t('profile.signout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
