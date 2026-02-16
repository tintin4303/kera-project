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
                    <h2 className="text-4xl font-bold text-kera-dark mb-4">Become a part of KERA</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Whether you are a migrant worker, a professional carer, or a partner organization, join our ecosystem today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Migrants */}
                    <StepCard
                        title="For Burmese Migrants in Thailand"
                        icon={User}
                        colorClass="bg-kera-vibrant"
                        steps={[
                            "Sign Up & Create Profile",
                            "Add Family Members",
                            "Choose Care Plan",
                            "Monitor Health Remotely"
                        ]}
                    />

                    {/* Carers */}
                    <StepCard
                        title="For Professional Carers in Myanmar"
                        icon={Stethoscope}
                        colorClass="bg-blue-500" // Differentiating color
                        steps={[
                            "Register & Verify Credentials",
                            "Get Assigned to Families",
                            "Monitor & Record Vitals",
                            "Earn Income & Reviews"
                        ]}
                    />

                    {/* Partners */}
                    <StepCard
                        title="For Company Partnerships in Thailand"
                        icon={Building2}
                        colorClass="bg-purple-500" // Differentiating color
                        steps={[
                            "Contact Us for Partnership",
                            "Enroll Migrant Workers",
                            "Manage Welfare Program",
                            "Improve Employee Retention"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
