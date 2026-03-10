"use client";

import React, { useState } from "react";
import { AlertCircle, Eye, Fish, RotateCcw, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Distribution } from "@/app/components/types/data.types";

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

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
                        type="button"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {distribution.isDeleted ? (
                        <button
                            onClick={onRestore}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                            title="Restore"
                            type="button"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onDelete}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                            title="Delete"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        title={isExpanded ? "Show Less" : "Show More"}
                        type="button"
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
                        {distribution.forecastedHarvestKilos ? (
                            <div>
                                <span className="text-gray-500">Forecasted Harvest:</span>
                                <p className="font-medium text-blue-600">{distribution.forecastedHarvestKilos} kg</p>
                            </div>
                        ) : null}
                        {distribution.actualHarvestKilos ? (
                            <div>
                                <span className="text-gray-500">Actual Harvest:</span>
                                <p className="font-medium text-green-600">{distribution.actualHarvestKilos} kg</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

type Props = {
    isLoadingData: boolean;
    distributionsError: string;
    distributions: Distribution[];
    includeDeleted: boolean;
    distributionsDeletedCount: number;
    selectedIds: string[];
    selectedActiveIds: string[];
    selectedDeletedIds: string[];
    allVisibleSelected: boolean;
    totalDistributions: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    onSelectAll: () => void;
    onSelectRow: (id: string) => void;
    onViewDetails: (dist: Distribution) => void;
    onConfirmDelete: (id?: string) => void;
    onRestore: (ids: string[]) => void;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
};

const DistributionTable: React.FC<Props> = ({
    isLoadingData,
    distributionsError,
    distributions,
    includeDeleted,
    distributionsDeletedCount,
    selectedIds,
    selectedActiveIds,
    selectedDeletedIds,
    allVisibleSelected,
    totalDistributions,
    totalPages,
    currentPage,
    itemsPerPage,
    onSelectAll,
    onSelectRow,
    onViewDetails,
    onConfirmDelete,
    onRestore,
    onPageChange,
    onItemsPerPageChange
}) => {
    if (isLoadingData) {
        return (
            <div className="text-center py-12">
                <FullScreenLoader />
                <h3 className="text-lg font-semibold text-gray-600 mb-2 mt-4">Loading Distributions...</h3>
                <p className="text-gray-500">Please wait while we fetch the data</p>
            </div>
        );
    }

    if (distributionsError) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Failed to load distributions</h3>
                <p className="text-gray-600 mb-2">{distributionsError}</p>
                <p className="text-gray-500">Check your database connection and migrations, then refresh.</p>
            </div>
        );
    }

    return (
        <>
            <div className="text-sm text-gray-500 mb-2">
                Showing {distributions.length} of {totalDistributions} distributions
            </div>

            {distributions.length === 0 ? (
                <div className="text-center py-12">
                    <Fish className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    {!includeDeleted && distributionsDeletedCount > 0 && totalDistributions === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Distributions</h3>
                            <p className="text-gray-500 mb-6">You have {distributionsDeletedCount} deleted distribution(s).</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Distributions Found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                        </>
                    )}
                </div>
            ) : (
                <>
            {selectedIds.length > 0 ? (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedIds.length} item(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                        {selectedDeletedIds.length > 0 ? (
                            <button
                                onClick={() => onRestore(selectedDeletedIds)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                type="button"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restore Selected
                            </button>
                        ) : null}
                        {selectedActiveIds.length > 0 ? (
                            <button
                                onClick={() => onConfirmDelete()}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                type="button"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-center">
                                <input
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    onChange={onSelectAll}
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
                                            onChange={() => onSelectRow(dist.id)}
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
                                                onClick={() => onViewDetails(dist)}
                                                disabled={dist.isDeleted}
                                                className={dist.isDeleted ? "bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50" : "bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"}
                                                title={dist.isDeleted ? "View disabled for deleted records" : "View Details"}
                                                type="button"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {dist.isDeleted ? (
                                                <button
                                                    onClick={() => onRestore([dist.id])}
                                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                                                    title="Restore"
                                                    type="button"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onConfirmDelete(dist.id)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                                    title="Delete"
                                                    type="button"
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
                                                onClick={() => onViewDetails(dist)}
                                                disabled={dist.isDeleted}
                                                className={dist.isDeleted ? "bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed opacity-50" : "bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"}
                                                title={dist.isDeleted ? "View disabled for deleted records" : "View Details"}
                                                type="button"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {dist.isDeleted ? (
                                                <button
                                                    onClick={() => onRestore([dist.id])}
                                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors"
                                                    title="Restore"
                                                    type="button"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onConfirmDelete(dist.id)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                                    title="Delete"
                                                    type="button"
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

            <div className="block md:hidden">
                {distributions.map((dist) => (
                    <DistributionCard
                        key={dist.id}
                        distribution={dist}
                        onViewDetails={() => onViewDetails(dist)}
                        onDelete={() => onConfirmDelete(dist.id)}
                        onRestore={() => onRestore([dist.id])}
                    />
                ))}
            </div>

            {totalPages > 1 ? (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDistributions)}</span> of{" "}
                        <span className="font-medium">{totalDistributions}</span> distributions
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
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
                                            onClick={() => onPageChange(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            type="button"
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Per page:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            ) : null}
                </>
            )}
        </>
    );
};

export default DistributionTable;

