import React from 'react';

type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

const moodConfig: Record<Mood, { icon: string; color: string; bg: string }> = {
    Happy: { icon: '😊', color: 'text-green-600', bg: 'bg-green-100' },
    Neutral: { icon: '😐', color: 'text-gray-600', bg: 'bg-gray-100' },
    Sad: { icon: '😔', color: 'text-blue-600', bg: 'bg-blue-100' },
    Anxious: { icon: '😟', color: 'text-orange-600', bg: 'bg-orange-100' },
};

export default function MoodBadge({ mood }: { mood: Mood }) {
    const config = moodConfig[mood] || moodConfig.Neutral;

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
            <span className="mr-1.5 text-lg" role="img" aria-label={mood}>{config.icon}</span>
            {mood}
        </div>
    );
}
