"use client";
import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
    id: string;
    scheduledAt: string;
    status: string;
    notes?: string | null;
    patient: {
        name: string;
    };
}

interface CalendarViewProps {
    appointments: Appointment[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export default function CalendarView({ appointments, onDateSelect, selectedDate }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Previous Month"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Next Month"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        return (
            <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-lg overflow-hidden">
                {calendarDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    // Count appointments for this day
                    const dayAppointments = appointments.filter(appt =>
                        isSameDay(new Date(appt.scheduledAt), day) && appt.status !== 'CANCELLED'
                    );

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`relative h-14 sm:h-20 border-r border-b border-gray-100 flex flex-col items-center justify-center cursor-pointer transition-all ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                                } ${isSelected ? 'bg-kera-vibrant/5' : ''}`}
                        >
                            <span className={`text-sm font-medium h-8 w-8 flex items-center justify-center rounded-full transition-colors ${isSelected
                                ? 'bg-kera-vibrant text-white'
                                : isToday
                                    ? 'text-kera-vibrant font-bold'
                                    : !isCurrentMonth
                                        ? 'text-gray-300'
                                        : 'text-gray-700'
                                }`}>
                                {format(day, 'd')}
                            </span>

                            {/* Indicators */}
                            <div className="flex gap-0.5 mt-1 h-1.5 items-center justify-center">
                                {dayAppointments.slice(0, 3).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-kera-vibrant'}`}
                                    />
                                ))}
                                {dayAppointments.length > 3 && (
                                    <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-400'}`} />
                                )}
                            </div>

                            {/* Desktop only: show first appointment name */}
                            <div className="hidden sm:block absolute bottom-1 text-[10px] text-gray-500 truncate w-full px-1 text-center font-medium">
                                {dayAppointments.length > 0 && dayAppointments[0].patient.name.split(' ')[0]}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-kera-vibrant" />
                    <span>Scheduled Visit</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-kera-vibrant ring-2 ring-kera-vibrant/20 ring-offset-1" />
                    <span>Selected Date</span>
                </div>
            </div>
        </div>
    );
}
