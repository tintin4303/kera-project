import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react';

type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

const moodConfig: Record<Mood, { icon: React.ElementType; color: string; bg: string }> = {
    Happy: { icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
    Neutral: { icon: Meh, color: 'text-gray-600', bg: 'bg-gray-100' },
    Sad: { icon: Frown, color: 'text-blue-600', bg: 'bg-blue-100' },
    Anxious: { icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
};

export default function MoodBadge({ mood }: { mood: Mood }) {
    const config = moodConfig[mood] || moodConfig.Neutral;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
            <Icon className="mr-1.5 h-4 w-4" aria-label={mood} />
            {mood}
        </div>
    );
}
