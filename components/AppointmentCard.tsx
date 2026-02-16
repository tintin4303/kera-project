import React from 'react';
import { Calendar, Clock, MapPin, User, Video } from 'lucide-react';

interface AppointmentProps {
    id: number;
    carerName: string;
    serviceType: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    type: 'In-Person' | 'Video Call';
}

export default function AppointmentCard({ appointment }: { appointment: AppointmentProps }) {
    const statusColors = {
        Upcoming: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold shrink-0">
                        {appointment.carerName.charAt(0)}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{appointment.carerName}</p>
                        <p className="text-xs text-gray-500">{appointment.serviceType}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                    {appointment.status}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4 text-gray-400 shrink-0" />
                    {appointment.date}
                </div>
                <div className="flex items-center">
                    <Clock className="mr-1.5 h-4 w-4 text-gray-400 shrink-0" />
                    {appointment.time}
                </div>
                <div className="flex items-center col-span-2">
                    {appointment.type === 'In-Person' ? (
                        <MapPin className="mr-1.5 h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                        <Video className="mr-1.5 h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    Home Visit (Yangon)
                </div>
            </div>

            {appointment.status === 'Upcoming' && (
                <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 text-xs font-medium rounded hover:bg-gray-50">
                        Reschedule
                    </button>
                    <button className="flex-1 bg-white border border-gray-300 text-red-600 py-1.5 text-xs font-medium rounded hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
