"use client";
import React, { useState } from "react";
import { Users, Download, Filter, Calendar, ChevronDown, ChevronUp, RotateCcw, FileText, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import AsideNavigation from "../components/aside.navigation";

import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";
import { getCitiesForProvinceWithBarangays, locationData } from "@/app/components/data/location.data";

// TypeScript interfaces
interface ReportFilters {
    reportType: string;
    species: string;
    startDate: string;
    endDate: string;
    province?: string;
    city?: string;
    barangay?: string;
}

interface ReportData {
    id: string;
    date: string;
    reportType: string;
    species: string;
    count: number;
    status: string;
}

interface BatchData {
    id: string;
    batchNumber: string;
    species: string;
    quantity: number;
    dateCreated: string;
    status: string;
    staffName: string;
}

interface DistributedBatchData {
    id: string;
    batchNumber: string;
    species: string;
    quantity: number;
    dateCreated: string;
    distributionDate: string;
    beneficiaryLocation: string;
    staffName: string;
    status: string;
}

interface BeneficiaryData {
    id: string;
    province: string;
    city: string;
    barangay: string;
    beneficiaryCount: number;
    totalFingerlings: number;
    beneficiaryName: string;
}

interface OverdueHarvestData {
    id: string;
    batchNumber: string;
    species: string;
    quantity: number;
    distributionDate: string;
    expectedHarvestDate: string;
    daysOverdue: number;
    beneficiaryLocation: string;
    beneficiaryName: string;
    staffName: string;
    contactNumber: string;
    status: string;
}

const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Export to CSV utility function
const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV values
                return typeof value === 'string' && value.includes(',')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const toLocalISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// Report Filters Component
const ReportFiltersComponent: React.FC<{
    onReportTypeChange: (reportType: string, filters: ReportFilters) => void;
    onApplyFilters: (reportType: string, filters: ReportFilters) => void;
}> = ({ onReportTypeChange, onApplyFilters }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [filters, setFilters] = useState<ReportFilters>(() => ({
        reportType: "Fingerling Count",
        species: "All Species",
        startDate: "2023-01-01",
        endDate: toLocalISODate(new Date()),
        province: "All Provinces",
        city: "All Cities",
        barangay: "All Barangays"
    }));

    // Get available cities based on selected province
    const getAvailableCities = (): string[] => {
        if (!filters.province || filters.province === "All Provinces") {
            return [];
        }
        return getCitiesForProvinceWithBarangays(filters.province);
    };

    // Get available barangays based on selected city
    const getAvailableBarangays = (): string[] => {
        if (!filters.province || filters.province === "All Provinces" || !filters.city || filters.city === "All Cities") {
            return [];
        }
        return locationData.barangays[filters.province]?.[filters.city] || [];
    };

    const handleFilterChange = (field: keyof ReportFilters, value: string) => {
        // Handle cascading updates for location filters
        if (field === 'reportType') {
            const nextFilters = {
                ...filters,
                reportType: value,
            };
            setFilters(nextFilters);
            onReportTypeChange(nextFilters.reportType, nextFilters);
        } else if (field === 'province') {
            setFilters(prev => ({
                ...prev,
                province: value,
                city: "All Cities",
                barangay: "All Barangays"
            }));
        } else if (field === 'city') {
            setFilters(prev => ({
                ...prev,
                city: value,
                barangay: "All Barangays"
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleApplyFilters = () => {
        console.log("Applying filters:", filters);
        onApplyFilters(filters.reportType, filters);
    };

    const handleReset = () => {
        const resetFilters = {
            reportType: "Fingerling Count",
            species: "All Species",
            startDate: "2023-01-01",
            endDate: toLocalISODate(new Date()),
            province: "All Provinces",
            city: "All Cities",
            barangay: "All Barangays"
        };
        setFilters(resetFilters);
        onReportTypeChange("Fingerling Count", resetFilters);
    };

    const showLocationFilters = filters.reportType === "Beneficiaries Report";
    const showSpeciesFilter = true; // Show species filter for all report types
    const showDateFilters = true; // Show date filters for all report types

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div
                className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    <span className="font-medium">Report Filters</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                ) : (
                    <ChevronDown className="h-5 w-5" />
                )}
            </div>

            {isExpanded && (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Report Type */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4 mr-1 text-blue-600" />
                                Report Type
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.reportType}
                                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                >
                                    <option value="Fingerling Count">Fingerling Count</option>
                                    <option value="Undistributed Batches">Undistributed Batches</option>
                                    <option value="Distributed Batches">Distributed Batches</option>
                                    <option value="Beneficiaries Report">Beneficiaries Report</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Species - Show for all reports except Beneficiaries Report */}
                        {showSpeciesFilter && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Users className="h-4 w-4 mr-1 text-blue-600" />
                                    Species
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.species}
                                        onChange={(e) => handleFilterChange('species', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    >
                                        <option value="All Species">All Species</option>
                                        <option value="Tilapia">Red Tilapia</option>
                                        <option value="Bangus">Bangus</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Location Filters for Beneficiaries Report and Overdue Harvest Report */}
                        {showLocationFilters && (
                            <>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                                        Province
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.province}
                                            onChange={(e) => handleFilterChange('province', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="All Provinces">All Provinces</option>
                                            {locationData.provinces.map((province) => (
                                                <option key={province} value={province}>
                                                    {province}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                                        City
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.city}
                                            onChange={(e) => handleFilterChange('city', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                            disabled={!filters.province || filters.province === "All Provinces"}
                                        >
                                            <option value="All Cities">All Cities</option>
                                            {getAvailableCities().map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                                        Barangay
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.barangay}
                                            onChange={(e) => handleFilterChange('barangay', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                            disabled={!filters.city || filters.city === "All Cities"}
                                        >
                                            <option value="All Barangays">All Barangays</option>
                                            {getAvailableBarangays().map((barangay) => (
                                                <option key={barangay} value={barangay}>
                                                    {barangay}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Start Date - Hidden for Overdue Harvest Report */}
                        {showDateFilters && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                                    Start Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* End Date - Hidden for Overdue Harvest Report */}
                        {showDateFilters && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                                    End Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleApplyFilters}
                            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-200 focus:outline-none"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Fingerling Count Report Component
const FingerlingsCountReportView: React.FC<{ filters: ReportFilters; isApplied: boolean }> = ({ filters, isApplied }) => {
    const [data, setData] = React.useState<any[]>([]);
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);

    React.useEffect(() => {
        fetchData();
        setCurrentPage(1);
    }, [filters, isApplied]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (!isApplied) {
                params.append("mode", "overview");
                params.append("limit", "5");
            } else {
                params.append("startDate", filters.startDate);
                params.append("endDate", filters.endDate);
                params.append("species", filters.species);
            }
            const response = await fetch(`/api/reports/fingerling-count?${params}`);
            const result = await response.json();
            if (result.success) {
                const sorted = [...(result.data || [])].sort((a: any, b: any) => {
                    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                    if (dateDiff !== 0) return dateDiff;
                    return String(a.species || "").localeCompare(String(b.species || ""));
                });
                setData(sorted);
                setSummary(result.summary);
            }
        } catch (error) {
            console.error("Error fetching fingerling count report:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = isApplied ? data.slice(startIndex, endIndex) : data;

    const handleExportCSV = () => {
        const csvData = data.map(item => ({
            Date: item.date,
            Species: item.species,
            "Total Fingerlings": item.totalFingerlings,
            "Distribution Count": item.distributionCount,
        }));

        // Add total row to CSV export
        if (summary) {
            csvData.push({
                Date: "Overall Total",
                Species: "",
                "Total Fingerlings": summary.grandTotal || 0,
                "Distribution Count": summary.totalDistributions || 0,
            });
        }

        exportToCSV(csvData, "fingerling_count_report");
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <FullScreenLoader />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Fingerling Count Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {isApplied ? (
                            <span>{new Date(filters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(filters.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        ) : (
                            <span>Recent Distributions (last 5)</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                {data.length > 0 ? (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fingerlings</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution Count</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.species}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.totalFingerlings.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.distributionCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={2}>
                                        Overall Total
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                                        {summary?.grandTotal ? summary.grandTotal.toLocaleString() : '0'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                                        {summary?.totalDistributions ? summary.totalDistributions.toLocaleString() : '0'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {isApplied && totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
                                    <span className="font-medium">{data.length}</span> results
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Page</span>
                                        <select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <option key={page} value={page}>
                                                    {page}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-sm text-gray-700">of {totalPages}</span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No data found for the selected filters</h4>
                        <p className="text-gray-500">
                            There are no fingerling count records available for the date range and filters you've selected.
                        </p>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">
                                Try adjusting your date range or species filter to see available data.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Undistributed Batches Report Component
const UndistributedBatchesReportView: React.FC<{ filters: ReportFilters }> = ({ filters }) => {
    const [data, setData] = React.useState<any[]>([]);
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                species: filters.species,
            });
            const response = await fetch(`/api/reports/undistributed-batches?${params}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
                setSummary(result.summary);
            }
        } catch (error) {
            console.error("Error fetching undistributed batches report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const csvData = data.map(session => ({
            "Batch ID": session.batch_id,
            "Species": session.species,
            "Location": session.location,
            "Notes": session.notes,
            "Counts": session.counts,
            "Timestamp": new Date(session.timestamp).toLocaleString(),
        }));
        exportToCSV(csvData, "undistributed_batches_report");
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <FullScreenLoader />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Undistributed Batches Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Session data from external API</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={data.length === 0}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                </div>
            </div>


            {/* Report Content */}
            <div className="overflow-x-auto">
                {data.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((session: any) => (
                                <tr key={session.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.batch_id || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.species}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.location}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={session.notes}>
                                        {session.notes || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.counts.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(session.timestamp).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <AlertTriangle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h4>
                        <p className="text-gray-500">No session data available for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// New Distributed Batches Report Component
const DistributedBatchesReportView: React.FC<{ filters: ReportFilters }> = ({ filters }) => {
    const [data, setData] = React.useState<any[]>([]);
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);

    React.useEffect(() => {
        fetchData();
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                species: filters.species,
            });
            const response = await fetch(`/api/reports/distributed-batches?${params}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
                setSummary(result.summary);
            }
        } catch (error) {
            console.error("Error fetching distributed batches report:", error);
        } finally {
            setLoading(false);
        }
    };

    // Flatten data for pagination
    const flattenedData = React.useMemo(() => {
        const flattened: any[] = [];
        data.forEach(batch => {
            if (batch.distributions && batch.distributions.length > 0) {
                batch.distributions.forEach((dist: any) => {
                    const rawKilos = dist.forecastedHarvestKilos;
                    const parsedKilos =
                        rawKilos === null || rawKilos === undefined || rawKilos === ""
                            ? null
                            : Number(rawKilos);
                    const forecastedKilos =
                        parsedKilos !== null && !Number.isNaN(parsedKilos) && parsedKilos > 0
                            ? parsedKilos
                            : null;

                    const rawActual = dist.actualHarvestKilos;
                    const parsedActual =
                        rawActual === null || rawActual === undefined || rawActual === ""
                            ? null
                            : Number(rawActual);
                    const actualKilos =
                        parsedActual !== null && !Number.isNaN(parsedActual)
                            ? parsedActual
                            : null;

                    flattened.push({
                        batchId: batch.batchNumber,
                        beneficiaryName: dist.beneficiaryName,
                        species: batch.species,
                        totalCount: dist.fingerlings || 0,
                        forecastedKilos,
                        actualKilos,
                        dateDistributed: batch.dateDistributed,
                    });
                });
            }
        });
        return flattened.sort((a, b) => {
            const aDate = a.dateDistributed ? new Date(a.dateDistributed).getTime() : 0;
            const bDate = b.dateDistributed ? new Date(b.dateDistributed).getTime() : 0;
            return bDate - aDate;
        });
    }, [data]);

    // Calculate pagination
    const totalPages = Math.ceil(flattenedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = flattenedData.slice(startIndex, endIndex);

    const handleExportCSV = () => {
        const csvData = flattenedData.map(item => ({
            "Batch ID": item.batchId,
            "Beneficiaries Name": item.beneficiaryName,
            "Species": item.species,
            "Total Count": item.totalCount,
            "Forecasted Kg": item.forecastedKilos !== null ? item.forecastedKilos : "-",
            "Actual Kg": item.actualKilos !== null ? item.actualKilos : "-",
        }));
        exportToCSV(csvData, "distributed_batches_report");
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <FullScreenLoader />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Distributed Batches Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Successfully distributed batches</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={data.length === 0}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                {flattenedData.length > 0 ? (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiaries Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted Kg</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Kg</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.map((item, index) => (
                                    <tr key={`${item.batchId}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.batchId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.beneficiaryName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.species}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalCount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.forecastedKilos !== null
                                                ? `${item.forecastedKilos.toLocaleString()} kg`
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.actualKilos !== null
                                                ? `${item.actualKilos.toLocaleString()} kg`
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, flattenedData.length)}</span> of{' '}
                                    <span className="font-medium">{flattenedData.length}</span> results
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Page</span>
                                        <select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <option key={page} value={page}>
                                                    {page}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-sm text-gray-700">of {totalPages}</span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No distributed batches found</h4>
                        <p className="text-gray-500">No batches have been distributed for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Beneficiaries Report Component
const BeneficiariesReportView: React.FC<{ filters: ReportFilters }> = ({ filters }) => {
    const [data, setData] = React.useState<any[]>([]);
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [filterConfig, setFilterConfig] = React.useState<any>({
        hasProvince: true,
        hasCity: true,
        hasBarangay: true,
    });

    React.useEffect(() => {
        fetchData();
        setCurrentPage(1);
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append("startDate", filters.startDate);
            }
            if (filters.endDate) {
                params.append("endDate", filters.endDate);
            }
            if (filters.province && filters.province !== "All Provinces") {
                params.append("province", filters.province);
            }
            if (filters.city && filters.city !== "All Cities") {
                params.append("city", filters.city);
            }
            if (filters.barangay && filters.barangay !== "All Barangays") {
                params.append("barangay", filters.barangay);
            }
            if (filters.species && filters.species !== "All Species") {
                params.append("species", filters.species);
            }

            const response = await fetch(`/api/reports/beneficiaries?${params}`);
            const result = await response.json();
            if (result.success) {
                const sorted = [...(result.data || [])].sort((a: any, b: any) => {
                    const dateDiff = new Date(b.dateDistributed).getTime() - new Date(a.dateDistributed).getTime();
                    if (dateDiff !== 0) return dateDiff;
                    return String(a.province || "").localeCompare(String(b.province || ""));
                });
                setData(sorted);
                setSummary(result.summary);
                setFilterConfig(result.filters);
            }
        } catch (error) {
            console.error("Error fetching beneficiaries report:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const formatLocation = (b: any) => {
        const parts = [
            b.barangay && b.barangay !== "N/A" ? b.barangay : null,
            b.municipality || null,
            b.province || null,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "-";
    };

    const handleExportCSV = () => {
        const csvData = data.map(beneficiary => ({
            Location: formatLocation(beneficiary),
            "Beneficiary Name": beneficiary.beneficiaryName,
            Species: beneficiary.species,
            "Total Fingerlings": beneficiary.totalFingerlings,
            "Contact Number": beneficiary.contactNumber || "N/A",
            "Date Distributed": new Date(beneficiary.dateDistributed).toLocaleDateString(),
        }));
        exportToCSV(csvData, "beneficiaries_report");
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <FullScreenLoader />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Report Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Beneficiaries Report</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Distribution-driven beneficiaries</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 focus:outline-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
                {data.length > 0 ? (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fingerlings</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Distributed</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.map((beneficiary, index) => (
                                    <tr key={beneficiary.id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{formatLocation(beneficiary)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{beneficiary.beneficiaryName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.species}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.totalFingerlings.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beneficiary.contactNumber || "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(beneficiary.dateDistributed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
                                    <span className="font-medium">{data.length}</span> results
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Page</span>
                                        <select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <option key={page} value={page}>
                                                    {page}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-sm text-gray-700">of {totalPages}</span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No beneficiaries found</h4>
                        <p className="text-gray-500">No beneficiary data available for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Report Display Component
const ReportDisplay: React.FC<{ reportType: string; filters: ReportFilters; isFingerlingCountApplied: boolean }> = ({ reportType, filters, isFingerlingCountApplied }) => {
    switch (reportType) {
        case "Fingerling Count":
            return <FingerlingsCountReportView filters={filters} isApplied={isFingerlingCountApplied} />;
        case "Undistributed Batches":
            return <UndistributedBatchesReportView filters={filters} />;
        case "Distributed Batches":
            return <DistributedBatchesReportView filters={filters} />;
        case "Beneficiaries Report":
            return <BeneficiariesReportView filters={filters} />;
        default:
            return <FingerlingsCountReportView filters={filters} isApplied={isFingerlingCountApplied} />;
    }
};

const Reports: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();
    const [currentReportType, setCurrentReportType] = useState<string>("Fingerling Count");
    const [currentFilters, setCurrentFilters] = useState<ReportFilters>(() => ({
        reportType: "Fingerling Count",
        species: "All Species",
        startDate: "2023-01-01",
        endDate: toLocalISODate(new Date()),
        province: "All Provinces",
        city: "All Cities",
        barangay: "All Barangays"
    }));
    const [isFingerlingCountApplied, setIsFingerlingCountApplied] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Update current date and time every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleReportTypeChange = (reportType: string, filters: ReportFilters) => {
        setCurrentReportType(reportType);
        setCurrentFilters(filters);
        setIsFingerlingCountApplied(reportType !== "Fingerling Count");
    };

    const handleApplyFilters = (reportType: string, filters: ReportFilters) => {
        setCurrentReportType(reportType);
        setCurrentFilters(filters);
        if (reportType === "Fingerling Count") {
            setIsFingerlingCountApplied(true);
        }
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

    return (
        <>
            <AsideNavigation onLogout={logout} unreadNotificationCount={unreadCount} />
            <div className="grid grid-cols-6 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
                <div className="col-start-1 sm:col-start-1 md:col-start-1 lg:col-start-2 xl:col-start-2 col-span-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-5 pt-20 pb-8 sm:px-6 sm:py-8">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
                                <p className="text-gray-600">Generate and analyze fingerling data reports</p>
                            </div>
                        </div>

                        {/* Date and Time Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-blue-700 mb-2 sm:mb-0">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="font-medium">
                                    {currentDateTime.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center text-blue-700">
                                <span className="font-medium">
                                    {currentDateTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Report Filters */}
                        <ReportFiltersComponent onReportTypeChange={handleReportTypeChange} onApplyFilters={handleApplyFilters} />

                        {/* Report Display */}
                        <ReportDisplay reportType={currentReportType} filters={currentFilters} isFingerlingCountApplied={isFingerlingCountApplied} />
                    </div>
                </div>
            </div>
        </>
    );
};

// Main App Component with LogoutProvider wrapper
const App: React.FC = () => {
    return (
        <LogoutProvider>
            <Reports />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
