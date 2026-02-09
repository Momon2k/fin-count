"use client";
import React, { useEffect, useState } from "react";
import { Users, BarChart3, Package, UserCheck, TrendingUp, UserPlus, FileText, Building2, ChartNoAxesCombined, ChartColumnStacked, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useRouter } from "next/navigation";
import AsideNavigation from "../components/aside.navigation";

import { LogoutModal } from "@/app/components/logout.modal";
import { LogoutProvider } from "@/app/context/logout";
import { useNotification } from "@/app/context/notification";
import { withAuth } from "@/server/with.auth";

// TypeScript interfaces
interface ChartData {
    month: string;
    fingerlingCount: number;
}

// TypeScript interfaces
interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
}

interface StatData {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
}

const FullScreenLoader = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

// Statistics Card Component
const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className={`p-2 rounded-full ${bgColor}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
        </div>
        <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

// Statistics Overview Component
const StatisticsOverview: React.FC = () => {
    const [stats, setStats] = useState<StatData[]>([
        {
            title: "Total Fingerlings",
            value: "0",
            description: "Total fingerlings counted across all batches",
            icon: Package,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Active Batch",
            value: "0",
            description: "Currently active fingering batches",
            icon: BarChart3,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Admin Members",
            value: "0",
            description: "Total number of admin members",
            icon: UserCheck,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch sessions from external Railway API
                const sessionsResponse = await fetch('https://fincount-api-production.up.railway.app/api/sessions');
                const sessionsData = await sessionsResponse.json();

                const batchesResponse = await fetch('/api/batches?limit=1000');
                const batchesData = await batchesResponse.json();

                // Fetch all users (admin members)
                const usersResponse = await fetch('/api/user?userType=admin&limit=1000');
                const usersData = await usersResponse.json();

                // Process sessions data
                const sessions = sessionsData.success && sessionsData.data?.sessions ? sessionsData.data.sessions : [];

                const activeSessions = sessions.length; // All sessions from the API are considered active
                const totalAdmins = usersData.data?.pagination?.totalUsers || 0;

                // Calculate total fingerlings from all batches
                const totalFingerlings = batchesData.data?.batches?.reduce((sum: number, batch: any) => {
                    return sum + (batch.totalCount || 0);
                }, 0) || 0;

                // Update stats
                setStats([
                    {
                        title: "Total Fingerlings",
                        value: totalFingerlings.toLocaleString(),
                        description: "Total fingerlings counted across all sessions",
                        icon: Package,
                        bgColor: "bg-cyan-50",
                        iconColor: "text-cyan-600"
                    },
                    {
                        title: "Active Batch",
                        value: activeSessions.toString(),
                        description: "Currently active fingering batches",
                        icon: BarChart3,
                        bgColor: "bg-cyan-50",
                        iconColor: "text-cyan-600"
                    },

                    {
                        title: "Admin Members",
                        value: totalAdmins.toString(),
                        description: "Total number of admin members",
                        icon: UserCheck,
                        bgColor: "bg-cyan-50",
                        iconColor: "text-cyan-600"
                    }
                ]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="mb-8">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Statistics Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Statistics Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        </div>
    );
};

// Monthly Fingerling Count Chart Component
const MonthlyFingerlingsChart: React.FC = () => {
    // Sample data - replace with actual data from your API
    const chartData: ChartData[] = [
        { month: "Jan", fingerlingCount: 100 },
        { month: "Feb", fingerlingCount: 25 },
        { month: "Mar", fingerlingCount: 50 },
        { month: "Apr", fingerlingCount: 5 },
        { month: "May", fingerlingCount: 10 },
        { month: "Jun", fingerlingCount: 30 },
        { month: "Jul", fingerlingCount: 90 },
        { month: "Aug", fingerlingCount: 80 },
        { month: "Sep", fingerlingCount: 100 },
        { month: "Oct", fingerlingCount: 200 },
        { month: "Nov", fingerlingCount: 78 },
        { month: "Dec", fingerlingCount: 100 }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Fingerling Count</h3>
                <p className="text-sm text-gray-600">Track fingerling production across the year</p>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            domain={[0, 1]}
                            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="rect"
                            wrapperStyle={{ paddingBottom: '20px' }}
                        />
                        <Bar
                            dataKey="fingerlingCount"
                            fill="#67e8f9"
                            name="Fingerling Count"
                            radius={[2, 2, 0, 0]}
                            stroke="#22d3ee"
                            strokeWidth={1}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Quick Actions Component
interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
    textColor: string;
    hoverColor: string;
    route: string;
}

const QuickActions: React.FC = () => {
    const router = useRouter();

    const quickActions: QuickAction[] = [
        {
            title: "Add Users",
            description: "Register new staff or admin users",
            icon: UserPlus,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            textColor: "text-blue-700",
            hoverColor: "hover:bg-blue-100",
            route: "/admin/users"
        },
        {
            title: "View Reports",
            description: "Access system reports and analytics",
            icon: FileText,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            textColor: "text-green-700",
            hoverColor: "hover:bg-green-100",
            route: "/admin/reports"
        },
        {
            title: "Distribution Data",
            description: "Manage fingerling distribution records",
            icon: Building2,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            textColor: "text-purple-700",
            hoverColor: "hover:bg-purple-100",
            route: "/admin/distribution"
        },
        {
            title: "Data Visualization",
            description: "View charts and data insights",
            icon: ChartColumnStacked,
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
            textColor: "text-orange-700",
            hoverColor: "hover:bg-orange-100",
            route: "/admin/visualization"
        },
        {
            title: "Forecasting",
            description: "Predict future trends and patterns",
            icon: ChartNoAxesCombined,
            bgColor: "bg-cyan-50",
            iconColor: "text-cyan-600",
            textColor: "text-cyan-700",
            hoverColor: "hover:bg-cyan-100",
            route: "/admin/forecasting"
        }
    ];

    const handleActionClick = (route: string) => {
        router.push(route);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                    <p className="text-sm text-gray-600 mt-1">Frequently used actions for quick access</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => handleActionClick(action.route)}
                        className={`group relative ${action.bgColor} ${action.hoverColor} rounded-lg p-5 text-left transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${action.bgColor} ring-2 ring-white`}>
                                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                            </div>
                            <ArrowRight className={`h-5 w-5 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                        </div>
                        <h3 className={`text-base font-semibold ${action.textColor} mb-1`}>
                            {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {action.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const { isLoading, isAuthenticated, logout } = withAuth({
        userType: "admin",
        redirectTo: "/signin",
    });

    const { unreadCount } = useNotification();

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
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back! Here's what's happening with your system.</p>
                        </div>

                        {/* Statistics Overview */}
                        <StatisticsOverview />

                        {/* Quick Actions */}
                        <QuickActions />
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
            <AdminDashboard />
            <LogoutModal />
        </LogoutProvider>
    );
};

export default App;
