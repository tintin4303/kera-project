"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'my';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        "profile.title": "Profile Settings",
        "profile.subtitle": "Manage your account information and preferences.",
        "profile.photo": "Your Photo",
        "profile.change": "Change",
        "profile.delete": "Delete",
        "profile.name": "Full Name",
        "profile.email": "Email Address",
        "profile.language": "Language",
        "profile.save": "Save Details",
        "profile.signout": "Sign Out",
        "profile.signout_desc": "Sign out of your account on this device.",
        "profile.role": "Role",
        "profile.joined": "Joined",
        "nav.dashboard": "Dashboard",
        "nav.patients": "Patients",
        "nav.chat": "Chat",
        "nav.schedule": "Schedule",
        "nav.profile": "Profile",
        "nav.overview": "Overview",
        "nav.appointments": "Appointments",
        "nav.reports": "Reports",
        "nav.services": "Services",
        "nav.view_profile": "View profile",
        "schedule.empty": "No scheduled appointments yet.",
        "common.loading": "Loading...",
        "common.error": "An error occurred",
        "carer.specialty": "Specialty",
        "carer.experience": "Years of Experience",
        "carer.verified": "Verified Carer",
        "carer.pending": "Verification Pending",
        "carer.title": "Professional Carer",
    },
    my: {
        "profile.title": "ပရိုဖိုင် ဆက်တင်များ",
        "profile.subtitle": "သင့်အကောင့်အချက်အလက်များကို စီမံခန့်ခွဲပါ။",
        "profile.photo": "သင့်ဓာတ်ပုံ",
        "profile.change": "ပြောင်းလဲမည်",
        "profile.delete": "ဖျက်မည်",
        "profile.name": "အမည်အပြည့်အစုံ",
        "profile.email": "အီးမေးလ်",
        "profile.language": "ဘာသာစကား",
        "profile.save": "သိမ်းဆည်းမည်",
        "profile.signout": "ထွက်မည်",
        "profile.signout_desc": "ဤစက်မှ အကောင့်ထွက်ပါ။",
        "profile.role": "အခန်းကဏ္ဍ",
        "profile.joined": "စတင်ဝင်ရောက်သည့်ရက်",
        "nav.dashboard": "ပင်မစာမျက်နှာ",
        "nav.patients": "လူနာများ",
        "nav.chat": "စကားပြောရန်",
        "nav.schedule": "အချိန်ဇယား",
        "nav.profile": "ပရိုဖိုင်",
        "nav.overview": "ခြုံငုံသုံးသပ်ချက်",
        "nav.appointments": "ချိန်းဆိုမှုများ",
        "nav.reports": "အစီရင်ခံစာများ",
        "nav.services": "ဝန်ဆောင်မှုများ",
        "nav.view_profile": "ပရိုဖိုင်ကြည့်ရန်",
        "schedule.empty": "ချိန်းဆိုထားသော အချိန်ဇယားများ မရှိသေးပါ။",
        "common.loading": "ခေတ္တစောင့်ပါ...",
        "common.error": "အမှားအယွင်းဖြစ်ပေါ်နေသည်",
        "carer.specialty": "ကျွမ်းကျင်မှု",
        "carer.experience": "လုပ်သက်အတွေ့အကြုံ (နှစ်)",
        "carer.verified": "အတည်ပြုပြီးသော ပြုစုစောင့်ရှောက်သူ",
        "carer.pending": "အတည်ပြုချက် စောင့်ဆိုင်းနေသည်",
        "carer.title": "ကျွမ်းကျင် ပြုစုစောင့်ရှောက်သူ",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('kera-language') as Language;
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('kera-language', lang);
    };

    const t = (key: string): string => {
        return (translations[language] as Record<string, string>)[key] ?? key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
