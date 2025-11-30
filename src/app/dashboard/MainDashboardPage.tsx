
// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    FiSearch,
    FiChevronDown,
    FiChevronUp,
    FiCreditCard,
    FiCheckCircle,
    FiAlertCircle,
    FiXCircle,
    FiPlus,
    FiFilter,
    FiDownload,
} from "react-icons/fi";

import { IoCarSport } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDeleteBookingModal from "@/components/ConfirmDeleteBookingModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import LoadingScreen from "@/components/LoadingScreen";
import { Booking, deleteBooking } from "../store/slices/bookingSlice";
import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";
import BookingRow from "./BookingTableRow";
import ErrorComponent from "@/components/ErrorComponent";
import { useBookings } from "@/lib/utils/hooks/useBookings";

type BookingStatus = Booking["status"];
type SortableField =
    | "createdAt"
    | "fullName"
    | "rentalCompany"
    | "mco"
    | "pickupDate"
    | "salesAgent";

type SortDirection = "ascending" | "descending";

export default function DashboardPage() {
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState<BookingStatus>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: SortableField;
        direction: SortDirection
    } | null>(null);

    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [deletedBookingId, setDeletedBookingId] = useState<string | null>(null);
    const { user } = useAppSelector((state) => state.auth);
    const { handleSuccessToast, handleErrorToast, showLoadingToast } = useToastHandler()

    // Use the custom hook for bookings
    const {
        bookings,
        loading,
        error,
        fetchBookings,
        refetchBookings
    } = useBookings();

    // Fetch bookings from API
    // useEffect(() => {
    //     dispatch(fetchBookings()).unwrap();
    // }, [dispatch]);

    // Fetch bookings on component mount
    useEffect(() => {
        const loadBookings = async () => {
            try {
                await fetchBookings({
                    showLoading: true,
                    successMessage: "Bookings loaded successfully"
                });
            } catch (error) {
                // Error is handled by the hook and will be displayed in the UI
                console.error("Failed to load bookings:", error);
            }
        };

        loadBookings();
    }, [fetchBookings]);

    // Manual refresh handler
    const handleRefresh = useCallback(async () => {
        try {
            await refetchBookings();
            handleSuccessToast("Bookings refreshed");
        } catch {
            // Error is already handled by the hook
        }
    }, [refetchBookings, handleSuccessToast]);



    const cancelBooking = useCallback(
        async (id: string) => {
            const toastId = showLoadingToast("Booking Deleting...")
            try {
                const resultAction = await dispatch(deleteBooking(id));

                if (deleteBooking.fulfilled.match(resultAction)) {
                    setIsOpenDeleteModal(false);
                    setDeletedBookingId(null);
                    handleSuccessToast("Booking deleted successfully", toastId);

                } else {
                    const errorMessage =
                        (resultAction.payload as string) || "Failed to delete booking";
                    setIsOpenDeleteModal(false);
                    setDeletedBookingId(null);
                    handleErrorToast(errorMessage, toastId);
                }

            } catch {
                setIsOpenDeleteModal(false);
                setDeletedBookingId(null);
                handleErrorToast("An unexpected error occurred while deleting booking", toastId);
            } finally {
                setIsOpenDeleteModal(false);
                setDeletedBookingId(null);
            }
        },
        [dispatch, handleErrorToast, handleSuccessToast , showLoadingToast]
    );

    const handleDeleteBooking = useCallback((id: string) => {
        setDeletedBookingId(id);
        setIsOpenDeleteModal(true);
    }, []);

    const handleSort = useCallback((key: SortableField) => {
        let direction: SortDirection = "ascending";
        if (sortConfig?.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    const sortedBookings = useMemo(() => {
        if (!sortConfig) return bookings;

        return [...bookings].sort((a, b) => {

            const { key, direction } = sortConfig;
            const aValue = a[key];
            const bValue = b[key];

            if (aValue == null || bValue == null) {
                if (aValue == null && bValue == null) return 0;
                return aValue == null ? (direction === "ascending" ? -1 : 1) : (direction === "ascending" ? 1 : -1);
            }

            const isLikelyDate = (value: unknown): boolean => {
                if (typeof value === 'string') {
                    const date = new Date(value);
                    return !isNaN(date.getTime());
                }
                return false;
            };

            if (isLikelyDate(aValue) && isLikelyDate(bValue)) {
                const aDate = new Date(aValue);
                const bDate = new Date(bValue);
                return direction === "ascending"
                    ? aDate.getTime() - bDate.getTime()
                    : bDate.getTime() - aDate.getTime();
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === "ascending"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === "ascending" ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [bookings, sortConfig]);

    const filteredBookings = useMemo(() => {
        return sortedBookings.filter((b) => {
            const matchesTab = activeTab === "ALL" || b.status === activeTab;
            const matchesSearch =
                b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [sortedBookings, activeTab, searchTerm]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getStatusIcon = useCallback((status: BookingStatus) => {
        switch (status) {
            case "BOOKED":
                return <FiCheckCircle className="w-4 h-4" />;
            case "MODIFIED":
                return <FiAlertCircle className="w-4 h-4" />;
            case "CANCELLED":
                return <FiXCircle className="w-4 h-4" />;
            default:
                return null;
        }
    }, []);

    const getStatusColor = useCallback((status: BookingStatus) => {
        switch (status) {
            case "BOOKED":
                return "bg-green-100 text-green-800 border-green-200";
            case "MODIFIED":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    }, []);

    // Stats for dashboard cards
    const dashboardStats = useMemo(() => {
        const today = new Date()
        const todayISODate = today.toISOString().split("T")[0]

        const totalRevenue = bookings.reduce((sum, booking) => {

            const createDate = new Date(booking.createdAt).toISOString().split("T")[0]

            if (createDate === todayISODate && booking.agentId === user?.id) {
                const mcoAmount = Number(booking?.mco)
                return sum + (mcoAmount || 0);
            }
            return sum;
        }, 0);

        const activeBookings = bookings.filter(b => b.status === "BOOKED").length;
        const modifiedBookings = bookings.filter(b => b.status === "MODIFIED").length;
        const cancelledBookings = bookings.filter(b => b.status === "CANCELLED").length;

        return [
            {
                title: "Total Revenue",
                value: `$${totalRevenue.toLocaleString()}`,
                change: "+12.5%",
                trend: "up",
                gradient: "from-blue-500 to-cyan-500",
                icon: FiCreditCard
            },
            {
                title: "Active Bookings",
                value: activeBookings.toString(),
                change: "+8.2%",
                trend: "up",
                gradient: "from-green-500 to-emerald-500",
                icon: FiCheckCircle
            },
            {
                title: "Modified",
                value: modifiedBookings.toString(),
                change: "-3.1%",
                trend: "down",
                gradient: "from-amber-500 to-orange-500",
                icon: FiAlertCircle
            },
            {
                title: "Cancelled",
                value: cancelledBookings.toString(),
                change: "+2.4%",
                trend: "up",
                gradient: "from-rose-500 to-red-500",
                icon: FiXCircle
            }
        ];
    }, [bookings, user?.id]);

    // Tab counts
    const statusCounts = useMemo(
        () => ({
            ALL: bookings.length,
            BOOKED: bookings.filter((b) => b.status === "BOOKED").length,
            MODIFIED: bookings.filter((b) => b.status === "MODIFIED").length,
            CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
        }),
        [bookings]
    );

    const tabs = useMemo(
        () => [
            { key: "ALL" as const, label: "All Bookings", count: statusCounts.ALL },
            {
                key: "BOOKED" as const,
                label: "Active Bookings",
                count: statusCounts.BOOKED,
            },
            {
                key: "MODIFIED" as const,
                label: "Modified",
                count: statusCounts.MODIFIED,
            },
            {
                key: "CANCELLED" as const,
                label: "Cancelled",
                count: statusCounts.CANCELLED,
            },
        ],
        [statusCounts]
    );

    if (loading) return <LoadingScreen />

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <ErrorComponent
                    title="Failed to Load Dashboard"
                    message="We couldn't load your dashboard data. This might be due to a network issue or server problem."
                    onRetry={handleRefresh}
                    onHome={() => window.location.href = '/'}
                    variant="server"
                    fullScreen
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                            <p className="text-slate-600 mt-2">Manage and track all your bookings in one place</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <FiDownload className="w-4 h-4" />
                                <span>Export</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <FiFilter className="w-4 h-4" />
                                <span>Filter</span>
                            </motion.button>
                            <Link href="/bookings/new">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    <span>New Booking</span>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                    {/* <div className={`flex items-center space-x-1 mt-2 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                    <span>{stat.change}</span>
                    <span>from last month</span>
                  </div> */}
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20"
                >
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search bookings by name, email, or phone number..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 bg-white/50 text-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20"
                >
                    <div className="flex flex-wrap gap-3">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {getStatusIcon(tab.key)}
                                {tab.label}
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Table Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
                >
                    {/* Table Header */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    {[
                                        { key: 'createdAt', label: 'Date' },
                                        { key: 'fullName', label: 'Customer' },
                                        { key: 'rentalCompany', label: 'Company' },
                                        { key: 'mco', label: 'MCO' },
                                        { key: 'pickupDate', label: 'Pickup Date' },
                                        { key: 'salesAgent', label: 'Sales Agent' },
                                    ].map(({ key, label }) => (
                                        <th
                                            key={key}
                                            className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort(key as SortableField)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {label}
                                                {sortConfig?.key === key && (
                                                    sortConfig.direction === 'ascending' ?
                                                        <FiChevronUp className="w-4 h-4" /> :
                                                        <FiChevronDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    // Skeleton Loader
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            {[...Array(8)].map((_, cellIndex) => (
                                                <td key={cellIndex} className="px-6 py-4">
                                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : currentItems.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <IoCarSport className="w-12 h-12 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                    No {activeTab.toLowerCase()} bookings found
                                                </h3>
                                                <p className="text-slate-600 mb-6">
                                                    Try adjusting your search or create a new booking
                                                </p>
                                                <Link href="/bookings/new">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                        <span>Create New Booking</span>
                                                    </motion.div>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Data Rows
                                    currentItems.map((booking) => (
                                        <BookingRow
                                            key={booking._id}
                                            booking={booking}
                                            expanded={expandedRow === booking._id}
                                            onExpand={() => setExpandedRow(expandedRow === booking._id ? null : booking._id ?? null)}
                                            onDelete={handleDeleteBooking}
                                            getStatusIcon={getStatusIcon}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white/50 px-6 py-4 border-t border-slate-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-600">
                                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                                    <span className="font-semibold">
                                        {Math.min(indexOfLastItem, filteredBookings.length)}
                                    </span> of <span className="font-semibold">{filteredBookings.length}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Previous
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {isOpenDeleteModal && (
                    <ConfirmDeleteBookingModal
                        isOpen={isOpenDeleteModal}
                        onClose={() => {
                            setIsOpenDeleteModal(false);
                        }}
                        onConfirm={() => {
                            if (deletedBookingId) {
                                cancelBooking(deletedBookingId);
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

