"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { User, Mail, LogOut, Shield } from "lucide-react";
import { useLanguage } from '@/components/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CarerProfilePage() {
    const { data: session, update } = useSession();
    const { t, language, setLanguage } = useLanguage();
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await fetch('/api/profile');
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        enabled: !!session,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
            });
        }
    }, [profile]);

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
                queryClient.invalidateQueries({ queryKey: ['profile'] });
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

    if (loadingProfile && !profile) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#004225] to-[#00BE62] h-32"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="h-24 w-24 bg-white rounded-full p-1 shadow-md">
                            <div className="h-full w-full bg-[#E0F2F1] rounded-full flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-[#004225]" />
                                )}
                            </div>
                        </div>
                        <div className="mb-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#004225]">
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004225] focus:ring-[#004225] sm:text-sm p-2 border" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004225] focus:ring-[#004225] sm:text-sm p-2 border" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profile.language')}</label>
                            <select 
                                name="language" 
                                value={language} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#004225] focus:ring-[#004225] sm:text-sm p-2 border"
                            >
                                <option value="en">English</option>
                                <option value="my">မြန်မာ (Burmese)</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-[#004225] hover:bg-[#003318] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004225] disabled:opacity-50 transition-colors"
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
