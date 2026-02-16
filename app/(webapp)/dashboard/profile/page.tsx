"use client";
import React from 'react';

export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your account information and preferences.</p>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
                                T
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Your Photo</h3>
                            <div className="mt-2 flex space-x-3">
                                <button type="button" className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant">
                                    Change
                                </button>
                                <button type="button" className="bg-transparent py-2 px-3 border border-transparent rounded-md text-sm leading-4 font-medium text-gray-700 hover:text-red-600 focus:outline-none">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
                                <div className="mt-1">
                                    <input type="text" name="first-name" id="first-name" autoComplete="given-name" className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border" defaultValue="Test" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
                                <div className="mt-1">
                                    <input type="text" name="last-name" id="last-name" autoComplete="family-name" className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border" defaultValue="User" />
                                </div>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <div className="mt-1">
                                    <input id="email" name="email" type="email" autoComplete="email" className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border" defaultValue="test@example.com" />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                                <div className="mt-1">
                                    <select id="language" name="language" className="shadow-sm focus:ring-kera-vibrant focus:border-kera-vibrant block w-full sm:text-sm border-gray-300 rounded-md p-2 border">
                                        <option>English</option>
                                        <option>Burmese</option>
                                        <option>Thai</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button type="submit" className="bg-kera-vibrant border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-[#00a855] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant">
                        Save Details
                    </button>
                </div>
            </div>
        </div>
    );
}
