"use client";
import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function CarerSchedulePage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.schedule')}</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">{t('schedule.empty')}</p>
            </div>
        </div>
    );
}
