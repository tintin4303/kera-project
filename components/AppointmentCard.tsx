import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AppointmentProps {
    id: string;
    patientName?: string;
    carerName?: string;
    serviceType: string;
    date: string;
    time: string;
    status: string;
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

    const displayName = isCarer ? appointment.patientName : appointment.carerName;
    const displayStatus = getDisplayStatus(appointment.status);

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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="text-sm font-semibold text-gray-900">{displayName || 'Regular Patient'}</p>
                    <p className="text-xs text-gray-500">{appointment.serviceType}</p>
                </div>
                <span className="text-xs text-gray-600">{displayStatus}</span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                <p>{appointment.date} at {appointment.time}</p>
                <p>{appointment.location || (appointment.serviceType.includes("Emergency") ? "Clinic Center" : "Home Visit")}</p>
            </div>

            {isCarer && displayStatus === 'Upcoming' && (
                <div className="pt-4 border-t border-gray-200 flex gap-2">
                    <button
                        disabled={updating}
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        className="flex-1 bg-kera-vibrant text-white py-2 text-xs font-bold rounded-lg hover:bg-[#00a855] transition-colors disabled:opacity-50"
                    >
                        {updating ? 'Updating...' : 'Complete'}
                    </button>
                    <button
                        disabled={updating}
                        onClick={() => handleStatusUpdate('CANCELLED')}
                        className="flex-1 bg-white border border-gray-200 text-gray-900 py-2 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
