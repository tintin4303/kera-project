"use client";

import React, { createContext, useContext, useState } from 'react';

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
        "nav.schedule": "Schedules",
        "nav.profile": "Profile",
        "nav.overview": "Family",
        "nav.appointments": "Appointments",
        "nav.reports": "Reports",
        "nav.services": "Services",
        "nav.view_profile": "View profile",
        "nav.sign_out": "Sign Out",
        "chat.search": "Search connections...",
        "chat.no_connections_title": "No care connections yet",
        "chat.no_connections_desc": "Once a carer is assigned to your family member, they will appear here and you can start chatting with them.",
        "chat.select_prompt": "Select a care connection to start chatting",
        "chat.online": "Online",
        "chat.type_message": "Type your message...",
        "chat.video": "Video",
        "schedule.empty": "No scheduled appointments yet.",
        "common.loading": "Loading...",
        "common.error": "An error occurred",
        "carer.specialty": "Specialty",
        "carer.experience": "Years of Experience",
        "carer.verified": "Verified Carer",
        "carer.pending": "Verification Pending",
        "carer.title": "Professional Carer",
        "carer_dashboard.patients": "Patients",
        "carer_dashboard.records": "Records",
        "carer_dashboard.visits": "Visits",
        "carer_dashboard.my_patients": "My Patients",
        "carer_dashboard.view_all": "View All",
        "carer_dashboard.no_patients": "No patients assigned",
        "carer_dashboard.contact_admin": "Contact your administrator to get assigned to patients.",
        "carer_dashboard.location": "Location",
        "carer_dashboard.quick_actions": "Quick Actions",
        "carer_dashboard.log_vitals": "Log Vitals",
        "carer_dashboard.schedule": "Schedule",
        "carer_patients.search_placeholder": "Search patients...",
        "carer_patients.no_patients": "No patients assigned",
        "carer_patients.contact_admin": "Contact your administrator to get assigned to patients.",
        "carer_patients.no_matching": "No matching patients found",
        "carer_patients.records_meds": "Records & Meds",
        "carer_patients.medications": "Meds",
        "carer_patient_detail.back": "Back to Patients",
        "carer_patient_detail.log_vitals": "Log Vitals",
        "carer_patient_detail.blood_pressure": "Blood Pressure",
        "carer_patient_detail.no_data": "No data",
        "carer_patient_detail.blood_glucose": "Blood Glucose",
        "carer_patient_detail.mg_dl": "mg/dL",
        "carer_patient_detail.active_medications": "Active Medications",
        "carer_patient_detail.prescriptions": "Prescriptions",
        "carer_patient_detail.recent_records": "Recent Health Records",
        "carer_patient_detail.no_records": "No records yet",
        "carer_patient_detail.log_vitals_info": "Start logging vitals to track this patient's health.",
        "carer_patient_detail.bp": "BP",
        "carer_patient_detail.glucose": "Glucose",
        "carer_patient_detail.temp": "Temp",
        "carer_patient_detail.add_medication": "Add Medication",
        "carer_patient_detail.no_active_medications": "No active medications",
        "carer_patient_detail.reports": "Reports",
        "carer_patient_detail.create_report": "Create Report",
        "carer_patient_detail.period": "Period:",
        "carer_patient_detail.no_reports": "No reports created yet",
        "carer_patient_detail.patient_not_found": "Patient not found",
        "carer_schedule.upcoming": "Upcoming",
        "carer_schedule.calendar": "Calendar",
        "carer_schedule.history": "History",
        "carer_schedule.visits_on": "Visits on",
        "carer_schedule.visit": "Visit",
        "carer_schedule.visits": "Visits",
        "carer_schedule.no_visits": "No visits scheduled for this date.",
        "carer_schedule.no_upcoming": "No upcoming schedules",
        "carer_schedule.add_visit_desc": "Start by adding a new visit or regular checkup.",
        "carer_schedule.add_first": "Add first schedule",
        "carer_schedule.patient": "Patient",
        "carer_schedule.date": "Date",
        "carer_schedule.time": "Time",
        "carer_schedule.service": "Service",
        "carer_schedule.status": "Status",
        "carer_schedule.location": "Location",
        "carer_schedule.completed": "Completed",
        "carer_schedule.cancelled": "Cancelled",
        "carer_schedule.home_visit": "Home Visit",
        "carer_schedule.home": "Home",
        "carer_schedule.no_history": "No history",
        "carer_schedule.history_desc": "Completed or cancelled schedules will appear here.",
        "carer_schedule.add_schedule": "Add Schedule",
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
        "nav.overview": "မိသားစု",
        "nav.appointments": "ချိန်းဆိုမှုများ",
        "nav.reports": "အစီရင်ခံစာများ",
        "nav.services": "ဝန်ဆောင်မှုများ",
        "nav.view_profile": "ပရိုဖိုင်ကြည့်ရန်",
        "nav.sign_out": "ထွက်မည်",
        "chat.search": "ဆက်သွယ်သူများကို ရှာဖွေပါ...",
        "chat.no_connections_title": "ဆက်သွယ်ရန် မရှိသေးပါ",
        "chat.no_connections_desc": "မိသားစုဝင်နှင့် ဆက်စပ်ထားသော ပြုစုစောင့်ရှောက်သူ ရရှိသည်နှင့် အတူရှေ့တွင် ပေါ်လာပြီး စကားပြောနိုင်ပါသည်။",
        "chat.select_prompt": "စကားစတင်ရန် ဆက်သွယ်သူကို ရွေးပါ",
        "chat.online": "အွန်လိုင်း",
        "chat.type_message": "စာကို ရိုက်ထည့်ပါ...",
        "chat.video": "ဗီဒီယို",
        "schedule.empty": "ချိန်းဆိုထားသော အချိန်ဇယားများ မရှိသေးပါ။",
        "common.loading": "ခေတ္တစောင့်ပါ...",
        "common.error": "အမှားအယွင်းဖြစ်ပေါ်နေသည်",
        "carer.specialty": "ကျွမ်းကျင်မှု",
        "carer.experience": "လုပ်သက်အတွေ့အကြုံ (နှစ်)",
        "carer.verified": "အတည်ပြုပြီးသော ပြုစုစောင့်ရှောက်သူ",
        "carer.pending": "အတည်ပြုချက် စောင့်ဆိုင်းနေသည်",
        "carer.title": "ကျွမ်းကျင် ပြုစုစောင့်ရှောက်သူ",
        "carer_dashboard.patients": "လူနာများ",
        "carer_dashboard.records": "Record များ",
        "carer_dashboard.visits": "ရောက်ရှိမှုများ",
        "carer_dashboard.my_patients": "ကျွန်ုပ်၏ လူနာများ",
        "carer_dashboard.view_all": "အားလုံး ကြည့်ရန်",
        "carer_dashboard.no_patients": "ခွဲခြားသတ်မှတ်ထားသော လူနာ မရှိသေးပါ",
        "carer_dashboard.contact_admin": "လူနာများ ခွဲခြားသတ်မှတ်ရန် ကျွန်ုပ်၏ အုပ်ချုပ်ရန်သူထံ ဆက်သွယ်ပါ။",
        "carer_dashboard.location": "တည်ရှိရာ",
        "carer_dashboard.quick_actions": "လျင်မြန်သောလုပ်ဆောင်ချက်များ",
        "carer_dashboard.log_vitals": "အတက်အကျ မှတ်သားမည်",
        "carer_dashboard.schedule": "အချိန်ဇယား",
        "carer_patients.search_placeholder": "လူနာများကို ရှာဖွေပါ...",
        "carer_patients.no_patients": "ခွဲခြားသတ်မှတ်ထားသော လူနာ မရှိသေးပါ",
        "carer_patients.contact_admin": "လူနာများ ခွဲခြားသတ်မှတ်ရန် ကျွန်ုပ်၏ အုပ်ချုပ်ရန်သူထံ ဆက်သွယ်ပါ။",
        "carer_patients.no_matching": "ကိုက်ညီသော လူနာများ မတွေ့ရှိပါ",
        "carer_patients.records_meds": "အစမ်းများ & ဆေးများ",
        "carer_patients.medications": "ဆေးများ",
        "carer_patient_detail.back": "ပြန်သွားပါ",
        "carer_patient_detail.log_vitals": "Vitals မှတ်သားပါ",
        "carer_patient_detail.blood_pressure": "သွေးဖိအား",
        "carer_patient_detail.no_data": "အချက်အလက် မရှိပါ",
        "carer_patient_detail.blood_glucose": "သွေးသွင်းသကြား",
        "carer_patient_detail.mg_dl": "mg/dL",
        "carer_patient_detail.active_medications": "လုပ်ဆောင်နေသော ဆေးများ",
        "carer_patient_detail.prescriptions": "ဆေးချက်များ",
        "carer_patient_detail.recent_records": "Records များ",
        "carer_patient_detail.no_records": "အစမ်းများ အသုံးမပြုသေးပါ",
        "carer_patient_detail.log_vitals_info": "ဤလူနာ၏ Vitals မှတ်သားမှုများ စတင်ပါ။",
        "carer_patient_detail.bp": "သွေးဖိအား",
        "carer_patient_detail.glucose": "သွေးသွင်းသကြား",
        "carer_patient_detail.temp": "အပူချိန်",
        "carer_patient_detail.add_medication": "ဆေး ထည့်သွင်းပါ",
        "carer_patient_detail.no_active_medications": "လုပ်ဆောင်နေသော ဆေး မရှိပါ",
        "carer_patient_detail.reports": "အစီရင်ခံစာများ",
        "carer_patient_detail.create_report": "အစီရင်ခံစာ ဖန်တီးပါ",
        "carer_patient_detail.period": "ကာလ:",
        "carer_patient_detail.no_reports": "အစီရင်ခံစာများ မရှိသေးပါ",
        "carer_patient_detail.patient_not_found": "လူနာ မတွေ့ရှိပါ",
        "carer_schedule.upcoming": "နောင်လာမည့်",
        "carer_schedule.calendar": "ပြက္ခဒိန်",
        "carer_schedule.history": "ပြီးမြောက်ပြီး",
        "carer_schedule.visits_on": "ရောက်ရှိမှုများ",
        "carer_schedule.visit": "ရောက်ရှိမှု",
        "carer_schedule.visits": "ရောက်ရှိမှုများ",
        "carer_schedule.no_visits": "ဤရက်တွင် ချိန်းဆိုထားသော ရောက်ရှိမှုများ မရှိပါ။",
        "carer_schedule.no_upcoming": "နောင်လာမည့် အချိန်ဇယားများ မရှိပါ",
        "carer_schedule.add_visit_desc": "ရောက်ရှိမှု သို့မဟုတ် ပုံမှန် စစ်ဆေးမှု ထည့်သွင်းခြင်းဖြင့် စတင်ပါ။",
        "carer_schedule.add_first": "ပထမဆုံး အချိန်ဇယား ထည့်သွင်းမည်",
        "carer_schedule.patient": "လူနာ",
        "carer_schedule.date": "ရက်စွဲ",
        "carer_schedule.time": "အချိန်",
        "carer_schedule.service": "ဝန်ဆောင်မှု",
        "carer_schedule.status": "အခြေအနေ",
        "carer_schedule.location": "တည်ရှိရာ",
        "carer_schedule.completed": "ပြီးမြောက်ခဲ့သည်",
        "carer_schedule.cancelled": "ပယ်ဖျက်ခဲ့သည်",
        "carer_schedule.home_visit": "အိမ်သို့ ရောက်ရှိမှု",
        "carer_schedule.home": "အိမ်",
        "carer_schedule.no_history": "သမိုင်းအတြတ် မရှိပါ",
        "carer_schedule.history_desc": "ပြီးမြောက်ခဲ့သော သို့မဟုတ် ပယ်ဖျက်ခဲ့သော အချိန်ဇယားများ ဤနေရာတွင် ပေါ်လာပါလိမ့်မည်။",
        "carer_schedule.add_schedule": "အချိန်ဇယား ထည့်သွင်းမည်",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kera-language') as Language | null;
            return saved ?? 'en';
        }
        return 'en';
    });

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
