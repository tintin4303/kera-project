import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AppointmentProps {
    id: string;
    patientName?: string;
    carerName?: string;
    serviceType: string;
    date: string;
    time: string;
    status: string; // From DB: SCHEDULED, PENDING, COMPLETED, CANCELLED
    type?: 'In-Person' | 'Video Call';
    location?: string | null;
}

export default function AppointmentCard({
    appointment,
    isCarer = false,
    onUpdate
}: {
    appointment: AppointmentProps,
    isCarer?: boolean,
    onUpdate?: () => void
}) {
    const [updating, setUpdating] = useState(false);

    // Map DB status to UI display
    const getDisplayStatus = (status: string) => {
        if (status === 'SCHEDULED' || status === 'PENDING') return 'Upcoming';
        if (status === 'COMPLETED') return 'Completed';
        if (status === 'CANCELLED') return 'Cancelled';
        return status;
    };

    const displayStatus = getDisplayStatus(appointment.status);

    const statusColors: Record<string, string> = {
        Upcoming: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-gray-100 text-gray-800',
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: appointment.id, status: newStatus }),
            });
            if (res.ok && onUpdate) {
                onUpdate();
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Update error", error);
        } finally {
            setUpdating(false);
        }
    };

    const displayName = isCarer ? appointment.patientName : appointment.carerName;
    const visitType = appointment.type || 'In-Person';

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold shrink-0 border border-teal-100">
                        {displayName?.charAt(0) || '?'}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{displayName || 'Regular Patient'}</p>
                        <p className="text-xs text-gray-500 font-medium">{appointment.serviceType}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[displayStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {displayStatus}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs text-gray-600 font-medium">
                <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
                    {appointment.date}
                </div>
                <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
                    {appointment.time}
                </div>
                <div className="flex items-center col-span-2">
                    {visitType === 'In-Person' ? (
                        <MapPin className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                        <Video className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    {appointment.location || (appointment.serviceType.includes("Emergency") ? "Clinic Center" : "Home Visit")}
                </div>
            </div>

            {isCarer && displayStatus === 'Upcoming' && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                    <button
                        disabled={updating}
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        className="flex-1 bg-kera-vibrant text-white py-2 text-xs font-bold rounded-lg hover:bg-[#00a855] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Complete
                    </button>
                    <button
                        disabled={updating}
                        onClick={() => handleStatusUpdate('CANCELLED')}
                        className="flex-1 bg-white border border-gray-200 text-red-600 py-2 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
