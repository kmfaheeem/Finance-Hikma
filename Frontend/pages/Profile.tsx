import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, User, Camera } from 'lucide-react';

export const Profile: React.FC = () => {
    const { currentUser, updateProfile } = useFinance();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        fullName: '',
        address: '',
        schoolCollege: '',
        className: '',
        adNo: '',
        phoneNumber: '',
        pincode: '',
        profilePicture: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                password: '', // Keep empty for security
                fullName: currentUser.fullName || '',
                address: currentUser.address || '',
                schoolCollege: currentUser.schoolCollege || '',
                className: currentUser.className || '',
                adNo: currentUser.adNo || '',
                phoneNumber: currentUser.phoneNumber || '',
                pincode: currentUser.pincode || '',
                profilePicture: currentUser.profilePicture || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Clean up empty password if not changing
            const updates: any = { ...formData };
            if (!updates.password) {
                delete updates.password;
            }

            await updateProfile(updates);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        User Profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your personal information and application settings.
                    </p>
                </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-slate-200/60 p-6 sm:p-10 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                    <div className="relative group">
                        <div className="h-28 w-28 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner overflow-hidden border-4 border-white/50">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User size={48} />
                            )}
                        </div>
                        <label htmlFor="profilePictureInput" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                        </label>
                        <input
                            type="file"
                            id="profilePictureInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-slate-800">{currentUser.name}</h3>
                        <p className="text-slate-500 font-medium">@{currentUser.username}</p>
                        <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                            {currentUser.role} Account
                        </span>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <ShieldCheck className={message.type === 'success' ? 'text-green-500' : 'text-red-500'} />
                        <p className="font-medium text-sm">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">

                        {/* Account Credentials */}
                        <div className="sm:col-span-2">
                            <h4 className="text-lg font-semibold text-slate-800 mb-4">Account Credentials</h4>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Display Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                    required
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password (leave blank to keep current)</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="sm:col-span-2 pt-6 border-t border-slate-200 mt-2">
                            <h4 className="text-lg font-semibold text-slate-800 mb-4">Personal Details</h4>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Legal Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">Phone Number</label>
                            <div className="mt-1">
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="adNo" className="block text-sm font-medium text-slate-700">Admission / ID Number</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="adNo"
                                    id="adNo"
                                    value={formData.adNo}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="schoolCollege" className="block text-sm font-medium text-slate-700">School / College Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="schoolCollege"
                                    id="schoolCollege"
                                    value={formData.schoolCollege}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="className" className="block text-sm font-medium text-slate-700">Class / Grade</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="className"
                                    id="className"
                                    value={formData.className}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Physical Address</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-slate-700">Pincode / Zip Code</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="pincode"
                                    id="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                        >
                            Save Profile Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
