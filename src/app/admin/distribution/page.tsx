"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, User, Calendar, MapPin, Building2, FileText, Save, AlertCircle, CheckCircle, X, Fish, Eye, ChevronDown, ChevronUp, Plus, Edit3, Trash2, RotateCcw } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";
import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";
import { Batch, Distribution } from "@/app/components/types/data.types";
import { getCitiesForProvinceWithBarangays, locationData } from "@/app/components/data/location.data";

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Types
interface DistributionForm {
    beneficiaryType: 'Individual' | 'Organization' | '';
    beneficiaryId: number | null;
    firstname: string;
    lastname: string;
    organizationName: string;
    phoneNumber: string;
    species: string;
    date: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    facilityType: 'Fish Cage' | 'Pond' | '';
    details: string;
    batchId: string;
    fingerlingsCount: number;
}

interface FormErrors {
    [key: string]: string;
}

// Autocomplete Input Component
const AutocompleteInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    field: string;
    placeholder: string;
    error?: string;
    className?: string;
}> = ({ value, onChange, field, placeholder, error, className }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            // Show suggestions when user types at least 1 character
            if (value.length < 1) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/distributions-data/suggestions?field=${field}&query=${encodeURIComponent(value)}`);
                const data = await response.json();

                if (data.success && data.data.suggestions.length > 0) {
                    setSuggestions(data.data.suggestions);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [value, field]);

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                    if (suggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                }}
                placeholder={placeholder}
                className={className}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                onChange(suggestion);
                                setShowSuggestions(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
            {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{error}</span>
                </div>
            )}
        </div>
    );
};

// Species options
const speciesOptions = [
    "Red Tilapia",
    "Bangus"
];

// Mobile Card Component for Distribution
const DistributionCard: React.FC<{
    distribution: Distribution;
    onViewDetails: () => void;
    onDelete: () => void;
    onRestore: () => void;
}> = ({ distribution, onViewDetails, onDelete, onRestore }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const normalizedRemarks = (distribution.remarks as string) === 'Pending' ? '' : distribution.remarks;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{distribution.beneficiary}</h3>
                    <p className="text-sm font-mono text-blue-600">{distribution.batchId}</p>
                    <p className="text-sm text-gray-600">{distribution.species}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        disabled={distribution.isDeleted}
                        className={distribution.isDeleted ? "bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50" : "bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"}
                        title={distribution.isDeleted ? "View disabled for deleted records" : "View Details"}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {distribution.isDeleted ? (
                        <button
                            onClick={onRestore}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                            title="Restore"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onDelete}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        title={isExpanded ? "Show Less" : "Show More"}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-500">Fingerlings:</span>
                    <p className="font-medium text-gray-900">{distribution.fingerlingsCount.toLocaleString()}</p>
                </div>
                <div>
                    <span className="text-gray-500">Facility:</span>
                    <p className="font-medium text-gray-900">{distribution.facilityType}</p>
                </div>
                <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium text-gray-900">{distribution.date}</p>
                </div>
                <div>
                    <span className="text-gray-500">Status:</span>
                    {distribution.isDeleted ? (
                        <p className="font-medium text-gray-600">Deleted</p>
                    ) : (
                        <p className={`font-medium ${normalizedRemarks ? 'text-green-600' : 'text-amber-600'}`}>
                            {normalizedRemarks || 'Distributed'}
                        </p>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-medium text-gray-900 mt-1">{distribution.location}</p>
                        </div>
                        {/* Phone number display - Commented out for now */}
                        {/* <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium text-gray-900">{distribution.phoneNumber}</p>
                        </div> */}
                        {distribution.forecastedHarvestKilos && (
                            <div>
                                <span className="text-gray-500">Forecasted Harvest:</span>
                                <p className="font-medium text-blue-600">{distribution.forecastedHarvestKilos} kg</p>
                            </div>
                        )}
                        {distribution.actualHarvestKilos && (
                            <div>
                                <span className="text-gray-500">Actual Harvest:</span>
                                <p className="font-medium text-green-600">{distribution.actualHarvestKilos} kg</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// BeneficiaryProfileForm interface 
interface BeneficiaryProfileForm {
    beneficiaryType: 'Individual' | 'Organization' | '';
    firstname: string;
    lastname: string;
    organizationName: string;
    contactNumber: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
}

const NewBeneficiaryPromptModal: React.FC<{
    isOpen: boolean;
    onYes: () => void;
    onNo: () => void;
    onClose: () => void;
}> = ({ isOpen, onYes, onNo, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">New Beneficiary?</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    If yes, you’ll profile the beneficiary first, then continue to the new distribution form.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onNo}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                        No
                    </button>
                    <button
                        onClick={onYes}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};

const BeneficiaryProfilingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSaved: (beneficiary: any) => void;
}> = ({ isOpen, onClose, onSaved }) => {
    const [formData, setFormData] = useState<BeneficiaryProfileForm>({
        beneficiaryType: '',
        firstname: '',
        lastname: '',
        organizationName: '',
        contactNumber: '',
        province: '',
        city: '',
        barangay: '',
        street: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAvailableCities = () => {
        if (!formData.province || formData.province === 'all' || !locationData.cities[formData.province]) {
            return ["All Cities"];
        }
        return ["All Cities", ...getCitiesForProvinceWithBarangays(formData.province)];
    };

    const getAvailableBarangays = () => {
        const availableBarangays = locationData.barangays[formData.province]?.[formData.city];
        if (!formData.city || formData.city === 'all' || formData.city === 'All Cities' || !availableBarangays) {
            return ["All Barangays"];
        }
        return ["All Barangays", ...availableBarangays];
    };

    const handleInputChange = (field: keyof BeneficiaryProfileForm, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'province') {
                newData.city = '';
                newData.barangay = '';
            } else if (field === 'city') {
                newData.barangay = '';
            } else if (field === 'beneficiaryType') {
                newData.firstname = '';
                newData.lastname = '';
                newData.organizationName = '';
            }
            return newData;
        });

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.beneficiaryType) newErrors.beneficiaryType = 'Beneficiary type is required';

        if (formData.beneficiaryType === 'Individual') {
            if (!formData.firstname.trim()) newErrors.firstname = 'Firstname is required';
            if (!formData.lastname.trim()) newErrors.lastname = 'Lastname is required';
        } else if (formData.beneficiaryType === 'Organization') {
            if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
        }

        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.barangay) newErrors.barangay = 'Barangay is required';
        if (!formData.street.trim()) newErrors.street = 'Street/Purok is required';

        const contactNumber = formData.contactNumber.trim();
        if (!contactNumber) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^\d{11}$/.test(contactNumber)) {
            newErrors.contactNumber = 'Contact number must be exactly 11 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const payload = {
                beneficiaryType: formData.beneficiaryType,
                firstname: formData.beneficiaryType === 'Individual' ? formData.firstname : undefined,
                lastname: formData.beneficiaryType === 'Individual' ? formData.lastname : undefined,
                organizationName: formData.beneficiaryType === 'Organization' ? formData.organizationName : undefined,
                contactNumber: formData.contactNumber,
                province: formData.province,
                municipality: formData.city,
                barangay: formData.barangay || undefined,
                street: formData.street
            };

            const response = await fetch('/api/beneficiaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                onSaved(result.data);
                setFormData({
                    beneficiaryType: '',
                    firstname: '',
                    lastname: '',
                    organizationName: '',
                    contactNumber: '',
                    province: '',
                    city: '',
                    barangay: '',
                    street: ''
                });
                setErrors({});
            } else {
                alert(`Failed to save beneficiary: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving beneficiary:', error);
            alert('An error occurred while saving the beneficiary. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Beneficiary Profiling</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Basic Information
                            </h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Beneficiary Type</label>
                                <div className="flex gap-6">
                                    {['Individual', 'Organization'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="beneficiaryType"
                                                value={type}
                                                checked={formData.beneficiaryType === type}
                                                onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.beneficiaryType && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.beneficiaryType}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.beneficiaryType === 'Individual' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Firstname</label>
                                            <input
                                                type="text"
                                                value={formData.firstname}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                                placeholder="Enter firstname"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.firstname && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.firstname}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lastname</label>
                                            <input
                                                type="text"
                                                value={formData.lastname}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                                placeholder="Enter lastname"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.lastname && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm text-red-600">{errors.lastname}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formData.beneficiaryType === 'Organization' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.organizationName}
                                                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                                                placeholder="Enter organization name"
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.organizationName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.organizationName && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm text-red-600">{errors.organizationName}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={11}
                                        value={formData.contactNumber}
                                        onChange={(e) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            handleInputChange('contactNumber', digitsOnly);
                                        }}
                                        placeholder="Enter contact number"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.contactNumber && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.contactNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                    <select
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Province</option>
                                        {locationData.provinces.map((province) => (
                                            <option key={province} value={province}>
                                                {province}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.province && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.province}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City/Municipality</label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        disabled={!formData.province}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${!formData.province ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select City</option>
                                        {getAvailableCities()
                                            .filter(c => c !== 'All Cities')
                                            .map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.city && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.city}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                                    <select
                                        value={formData.barangay}
                                        onChange={(e) => handleInputChange('barangay', e.target.value)}
                                        disabled={!formData.city || formData.city === 'All Cities'}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.barangay ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } ${!formData.city || formData.city === 'All Cities' ? 'cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select Barangay</option>
                                        {getAvailableBarangays()
                                            .filter(b => b !== 'All Barangays')
                                            .map((barangay) => (
                                                <option key={barangay} value={barangay}>
                                                    {barangay}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.barangay && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.barangay}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street/Purok</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        placeholder="Enter street/purok"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.street && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.street}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save & Continue
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BeneficiarySelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    beneficiaries: any[];
    isLoading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSelect: (beneficiary: any) => void;
}> = ({
    isOpen,
    onClose,
    onBack,
    beneficiaries,
    isLoading,
    search,
    onSearchChange,
    page,
    totalPages,
    onPageChange,
    onSelect
}) => {
    if (!isOpen) return null;

    const getBeneficiaryName = (beneficiary: any) => {
        if (beneficiary?.beneficiaryType === 'Organization') {
            return (beneficiary.organizationName || '').toString().trim();
        }
        return `${beneficiary?.firstname || ''} ${beneficiary?.lastname || ''}`.trim();
    };

    const getBeneficiaryLocation = (beneficiary: any) => {
        const street = (beneficiary?.street || '').toString().trim();
        const barangay = (beneficiary?.barangay || '').toString().trim();
        const municipality = (beneficiary?.municipality || '').toString().trim();
        const province = (beneficiary?.province || '').toString().trim();
        return `${street}${barangay ? `, ${barangay}` : ''}, ${municipality}, ${province}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Select Beneficiary</h2>
                                <p className="text-sm text-gray-500">Most recent to oldest</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search by beneficiary name..."
                            className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            onClick={onBack}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            Back
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <FullScreenLoader />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2 mt-4">Loading beneficiaries...</h3>
                            <p className="text-gray-500">Please wait</p>
                        </div>
                    ) : beneficiaries.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No beneficiaries found</h3>
                            <p className="text-gray-500 mb-6">Try another name or go back and choose “Yes” to add a new beneficiary</p>
                            <button
                                onClick={onBack}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                Back to Question
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {beneficiaries.map((beneficiary: any) => (
                                        <div
                                            key={beneficiary.id}
                                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{getBeneficiaryName(beneficiary)}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                                                    <span className="text-gray-600">{beneficiary.beneficiaryType}</span>
                                                    <span className="text-gray-500 truncate">{getBeneficiaryLocation(beneficiary)}</span>
                                                    {beneficiary.contactNumber && (
                                                        <span className="text-gray-500">{beneficiary.contactNumber}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onSelect(beneficiary)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors font-medium whitespace-nowrap"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={() => onPageChange(page - 1)}
                                    disabled={page <= 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <div className="text-sm text-gray-600">
                                    Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => onPageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Distribution Form Modal Component
const DistributionFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (distribution: Distribution) => void;
    batches: Batch[];
    currentUserId?: number;
    prefill?: Partial<
        Pick<
            DistributionForm,
            | 'beneficiaryId'
            | 'beneficiaryType'
            | 'firstname'
            | 'lastname'
            | 'organizationName'
            | 'phoneNumber'
            | 'province'
            | 'city'
            | 'barangay'
            | 'street'
        >
    >;
}> = ({ isOpen, onClose, onSave, batches, currentUserId, prefill }) => {
    const [formData, setFormData] = useState<DistributionForm>({
        beneficiaryType: '',
        beneficiaryId: null,
        firstname: '',
        lastname: '',
        organizationName: '',
        phoneNumber: '',
        species: '',
        date: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
        facilityType: '',
        details: '',
        batchId: '',
        fingerlingsCount: 0
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [availableBatches, setAvailableBatches] = useState<Batch[]>(batches);
    const [calculatedHarvestDate, setCalculatedHarvestDate] = useState<string>('');

    // Update available batches when batches prop changes
    useEffect(() => {
        setAvailableBatches(batches);
    }, [batches]);

    // Calculate forecasted harvest date when distribution date and species are selected
    useEffect(() => {
        if (formData.date && formData.species) {
            const date = new Date(formData.date);
            const isTilapia = formData.species.toLowerCase().includes('tilapia');
            const growthMonths = isTilapia ? 4 : 3;

            const forecastedDate = new Date(date);
            forecastedDate.setMonth(date.getMonth() + growthMonths);

            setCalculatedHarvestDate(forecastedDate.toISOString().split('T')[0]);
        } else {
            setCalculatedHarvestDate('');
        }
    }, [formData.date, formData.species]);

    useEffect(() => {
        if (!isOpen || !prefill) return;
        setFormData(prev => ({
            ...prev,
            ...prefill
        }));
    }, [isOpen, prefill]);

    if (!isOpen) return null;

    // Get available cities based on selected province
    const getAvailableCities = () => {
        if (!formData.province || formData.province === 'all' || !locationData.cities[formData.province]) {
            return ["All Cities"];
        }
        return ["All Cities", ...getCitiesForProvinceWithBarangays(formData.province)];
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = () => {
        const availableBarangays = locationData.barangays[formData.province]?.[formData.city];
        if (!formData.city || formData.city === 'all' || formData.city === 'All Cities' || !availableBarangays) {
            return ["All Barangays"];
        }
        return ["All Barangays", ...availableBarangays];
    };

    // Handle input changes
    const handleInputChange = (field: keyof DistributionForm, value: string | number) => {
        setSubmitError("");
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Reset dependent fields when parent location changes
            if (field === 'province') {
                newData.city = '';
                newData.barangay = '';
            } else if (field === 'city') {
                newData.barangay = '';
            } else if (field === 'beneficiaryType') {
                // Reset name fields when changing beneficiary type
                newData.firstname = '';
                newData.lastname = '';
                newData.organizationName = '';
            }

            if (field === 'beneficiaryType' || field === 'firstname' || field === 'lastname' || field === 'organizationName') {
                newData.beneficiaryId = null;
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle batch selection
    const handleBatchChange = async (batchId: string) => {
        const batch = availableBatches.find(b => b.id === batchId);
        setSelectedBatch(batch || null);
        handleInputChange('batchId', batchId);

        const normalizeBatchSpecies = (value: string): 'Tilapia' | 'Bangus' | '' => {
            const normalized = (value || '').toString().trim().toLowerCase();
            if (!normalized) return '';
            if (normalized.includes('tilapia')) return 'Tilapia';
            if (normalized.includes('bangus')) return 'Bangus';
            return '';
        };

        if (batch) {
            // Auto-fill fingerlings count from the selected batch
            handleInputChange('fingerlingsCount', batch.fingerlingsCount);
            handleInputChange('species', normalizeBatchSpecies(batch.species));
        } else {
            handleInputChange('species', '');
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.beneficiaryType) newErrors.beneficiaryType = 'Beneficiary type is required';

        if (formData.beneficiaryType === 'Individual') {
            if (!formData.firstname.trim()) newErrors.firstname = 'Firstname is required';
            if (!formData.lastname.trim()) newErrors.lastname = 'Lastname is required';
        } else if (formData.beneficiaryType === 'Organization') {
            if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
        }

        // Phone number validation - Commented out for now
        /* if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must contain only numbers';
        } else if (formData.phoneNumber.length < 11) {
            newErrors.phoneNumber = 'Phone number must be at least 11 digits';
        } */
        if (!formData.species) newErrors.species = 'Species is auto-filled from batch';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.barangay) newErrors.barangay = 'Barangay is required';
        if (!formData.street.trim()) newErrors.street = 'Street/Purok is required';
        // Facility type validation removed as the field is not in the form
        if (!formData.details.trim()) newErrors.details = 'Details are required';
        if (!formData.batchId) newErrors.batchId = 'Batch ID is required';
        if (!formData.fingerlingsCount || formData.fingerlingsCount <= 0) {
            newErrors.fingerlingsCount = 'Please select a valid batch to auto-assign fingerlings';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Calculate forecast and harvest dates based on species
    const calculateDates = (distributionDate: string) => {
        const date = new Date(distributionDate);

        // Determine if species is Tilapia or Bangus
        const isTilapia = formData.species.toLowerCase().includes('tilapia');

        // Forecasted Harvest Date: Bangus = 3 months, Tilapia = 4 months
        const forecastedHarvestDate = new Date(date);
        const monthsToHarvest = isTilapia ? 4 : 3;
        forecastedHarvestDate.setMonth(date.getMonth() + monthsToHarvest);

        const forecastDate = new Date(date);
        forecastDate.setMonth(date.getMonth() + 3); // 3 months for forecast

        const harvestDate = new Date(date);
        harvestDate.setMonth(date.getMonth() + 6); // 6 months for harvest

        return {
            forecast: forecastDate.toISOString().split('T')[0],
            harvest: harvestDate.toISOString().split('T')[0],
            forecastedHarvest: forecastedHarvestDate.toISOString().split('T')[0]
        };
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!currentUserId) {
            setSubmitError("No authenticated user found. Please sign in again.");
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);

        try {
            const beneficiaryName = formData.beneficiaryType === 'Individual'
                ? `${formData.firstname} ${formData.lastname}`
                : formData.organizationName;

            // Map species to match database enum
            const speciesMapping: { [key: string]: 'Tilapia' | 'Bangus' } = {
                'Red Tilapia': 'Tilapia',
                'Tilapia': 'Tilapia',
                'Bangus': 'Bangus'
            };

            const dbSpecies = speciesMapping[formData.species];
            if (!dbSpecies) {
                setErrors(prev => ({ ...prev, species: 'Invalid species from selected batch' }));
                setIsSubmitting(false);
                return;
            }

            // Prepare data for API
            const distributionData = {
                dateDistributed: formData.date,
                beneficiaryName: beneficiaryName,
                beneficiaryId: formData.beneficiaryId,
                barangay: formData.barangay,
                municipality: formData.city,
                province: formData.province,
                fingerlings: formData.fingerlingsCount,
                species: dbSpecies,
                userId: currentUserId,
                batchId: formData.batchId
            };

            // Call API to save to database
            const response = await fetch('/api/distributions-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(distributionData),
            });

            const result = await response.json();

            if (result.success) {
                // Delete the session from Railway API after successful distribution save
                if (selectedBatch?.sessionId) {
                    try {
                        const deleteSessionResponse = await fetch(
                            `https://fincount-api-production.up.railway.app/api/sessions/${selectedBatch.sessionId}`,
                            {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        // Check if the response is OK (status 200-299)
                        if (deleteSessionResponse.ok) {
                            console.log('Session deleted successfully from Railway API. Session ID:', selectedBatch.sessionId, 'Batch ID:', formData.batchId);
                        } else {
                            const deleteSessionResult = await deleteSessionResponse.json();
                            console.error('Failed to delete session from Railway API:', deleteSessionResult);
                        }
                    } catch (sessionDeleteError) {
                        console.error('Error deleting session from Railway API:', sessionDeleteError);
                    }
                }

                // Transform the saved data back to Distribution format for display
                const dates = calculateDates(formData.date);
                const location = `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}`;

                const newDistribution: Distribution = {
                    id: result.data.id.toString(),
                    beneficiaryType: formData.beneficiaryType as 'Individual' | 'Organization',
                    beneficiary: beneficiaryName,
                    phoneNumber: formData.phoneNumber,
                    species: formData.species,
                    batchId: formData.batchId,
                    fingerlingsCount: formData.fingerlingsCount,
                    location,
                    facilityType: formData.facilityType,
                    date: formData.date,
                    forecast: dates.forecast,
                    harvestDate: dates.harvest,
                    forecastedHarvestDate: dates.forecastedHarvest,
                    forecastedHarvestKilos: Number(result.data.forecastedHarvestKilos ?? 0),
                    remarks: ''
                };

                onSave(newDistribution);

                // Remove the used batch from available batches
                setAvailableBatches(prev => prev.filter(b => b.id !== formData.batchId));

                // Reset form
                setFormData({
                    beneficiaryType: '',
                    beneficiaryId: null,
                    firstname: '',
                    lastname: '',
                    organizationName: '',
                    phoneNumber: '', species: '', date: '', province: '', city: '',
                    barangay: '', street: '', facilityType: '', details: '',
                    batchId: '', fingerlingsCount: 0
                });
                setSelectedBatch(null);
                setErrors({});
                onClose();
            } else {
                console.error('Failed to save distribution:', result.error);
                const rawError = typeof result.error === "string" ? result.error : "";
                const isMlForecastError =
                    response.status === 502 ||
                    /forecast/i.test(rawError) ||
                    /ml/i.test(rawError);

                if (isMlForecastError) {
                    setSubmitError(
                        "Harvest forecast could not be generated due to insufficient historical data. Please verify the location or try again later."
                    );
                } else {
                    setSubmitError(rawError || "Unable to save distribution. Please try again.");
                }
            }

        } catch (error) {
            console.error("Distribution submission error:", error);
            setSubmitError("An unexpected error occurred while saving the distribution. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">New Fingerling Distribution</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Batch Selection */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                Batch Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
                                    <select
                                        value={formData.batchId}
                                        onChange={(e) => handleBatchChange(e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.batchId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a batch</option>
                                        {availableBatches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.id} - {batch.species} ({batch.location})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.batchId && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.batchId}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="h-4 w-4" />
                                        Batch Date (Auto-filled)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={selectedBatch?.date || ''}
                                            readOnly
                                            placeholder="Will be auto-filled when batch is selected"
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                        {selectedBatch && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Fish className="h-4 w-4" />
                                        Fingerlings Count (Auto-filled)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.fingerlingsCount || ''}
                                            onChange={(e) => handleInputChange('fingerlingsCount', parseInt(e.target.value) || 0)}
                                            placeholder="Will be auto-filled when batch is selected"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fingerlingsCount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            min="0"
                                        />
                                        {selectedBatch && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.fingerlingsCount && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.fingerlingsCount}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4" />
                                        Batch Location (Auto-filled)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={selectedBatch?.location || ''}
                                            readOnly
                                            placeholder="Will be auto-filled when batch is selected"
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                        {selectedBatch && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FileText className="h-4 w-4" />
                                        Batch Notes (Auto-filled)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={selectedBatch?.notes || ''}
                                            readOnly
                                            placeholder="Will be auto-filled when batch is selected"
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                                        />
                                        {selectedBatch && (
                                            <div className="absolute right-3 top-3">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Beneficiary Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Beneficiary Information
                            </h3>

                            {/* Beneficiary Type Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Beneficiary Type</label>
                                <div className="flex gap-6">
                                    {['Individual', 'Organization'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="beneficiaryType"
                                                value={type}
                                                checked={formData.beneficiaryType === type}
                                                onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.beneficiaryType && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.beneficiaryType}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.beneficiaryType === 'Individual' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Firstname</label>
                                            <AutocompleteInput
                                                value={formData.firstname}
                                                onChange={(value) => handleInputChange('firstname', value)}
                                                field="firstname"
                                                placeholder="Enter firstname"
                                                error={errors.firstname}
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lastname</label>
                                            <AutocompleteInput
                                                value={formData.lastname}
                                                onChange={(value) => handleInputChange('lastname', value)}
                                                field="lastname"
                                                placeholder="Enter lastname"
                                                error={errors.lastname}
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.beneficiaryType === 'Organization' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                                        <input
                                            type="text"
                                            value={formData.organizationName}
                                            onChange={(e) => handleInputChange('organizationName', e.target.value)}
                                            placeholder="Enter organization name"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.organizationName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.organizationName && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm text-red-600">{errors.organizationName}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Phone Number field - Commented out for now */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            // Only allow numbers and limit to 11 digits
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            handleInputChange('phoneNumber', value);
                                        }}
                                        placeholder="Enter phone number (11 digits)"
                                        maxLength={11}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.phoneNumber && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.phoneNumber}</span>
                                        </div>
                                    )}
                                    {formData.phoneNumber && !errors.phoneNumber && formData.phoneNumber.length === 11 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-600">
                                                Valid phone number (11 digits)
                                            </span>
                                        </div>
                                    )}
                                    {formData.phoneNumber && !errors.phoneNumber && formData.phoneNumber.length < 11 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm text-amber-600">
                                                {formData.phoneNumber.length}/11 digits
                                            </span>
                                        </div>
                                    )}
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                                    <input
                                        type="text"
                                        value={formData.species || ''}
                                        readOnly
                                        disabled
                                        placeholder="Select a batch to auto-fill species"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.species ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.species && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.species}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                    <select
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Province</option>
                                        {locationData.provinces.map((province) => (
                                            <option key={province} value={province}>
                                                {province}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.province && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.province}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        disabled={!formData.province}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select City</option>
                                        {getAvailableCities().filter(city => city !== "All Cities").map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.city && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.city}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                                    <select
                                        value={formData.barangay}
                                        onChange={(e) => handleInputChange('barangay', e.target.value)}
                                        disabled={!formData.city}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.barangay ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Barangay</option>
                                        {getAvailableBarangays().filter(barangay => barangay !== "All Barangays").map((barangay) => (
                                            <option key={barangay} value={barangay}>
                                                {barangay}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.barangay && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.barangay}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street / Purok</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        placeholder="Enter street or purok"
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.street && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{errors.street}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Facility and Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <Building2 className="h-4 w-4" />
                                    Facility Type
                                </label>
                                <div className="space-y-3">
                                    {['Fish Cage', 'Pond'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="facilityType"
                                                value={type}
                                                checked={formData.facilityType === type}
                                                onChange={(e) => handleInputChange('facilityType', e.target.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.facilityType && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.facilityType}</span>
                                    </div>
                                )}
                            </div> */}

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    Distribution Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                {errors.date && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">{errors.date}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    Forecasted Harvest Date (Auto-calculated)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={calculatedHarvestDate ? new Date(calculatedHarvestDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                        readOnly
                                        placeholder={formData.species && formData.date ? "Calculating..." : "Select species and distribution date first"}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                    />
                                    {calculatedHarvestDate && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {calculatedHarvestDate && formData.species && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">
                                            {formData.species.toLowerCase().includes('tilapia') ? 'Red Tilapia: 4 months growth period' : 'Bangus: 3 months growth period'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4" />
                                Additional Details
                            </label>
                            <textarea
                                value={formData.details}
                                onChange={(e) => handleInputChange('details', e.target.value)}
                                placeholder="Enter additional details about the distribution"
                                rows={4}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.details ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                            />
                            {errors.details && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600">{errors.details}</span>
                                </div>
                            )}
                            {submitError && (
                                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-amber-800 font-semibold mb-1">Unable to Save Distribution</h4>
                                            <p className="text-amber-700 text-sm">{submitError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-3 rounded-lg transition-colors duration-300 flex items-center gap-3 font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving Distribution...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Distribution
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

// Detailed View Modal with Enhanced Harvest Tracking
const DetailModal: React.FC<{
    distribution: Distribution;
    onClose: () => void;
    onUpdate: (updatedDistribution: Distribution) => void;
}> = ({ distribution, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({
        forecastedHarvestDate: distribution.forecastedHarvestDate || '',
        actualHarvestDate: distribution.actualHarvestDate || '',
        forecastedHarvestKilos: distribution.forecastedHarvestKilos || 0,
        actualHarvestKilos: distribution.actualHarvestKilos || 0,
        remarks: (distribution.remarks as string) === 'Pending' ? '' : (distribution.remarks || ''),
        customRemarks: distribution.customRemarks || ''
    });

    const [showPrompt, setShowPrompt] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const distributionRemarks = (distribution.remarks as string) === 'Pending' ? '' : distribution.remarks;

    const remarks = editData.remarks;
    const isHarvested = remarks === 'Harvested';
    const hideActualInputs =
        remarks === 'Not Harvested' ||
        remarks === 'Ongoing' ||
        remarks === '' ||
        remarks === 'Other';
    const disableActualInputs = remarks === 'Damaged' || remarks === 'Disaster';
    const showActualInputs = !hideActualInputs;

    // Check harvest date conditions
    const checkHarvestConditions = () => {
        if (!editData.actualHarvestDate || !editData.forecastedHarvestDate) return;

        const actualDate = new Date(editData.actualHarvestDate);
        const forecastedDate = new Date(editData.forecastedHarvestDate);
        const distributionDate = new Date(distribution.date);

        // Calculate months difference
        const monthsDiff = (actualDate.getTime() - distributionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

        if (monthsDiff < 4) {
            if (actualDate < forecastedDate) {
                setPromptMessage("Harvest is earlier than forecasted date. Please verify the actual harvest date.");
                setShowPrompt(true);
            }
        } else if (monthsDiff > 4) {
            setPromptMessage("Harvest is more than 4 months from distribution date. Please update the actual harvest date.");
            setShowPrompt(true);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            if (remarks === 'Harvested') {
                if (!editData.actualHarvestDate) {
                    alert('Actual Harvest Date is required when remarks is Harvested.');
                    setIsSaving(false);
                    return;
                }

                if (!editData.actualHarvestKilos || editData.actualHarvestKilos <= 0) {
                    alert('Actual Harvest Weight (kg) must be greater than 0 when remarks is Harvested.');
                    setIsSaving(false);
                    return;
                }
            }

            if (remarks === 'Other' && !editData.customRemarks.trim()) {
                alert('Please specify other remarks.');
                setIsSaving(false);
                return;
            }

            const shouldPersistActual = remarks === 'Harvested';
            const normalizedActualHarvestDate = shouldPersistActual ? (editData.actualHarvestDate || null) : null;
            const normalizedActualHarvestKilos = shouldPersistActual ? (editData.actualHarvestKilos || null) : null;
            const normalizedCustomRemarks = remarks === 'Other' ? editData.customRemarks.trim() : null;

            const effectiveActualHarvestKilos = shouldPersistActual ? editData.actualHarvestKilos : 0;

            // Calculate survival rate (as decimal 0-1) and average weight based on actual harvest
            const survivalRate = effectiveActualHarvestKilos && distribution.fingerlingsCount
                ? Math.min((effectiveActualHarvestKilos / (distribution.fingerlingsCount * 0.5)), 1.0)
                : 0.78;

            const avgWeight = effectiveActualHarvestKilos && distribution.fingerlingsCount
                ? (effectiveActualHarvestKilos / distribution.fingerlingsCount)
                : 0.5;

            // Prepare data for API update
            const updateData = {
                harvestKilo: normalizedActualHarvestKilos || distribution.forecastedHarvestKilos,
                survivalRate: parseFloat(survivalRate.toFixed(4)), // Ensure it's within DECIMAL(5,4) range
                avgWeight: parseFloat(avgWeight.toFixed(2)),
                forecastedHarvestDate: editData.forecastedHarvestDate || null,
                actualHarvestDate: normalizedActualHarvestDate,
                actualHarvestKilos: normalizedActualHarvestKilos,
                remarks: editData.remarks || null,
                customRemarks: normalizedCustomRemarks
            };

            // Call API to update distribution in database
            const response = await fetch(`/api/distributions-data/${distribution.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state with new values
                const updatedDistribution: Distribution = {
                    ...distribution,
                    forecastedHarvestDate: editData.forecastedHarvestDate,
                    actualHarvestDate: normalizedActualHarvestDate ?? '',
                    forecastedHarvestKilos: distribution.forecastedHarvestKilos,
                    actualHarvestKilos: normalizedActualHarvestKilos ?? 0,
                    remarks: editData.remarks as any,
                    customRemarks: remarks === 'Other' ? (normalizedCustomRemarks || '') : ''
                };

                onUpdate(updatedDistribution);
                setIsEditing(false);
                setShowPrompt(false);
            } else {
                console.error('Failed to update distribution:', result.error);
                alert(`Failed to update harvest data: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating harvest data:', error);
            alert('An error occurred while updating harvest data. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditData({
            forecastedHarvestDate: distribution.forecastedHarvestDate || '',
            actualHarvestDate: distribution.actualHarvestDate || '',
            forecastedHarvestKilos: distribution.forecastedHarvestKilos || 0,
            actualHarvestKilos: distribution.actualHarvestKilos || 0,
            remarks: (distribution.remarks as string) === 'Pending' ? '' : (distribution.remarks || ''),
            customRemarks: distribution.customRemarks || ''
        });
        setIsEditing(false);
        setShowPrompt(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Distribution Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Beneficiary Information */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Beneficiary Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-blue-600 font-medium">Type:</span>
                                    <p className="text-blue-800">{distribution.beneficiaryType}</p>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">Name:</span>
                                    <p className="text-blue-800">{distribution.beneficiary}</p>
                                </div>
                                {/* Phone number display - Commented out for now */}
                                {/* <div>
                                    <span className="text-blue-600 font-medium">Phone:</span>
                                    <p className="text-blue-800">{distribution.phoneNumber}</p>
                                </div> */}
                                <div>
                                    <span className="text-blue-600 font-medium">Species:</span>
                                    <p className="text-blue-800">{distribution.species}</p>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">Contact Number:</span>
                                    <p className="text-blue-800">
                                        {distribution.phoneNumber && distribution.phoneNumber !== '-' ? distribution.phoneNumber : 'Not provided'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-blue-600 font-medium">Location:</span>
                                    <p className="text-blue-800">{distribution.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Details */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                <Fish className="h-5 w-5" />
                                Distribution Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-green-600 font-medium">Batch ID:</span>
                                    <p className="text-green-800 font-mono">{distribution.batchId}</p>
                                </div>
                                <div>
                                    <span className="text-green-600 font-medium">Fingerlings Count:</span>
                                    <p className="text-green-800">{distribution.fingerlingsCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-green-600 font-medium">Distribution Date:</span>
                                    <p className="text-green-800">{distribution.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Harvest Tracking Section */}
                        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                                    <Fish className="h-5 w-5" />
                                    Harvest Tracking
                                </h4>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Update Harvest Data
                                    </button>
                                )}
                            </div>

                            {!isEditing ? (
                                // Display Mode
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-purple-600 font-medium">Forecasted Harvest Date:</span>
                                            <p className="text-purple-800">
                                                {distribution.forecastedHarvestDate || 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-purple-600 font-medium">Actual Harvest Date:</span>
                                            <p className="text-purple-800">
                                                {distribution.actualHarvestDate || 'Not recorded'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-purple-600 font-medium">Forecasted Harvest (kg):</span>
                                            <p className="text-purple-800 text-lg font-semibold">
                                                {distribution.forecastedHarvestKilos ?
                                                    `${distribution.forecastedHarvestKilos.toLocaleString()} kg` :
                                                    'Not calculated'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-purple-600 font-medium">Actual Harvest Weight (kg):</span>
                                            <p className="text-purple-800 text-lg font-semibold">
                                                {distribution.actualHarvestKilos ?
                                                    `${distribution.actualHarvestKilos.toLocaleString()} kg` :
                                                    'Not recorded'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-purple-600 font-medium">Status/Remarks:</span>
                                            <p className="text-purple-800">
                                                {distribution.remarks === 'Other' && distribution.customRemarks
                                                    ? distribution.customRemarks
                                                    : distributionRemarks
                                                        ? distributionRemarks
                                                        : 'Distributed'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode
                                <div className="space-y-6">
                                    {showPrompt && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                                <p className="text-amber-800 font-medium">Notice</p>
                                            </div>
                                            <p className="text-amber-700 mt-2">{promptMessage}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                                Forecasted Harvest Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editData.forecastedHarvestDate}
                                                onChange={(e) => setEditData(prev => ({ ...prev, forecastedHarvestDate: e.target.value }))}
                                                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                        {showActualInputs && (
                                            <div>
                                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                                    Actual Harvest Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={editData.actualHarvestDate}
                                                    disabled={disableActualInputs}
                                                    onChange={(e) => {
                                                        setEditData(prev => ({ ...prev, actualHarvestDate: e.target.value }));
                                                    }}
                                                    onBlur={() => {
                                                        if (isHarvested) checkHarvestConditions();
                                                    }}
                                                    className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                                Forecasted Harvest (kg)
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    editData.forecastedHarvestKilos
                                                        ? `${editData.forecastedHarvestKilos.toLocaleString()} kg`
                                                        : ''
                                                }
                                                readOnly
                                                disabled
                                                placeholder="Auto-calculated"
                                                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80"
                                            />
                                        </div>
                                        {showActualInputs && (
                                            <div>
                                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                                    Actual Harvest Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={editData.actualHarvestKilos || ''}
                                                    disabled={disableActualInputs}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, actualHarvestKilos: parseFloat(e.target.value) || 0 }))}
                                                    placeholder="Enter actual harvested weight in kg"
                                                    className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Remarks Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-purple-700 mb-2">
                                            Remarks
                                        </label>
                                        <select
                                            value={editData.remarks}
                                            onChange={(e) => {
                                                const nextRemarks = e.target.value as NonNullable<Distribution['remarks']>;
                                                setEditData(prev => {
                                                    const next = { ...prev, remarks: nextRemarks };

                                                    if (nextRemarks !== 'Other') {
                                                        next.customRemarks = '';
                                                    }

                                                    if (
                                                        nextRemarks === '' ||
                                                        nextRemarks === 'Not Harvested' ||
                                                        nextRemarks === 'Ongoing' ||
                                                        nextRemarks === 'Damaged' ||
                                                        nextRemarks === 'Disaster'
                                                    ) {
                                                        next.actualHarvestDate = '';
                                                        next.actualHarvestKilos = 0;
                                                    }

                                                    return next;
                                                });
                                            }}
                                            className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-3"
                                        >
                                            <option value="">Select status</option>
                                            <option value="Harvested">Harvested</option>
                                            <option value="Not Harvested">Not Harvested</option>
                                            <option value="Damaged">Damaged</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Disaster">Disaster</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        {editData.remarks === 'Other' && (
                                            <textarea
                                                value={editData.customRemarks}
                                                onChange={(e) => setEditData(prev => ({ ...prev, customRemarks: e.target.value }))}
                                                placeholder="Please specify other remarks..."
                                                rows={3}
                                                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                            />
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-purple-200">
                                        <button
                                            onClick={cancelEdit}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DistributionForm: React.FC = () => {
    const { unreadCount } = useNotification();
    const { isLoading, isAuthenticated, logout, user } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    // State management
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showNewBeneficiaryPrompt, setShowNewBeneficiaryPrompt] = useState(false);
    const [showBeneficiaryProfilingModal, setShowBeneficiaryProfilingModal] = useState(false);
    const [showBeneficiarySelectionModal, setShowBeneficiarySelectionModal] = useState(false);
    const [beneficiaryPrefill, setBeneficiaryPrefill] = useState<Partial<
        Pick<
            DistributionForm,
            | 'beneficiaryId'
            | 'beneficiaryType'
            | 'firstname'
            | 'lastname'
            | 'organizationName'
            | 'phoneNumber'
            | 'province'
            | 'city'
            | 'barangay'
            | 'street'
        >
    > | null>(null);
    const [beneficiarySearch, setBeneficiarySearch] = useState('');
    const [beneficiaryPage, setBeneficiaryPage] = useState(1);
    const [beneficiaryLimit] = useState(10);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [beneficiaryTotalPages, setBeneficiaryTotalPages] = useState(1);
    const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [distributionsError, setDistributionsError] = useState<string>('');
    const [distributionsActiveCount, setDistributionsActiveCount] = useState(0);
    const [distributionsDeletedCount, setDistributionsDeletedCount] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDistributions, setTotalDistributions] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Selection and delete state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<'single' | 'multiple'>('multiple');
    const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

    // Fetch distributions from API (database seeded data) with pagination
    const fetchDistributions = async (page: number = 1, limit: number = 10) => {
        try {
            const response = await fetch(`/api/distributions-data?page=${page}&limit=${limit}&includeDeleted=${includeDeleted ? 'true' : 'false'}`, { cache: 'no-store' });
            const data = await response.json();

            if (data.success) {
                setDistributionsError('');
                setDistributionsActiveCount(data.data?.counts?.active ?? 0);
                setDistributionsDeletedCount(data.data?.counts?.deleted ?? 0);
                // Transform the database data to match the Distribution interface
                const transformedData = data.data.distributions.map((dist: any) => ({
                    id: dist.id.toString(),
                    beneficiaryType: 'Individual' as const,
                    beneficiary: dist.beneficiaryName,
                    phoneNumber: dist.beneficiaryProfile?.contactNumber ?? '-',
                    species: dist.species,
                    batchId: dist.batchId || '-',
                    fingerlingsCount: dist.fingerlings,
                    location: `${dist.barangay ? dist.barangay + ', ' : ''}${dist.municipality}, ${dist.province}`,
                    facilityType: 'Pond' as const,
                    date: new Date(dist.dateDistributed).toISOString().split('T')[0],
                    forecast: '',
                    harvestDate: '',
                    deletedAt: dist.deletedAt ?? null,
                    isDeleted: Boolean(dist.deletedAt),
                    forecastedHarvestDate: dist.forecastedHarvestDate ? new Date(dist.forecastedHarvestDate).toISOString().split('T')[0] : '',
                    actualHarvestDate: dist.actualHarvestDate ? new Date(dist.actualHarvestDate).toISOString().split('T')[0] : '',
                    forecastedHarvestKilos: dist.forecastedHarvestKilos || 0,
                    actualHarvestKilos: dist.actualHarvestKilos || 0,
                    remarks: dist.remarks || '' as any,
                    customRemarks: dist.customRemarks || ''
                }));

                setDistributions(transformedData);

                // Update pagination state
                setTotalPages(data.data.pagination.totalPages);
                setTotalDistributions(data.data.pagination.totalDistributions);
                setCurrentPage(data.data.pagination.currentPage);
            } else {
                setDistributions([]);
                setTotalPages(1);
                setTotalDistributions(0);
                setDistributionsError(data.error || 'Failed to fetch distributions');
            }
        } catch (error) {
            setDistributions([]);
            setTotalPages(1);
            setTotalDistributions(0);
            setDistributionsError(error instanceof Error ? error.message : 'Error fetching distributions');
        }
    };

    const fetchBeneficiaries = async (page: number = 1) => {
        setIsLoadingBeneficiaries(true);
        try {
            const response = await fetch(
                `/api/beneficiaries?search=${encodeURIComponent(beneficiarySearch)}&page=${page}&limit=${beneficiaryLimit}`,
                { cache: 'no-store' }
            );
            const data = await response.json();

            if (data.success) {
                setBeneficiaries(data.data.beneficiaries || []);
                setBeneficiaryTotalPages(data.data.pagination?.totalPages || 1);
                setBeneficiaryPage(data.data.pagination?.currentPage || page);
            } else {
                console.error('Failed to fetch beneficiaries:', data.error);
                setBeneficiaries([]);
                setBeneficiaryTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
            setBeneficiaries([]);
            setBeneficiaryTotalPages(1);
        } finally {
            setIsLoadingBeneficiaries(false);
        }
    };

    // Fetch batches from sessions API
    const fetchBatches = async () => {
        try {
            const response = await fetch('https://fincount-api-production.up.railway.app/api/sessions');
            const data = await response.json();

            if (data.success && data.data.sessions) {
                // Log the first session to see the actual structure
                if (data.data.sessions.length > 0) {
                    console.log('Sample session from API:', data.data.sessions[0]);
                }

                // Transform sessions data to batch format
                const transformedBatches: Batch[] = data.data.sessions.map((session: any) => {
                    // Calculate total count from all count categories
                    const totalCount = Object.values(session.counts || {}).reduce(
                        (sum: number, count: any) => sum + (Number(count) || 0),
                        0
                    );

                    // Try multiple possible field names for session ID
                    const sessionId = session.session_id || session.sessionId || session.id || session._id;

                    return {
                        id: session.batchId,
                        sessionId: sessionId, // Store session_id for deletion (try multiple field names)
                        species: session.species,
                        location: session.location,
                        date: new Date(session.timestamp).toISOString().split('T')[0],
                        fingerlingsCount: totalCount,
                        notes: session.notes || '',
                        imageUrl: session.imageUrl || ''
                    };
                });

                console.log('Transformed batches with sessionIds:', transformedBatches.map(b => ({ id: b.id, sessionId: b.sessionId })));
                setBatches(transformedBatches);
            } else {
                console.error('Failed to fetch sessions:', data.error);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    // Load data on component mount and when page/limit changes
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            await Promise.all([fetchDistributions(currentPage, itemsPerPage), fetchBatches()]);
            setIsLoadingData(false);
        };

        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, currentPage, itemsPerPage, includeDeleted]);

    useEffect(() => {
        if (!showBeneficiarySelectionModal) return;
        const timer = setTimeout(() => {
            fetchBeneficiaries(beneficiaryPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [showBeneficiarySelectionModal, beneficiarySearch, beneficiaryPage, beneficiaryLimit]);

    useEffect(() => {
        if (!showBeneficiarySelectionModal) return;
        setBeneficiaryPage(1);
    }, [beneficiarySearch, showBeneficiarySelectionModal]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handle items per page change
    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <FullScreenLoader />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md text-center">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 mb-6">
                        <Users className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {!isAuthenticated
                            ? "Your account doesn't have access to this area"
                            : "Invalid role for this section"}
                    </p>
                    <button
                        onClick={logout}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // Handle saving new distribution
    const handleSaveDistribution = (newDistribution: Distribution) => {
        setSuccessMessage('Distribution saved successfully!');
        setShowSuccess(true);
        setCurrentPage(1);
        fetchDistributions(1, itemsPerPage);

        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    // Handle updating distribution
    const handleUpdateDistribution = (updatedDistribution: Distribution) => {
        setSuccessMessage('Distribution updated successfully!');
        setDistributions(prev =>
            prev.map(dist =>
                dist.id === updatedDistribution.id ? updatedDistribution : dist
            )
        );
        setSelectedDistribution(updatedDistribution);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    // Open detail modal
    const openDetailModal = (distribution: Distribution) => {
        if (distribution.isDeleted) return;
        setSelectedDistribution(distribution);
        setShowDetailModal(true);
    };

    // Handle checkbox selection
    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedIds.length === distributions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(distributions.map(dist => dist.id));
        }
    };

    // Handle delete confirmation
    const confirmDelete = (id?: string) => {
        if (id) {
            setSingleDeleteId(id);
            setDeleteTarget('single');
        } else {
            setDeleteTarget('multiple');
        }
        setShowDeleteConfirm(true);
    };

    // Handle delete action
    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            if (!user?.id) {
                alert('No authenticated user found. Please sign in again.');
                return;
            }

            const idsToDelete = deleteTarget === 'single' && singleDeleteId
                ? [singleDeleteId]
                : selectedIds.filter((id) => {
                    const dist = distributions.find(d => d.id === id);
                    return dist ? !dist.isDeleted : false;
                });

            if (idsToDelete.length === 0) {
                setIsDeleting(false);
                setShowDeleteConfirm(false);
                setSingleDeleteId(null);
                return;
            }

            const response = await fetch('/api/distributions-data', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
                body: JSON.stringify({ ids: idsToDelete, actor: { id: user.id, userType: user.userType } }),
            });

            const data = await response.json();

            if (data.success) {
                setSelectedIds([]);
                setSuccessMessage(`Deleted ${data.deletedCount ?? 0} distribution(s)`);
                setShowSuccess(true);

                const details = [
                    (data.notFoundIds?.length ? `Not found: ${data.notFoundIds.join(', ')}` : null),
                    (data.unauthorizedIds?.length ? `Unauthorized: ${data.unauthorizedIds.join(', ')}` : null),
                    (data.alreadyDeletedIds?.length ? `Already deleted: ${data.alreadyDeletedIds.join(', ')}` : null),
                ].filter(Boolean).join('\n');
                if (details) alert(details);

                // Refresh data to update pagination
                await fetchDistributions(currentPage, itemsPerPage);
                if (showBeneficiarySelectionModal) {
                    await fetchBeneficiaries(beneficiaryPage);
                }

                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            } else {
                console.error('Failed to delete distributions:', data.error);
                alert(`Failed to delete distributions: ${data.error || 'Unknown error'}`);
                await fetchDistributions(currentPage, itemsPerPage);
                if (showBeneficiarySelectionModal) {
                    await fetchBeneficiaries(beneficiaryPage);
                }
            }
        } catch (error) {
            console.error('Error deleting distributions:', error);
            alert('An error occurred while deleting. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setSingleDeleteId(null);
        }
    };

    const handleRestore = async (ids: string[]) => {
        if (ids.length === 0) return;
        setIsDeleting(true);
        try {
            if (!user?.id) {
                alert('No authenticated user found. Please sign in again.');
                return;
            }

            const response = await fetch('/api/distributions-data/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
                body: JSON.stringify({ ids, actor: { id: user.id, userType: user.userType } }),
            });

            const data = await response.json();
            if (data.success) {
                setSelectedIds([]);
                setSuccessMessage(`Restored ${data.restoredCount ?? 0} distribution(s)`);
                setShowSuccess(true);

                const details = [
                    (data.notFoundIds?.length ? `Not found: ${data.notFoundIds.join(', ')}` : null),
                    (data.unauthorizedIds?.length ? `Unauthorized: ${data.unauthorizedIds.join(', ')}` : null),
                    (data.alreadyActiveIds?.length ? `Already active: ${data.alreadyActiveIds.join(', ')}` : null),
                ].filter(Boolean).join('\n');
                if (details) alert(details);

                await fetchDistributions(currentPage, itemsPerPage);
                if (showBeneficiarySelectionModal) {
                    await fetchBeneficiaries(beneficiaryPage);
                }
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                alert(`Failed to restore distributions: ${data.error || 'Unknown error'}`);
                await fetchDistributions(currentPage, itemsPerPage);
                if (showBeneficiarySelectionModal) {
                    await fetchBeneficiaries(beneficiaryPage);
                }
            }
        } catch (error) {
            console.error('Error restoring distributions:', error);
            alert('An error occurred while restoring. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const selectedActiveIds = selectedIds.filter((id) => {
        const dist = distributions.find(d => d.id === id);
        return dist ? !dist.isDeleted : false;
    });

    const selectedDeletedIds = selectedIds.filter((id) => {
        const dist = distributions.find(d => d.id === id);
        return dist ? Boolean(dist.isDeleted) : false;
    });

    return (
        <>
            <AsideNavigation onLogout={logout} unreadNotificationCount={unreadCount} />
            <div className="grid grid-cols-6 p-5 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
                <div className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto px-0 pt-14 pb-8 sm:px-6 sm:py-8 w-full">

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-green-800 font-medium">{successMessage || 'Success!'}</p>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Fish className="h-5 w-5 text-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Fingerling Distributions</h1>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setShowNewBeneficiaryPrompt(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2 font-semibold"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Add New Distribution
                                    </button>
                                </div>
                            </div>

                            {/* Distribution Table/List */}
                            {isLoadingData ? (
                                <div className="text-center py-12">
                                    <FullScreenLoader />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2 mt-4">Loading Distributions...</h3>
                                    <p className="text-gray-500">Please wait while we fetch the data</p>
                                </div>
                            ) : distributionsError ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Failed to load distributions</h3>
                                    <p className="text-gray-600 mb-2">{distributionsError}</p>
                                    <p className="text-gray-500">Check your database connection and migrations, then refresh.</p>
                                </div>
                            ) : distributions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Fish className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    {!includeDeleted && distributionsDeletedCount > 0 ? (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Distributions</h3>
                                            <p className="text-gray-500 mb-6">You have {distributionsDeletedCount} deleted distribution(s).</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Distributions Yet</h3>
                                            <p className="text-gray-500 mb-6">Start by adding your first fingerling distribution</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Bulk Actions */}
                                    {selectedIds.length > 0 && (
                                        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <span className="text-sm font-medium text-blue-900">
                                                {selectedIds.length} item(s) selected
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {selectedDeletedIds.length > 0 && (
                                                    <button
                                                        onClick={() => handleRestore(selectedDeletedIds)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Restore Selected
                                                    </button>
                                                )}
                                                {selectedActiveIds.length > 0 && (
                                                    <button
                                                        onClick={() => confirmDelete()}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Selected
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Desktop Table - Hidden on mobile */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.length === distributions.length && distributions.length > 0}
                                                            onChange={handleSelectAll}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Species</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Batch ID</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fingerlings</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Forecasted (kg)</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actual (kg)</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {distributions.map((dist) => {
                                                    const normalizedRemarks = (dist.remarks as string) === 'Pending' ? '' : dist.remarks;
                                                    const rowClassName = dist.isDeleted ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50';
                                                    return (
                                                    <tr key={dist.id} className={rowClassName}>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(dist.id)}
                                                                onChange={() => handleSelectRow(dist.id)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dist.beneficiary}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{dist.beneficiaryType}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.species}</td>
                                                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">{dist.batchId}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.fingerlingsCount.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{dist.location}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dist.date}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {dist.forecastedHarvestKilos ? (
                                                                <span className="text-blue-600 font-semibold">
                                                                    {dist.forecastedHarvestKilos.toLocaleString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {dist.actualHarvestKilos ? (
                                                                <span className="text-green-600 font-semibold">
                                                                    {dist.actualHarvestKilos.toLocaleString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {dist.isDeleted ? (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                                                    Deleted
                                                                </span>
                                                            ) : normalizedRemarks ? (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${normalizedRemarks === 'Harvested' ? 'bg-green-100 text-green-800' :
                                                                    normalizedRemarks === 'Not Harvested' ? 'bg-yellow-100 text-yellow-800' :
                                                                        normalizedRemarks === 'Damaged' ? 'bg-red-100 text-red-800' :
                                                                            normalizedRemarks === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                                                                normalizedRemarks === 'Disaster' ? 'bg-red-100 text-red-800' :
                                                                                    'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {normalizedRemarks === 'Other' && dist.customRemarks
                                                                        ? dist.customRemarks.length > 15
                                                                            ? `${dist.customRemarks.substring(0, 15)}...`
                                                                            : dist.customRemarks
                                                                        : normalizedRemarks
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                                    Distributed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => openDetailModal(dist)}
                                                                    disabled={dist.isDeleted}
                                                                    className={dist.isDeleted ? "bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50" : "bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"}
                                                                    title={dist.isDeleted ? "View disabled for deleted records" : "View Details"}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                {dist.isDeleted ? (
                                                                    <button
                                                                        onClick={() => handleRestore([dist.id])}
                                                                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                                                                        title="Restore"
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => confirmDelete(dist.id)}
                                                                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Tablet Table - Condensed version */}
                                    <div className="hidden md:block lg:hidden overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Beneficiary</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Species</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Batch</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {distributions.map((dist) => {
                                                    const normalizedRemarks = (dist.remarks as string) === 'Pending' ? '' : dist.remarks;
                                                    const rowClassName = dist.isDeleted ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50';
                                                    return (
                                                    <tr key={dist.id} className={rowClassName}>
                                                        <td className="px-3 py-3 text-sm text-gray-900 font-medium">{dist.beneficiary}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.species}</td>
                                                        <td className="px-3 py-3 text-sm text-blue-600 font-mono">{dist.batchId}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.fingerlingsCount.toLocaleString()}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">{dist.date}</td>
                                                        <td className="px-3 py-3 text-sm">
                                                            {dist.isDeleted ? (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                                                    Deleted
                                                                </span>
                                                            ) : normalizedRemarks ? (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${normalizedRemarks === 'Harvested' ? 'bg-green-100 text-green-800' :
                                                                    normalizedRemarks === 'Not Harvested' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {normalizedRemarks}
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                                    Distributed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => openDetailModal(dist)}
                                                                    disabled={dist.isDeleted}
                                                                    className={dist.isDeleted ? "bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50" : "bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"}
                                                                    title={dist.isDeleted ? "View disabled for deleted records" : "View Details"}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                {dist.isDeleted ? (
                                                                    <button
                                                                        onClick={() => handleRestore([dist.id])}
                                                                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                                                                        title="Restore"
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => confirmDelete(dist.id)}
                                                                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards - Shown only on mobile */}
                                    <div className="block md:hidden">
                                        {distributions.map((dist) => (
                                            <DistributionCard
                                                key={dist.id}
                                                distribution={dist}
                                                onViewDetails={() => openDetailModal(dist)}
                                                onDelete={() => confirmDelete(dist.id)}
                                                onRestore={() => handleRestore([dist.id])}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                                            <div className="text-sm text-gray-600">
                                                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDistributions)}</span> of{' '}
                                                <span className="font-medium">{totalDistributions}</span> distributions
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>

                                                <div className="flex gap-1">
                                                    {[...Array(totalPages)].map((_, idx) => {
                                                        const pageNum = idx + 1;
                                                        if (
                                                            pageNum === 1 ||
                                                            pageNum === totalPages ||
                                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => handlePageChange(pageNum)}
                                                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        } else if (
                                                            pageNum === currentPage - 2 ||
                                                            pageNum === currentPage + 2
                                                        ) {
                                                            return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>

                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Per page:</label>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <NewBeneficiaryPromptModal
                        isOpen={showNewBeneficiaryPrompt}
                        onClose={() => setShowNewBeneficiaryPrompt(false)}
                        onNo={() => {
                            setShowNewBeneficiaryPrompt(false);
                            setBeneficiaryPrefill(null);
                            setBeneficiarySearch('');
                            setBeneficiaryPage(1);
                            setShowBeneficiarySelectionModal(true);
                        }}
                        onYes={() => {
                            setShowNewBeneficiaryPrompt(false);
                            setShowBeneficiaryProfilingModal(true);
                        }}
                    />

                    <BeneficiarySelectionModal
                        isOpen={showBeneficiarySelectionModal}
                        onClose={() => {
                            setShowBeneficiarySelectionModal(false);
                            setShowNewBeneficiaryPrompt(true);
                        }}
                        onBack={() => {
                            setShowBeneficiarySelectionModal(false);
                            setShowNewBeneficiaryPrompt(true);
                        }}
                        beneficiaries={beneficiaries}
                        isLoading={isLoadingBeneficiaries}
                        search={beneficiarySearch}
                        onSearchChange={setBeneficiarySearch}
                        page={beneficiaryPage}
                        totalPages={beneficiaryTotalPages}
                        onPageChange={(page) => setBeneficiaryPage(page)}
                        onSelect={(beneficiary) => {
                            setShowBeneficiarySelectionModal(false);
                            setBeneficiaryPrefill({
                                beneficiaryId: typeof beneficiary.id === 'number' ? beneficiary.id : null,
                                beneficiaryType: beneficiary.beneficiaryType,
                                firstname: beneficiary.firstname || '',
                                lastname: beneficiary.lastname || '',
                                organizationName: beneficiary.organizationName || '',
                                phoneNumber: beneficiary.contactNumber || '',
                                province: beneficiary.province || '',
                                city: beneficiary.municipality || '',
                                barangay: beneficiary.barangay || '',
                                street: beneficiary.street || '',
                            });
                            setShowFormModal(true);
                        }}
                    />

                    <BeneficiaryProfilingModal
                        isOpen={showBeneficiaryProfilingModal}
                        onClose={() => {
                            setShowBeneficiaryProfilingModal(false);
                            setShowNewBeneficiaryPrompt(true);
                        }}
                        onSaved={(beneficiary) => {
                            setShowBeneficiaryProfilingModal(false);
                            setBeneficiaryPrefill({
                                beneficiaryId: typeof beneficiary.id === 'number' ? beneficiary.id : null,
                                beneficiaryType: beneficiary.beneficiaryType,
                                firstname: beneficiary.firstname || '',
                                lastname: beneficiary.lastname || '',
                                organizationName: beneficiary.organizationName || '',
                                phoneNumber: beneficiary.contactNumber || '',
                                province: beneficiary.province || '',
                                city: beneficiary.municipality || '',
                                barangay: beneficiary.barangay || '',
                                street: beneficiary.street || '',
                            });
                            setShowFormModal(true);
                        }}
                    />

                    {/* Form Modal */}
                    <DistributionFormModal
                        isOpen={showFormModal}
                        onClose={() => {
                            setShowFormModal(false);
                            setBeneficiaryPrefill(null);
                        }}
                        onSave={handleSaveDistribution}
                        batches={batches}
                        currentUserId={user?.id}
                        prefill={beneficiaryPrefill || undefined}
                    />

                    {/* Detail Modal */}
                    {showDetailModal && selectedDistribution && (
                        <DetailModal
                            distribution={selectedDistribution}
                            onClose={() => setShowDetailModal(false)}
                            onUpdate={handleUpdateDistribution}
                        />
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    {deleteTarget === 'single'
                                        ? 'Are you sure you want to delete this distribution? This action cannot be undone.'
                                        : `Are you sure you want to delete ${selectedIds.length} distribution(s)? This action cannot be undone.`
                                    }
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setSingleDeleteId(null);
                                        }}
                                        disabled={isDeleting}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <DistributionForm />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
