"use client";

import React from "react";

export type DistributionTableFilters = {
    search: string;
    species: string;
    dateFrom: string;
    dateTo: string;
    province: string;
    city: string;
    barangay: string;
};

type Props = {
    filters: DistributionTableFilters;
    onFilterChange: (field: keyof DistributionTableFilters, value: string) => void;
    onReset: () => void;
    provinceList: string[];
    cityList: string[];
    barangayList: string[];
};

const DistributionFilters: React.FC<Props> = ({ filters, onFilterChange, onReset, provinceList, cityList, barangayList }) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search beneficiary..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.search}
                        onChange={(e) => onFilterChange("search", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={filters.species}
                        onChange={(e) => onFilterChange("species", e.target.value)}
                    >
                        <option value="All">All Species</option>
                        <option value="Bangus">Bangus</option>
                        <option value="Tilapia">Tilapia</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.dateFrom}
                        onChange={(e) => onFilterChange("dateFrom", e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.dateTo}
                        onChange={(e) => onFilterChange("dateTo", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={filters.province}
                        onChange={(e) => onFilterChange("province", e.target.value)}
                    >
                        <option value="All">All Provinces</option>
                        {provinceList.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                        disabled={filters.province === "All"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={filters.city}
                        onChange={(e) => onFilterChange("city", e.target.value)}
                    >
                        <option value="All">All Cities</option>
                        {cityList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                    <select
                        disabled={filters.province === "All" || filters.city === "All"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={filters.barangay}
                        onChange={(e) => onFilterChange("barangay", e.target.value)}
                    >
                        <option value="All">All Barangays</option>
                        {barangayList.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onReset}
                        type="button"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default DistributionFilters;

