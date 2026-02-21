"use client";
import { User, Stethoscope, Building2, LucideIcon } from 'lucide-react';

interface StepCardProps {
    title: string;
    icon: LucideIcon;
    steps: string[];
    colorClass: string;
}

const StepCard: React.FC<StepCardProps> = ({ title, icon: Icon, steps, colorClass }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-xl transition-shadow">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${colorClass} bg-opacity-10`}>
            <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
        <ul className="space-y-4 grow">
            {steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${colorClass.replace('bg-opacity-10', '')}`}>
                        {index + 1}
                    </span>
                    <span className="text-gray-600 font-medium pt-1">{step}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function StepsSection() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-kera-dark mb-4">Built for families, carers, and admins</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        A single platform that connects families abroad to carers in Myanmar with clear roles and trusted workflows.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Migrants */}
                    <StepCard
                        title="For Families Abroad"
                        icon={User}
                        colorClass="bg-kera-vibrant"
                        steps={[
                            "Create patient profiles in Myanmar",
                            "Monitor health vitals and trends",
                            "Set smart medication and checkup reminders",
                            "Receive regular health reports",
                            "Chat with carers in Burmese UI"
                        ]}
                    />

                    {/* Carers */}
                    <StepCard
                        title="For Professional Carers"
                        icon={Stethoscope}
                        colorClass="bg-blue-500"
                        steps={[
                            "Verify credentials and get assigned",
                            "Record vitals and care notes",
                            "Manage medication and checkups",
                            "Submit health reports to families",
                            "Chat with families and admins"
                        ]}
                    />

                    {/* Partners */}
                    <StepCard
                        title="For Admins"
                        icon={Building2}
                        colorClass="bg-purple-500"
                        steps={[
                            "Verify carers and family accounts",
                            "Match patients with trusted carers",
                            "Manage add-on services and scheduling",
                            "Monitor quality and compliance"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
