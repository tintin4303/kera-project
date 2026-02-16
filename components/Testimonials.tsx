"use client";
import { Star } from 'lucide-react';

interface TestimonialCardProps {
    name: string;
    role: string;
    quote: string;
    rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, quote, rating }) => (
    <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
        <p className="text-gray-700 text-lg mb-6 italic">&quot;{quote}&quot;</p>
        <div>
            <h4 className="font-bold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);

export default function Testimonials() {
    return (
        <section className="py-24 bg-kera-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Trusted by thousands of families and professionals across borders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <TestimonialCard
                        name="Ko Ko Soe"
                        role="Migrant Worker in Bangkok"
                        rating={5}
                        quote="KERA has given me peace of mind. I can finally ensure my parents in Yangon are taking their medicine and eating well, even from far away."
                    />
                    <TestimonialCard
                        name="Dr. Kyaw Myint"
                        role="General Practitioner"
                        rating={5}
                        quote="The platform is intuitive for medical professionals. I can easily track my patients' history and provide timely advice to the carers on the ground."
                    />
                    <TestimonialCard
                        name="Ma Hla Hla"
                        role="Professional Carer"
                        rating={5}
                        quote="Finding work was difficult before KERA. Now I have a steady stream of clients and a professional system to log my visits and get paid securely."
                    />
                </div>
            </div>
        </section>
    );
}
