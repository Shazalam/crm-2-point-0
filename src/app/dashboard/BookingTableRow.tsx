import { Booking } from "../store/slices/bookingSlice";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    FiEdit,
    FiChevronDown,
    FiChevronUp,
    FiCalendar,
    FiUser,
    FiCreditCard,
    FiMapPin,
    FiBriefcase,
    FiXCircle,
    FiEye,
    FiTrash2
} from "react-icons/fi";
import { IoCarSport } from "react-icons/io5";
import DetailCard from "./BookingDetailCard";

type BookingStatus = Booking["status"];
// Enhanced Booking Row Component
interface BookingRowProps {
    booking: Booking;
    expanded: boolean;
    onExpand: () => void;
    onDelete: (id: string) => void;
    getStatusIcon: (status: BookingStatus) => React.ReactElement | null;
    getStatusColor: (status: BookingStatus) => string;
}

export default function BookingRow({
    booking,
    expanded,
    onExpand,
    onDelete,
    getStatusIcon,
    getStatusColor
}: BookingRowProps) {
    return (
        <>
            <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-200"
                onClick={onExpand}
            >
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                        {new Date(booking.createdAt).toLocaleDateString('en-CA', {
                            timeZone: 'America/Vancouver',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">{booking.fullName}</div>
                            <div className="text-sm text-slate-500">
                                {(() => {
                                    const [localPart, domain] = booking.email.split('@');
                                    return `${localPart.slice(0, 2)}******${localPart.slice(-3)}@${domain}`;
                                })()}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{booking.rentalCompany}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">${Number(booking.mco).toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                        {new Date(booking.pickupDate).toLocaleDateString()}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{booking.salesAgent}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-5">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Link
                                href={`/bookings/new?id=${booking._id}`}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FiEdit className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {booking.status !== "CANCELLED" && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Link
                                    href={`/bookings/modification?id=${booking._id}`}
                                    className="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50 transition-all duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FiEdit className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand();
                            }}
                            className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
                        >
                            {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </motion.button>
                    </div>
                </td>
            </motion.tr>

            {/* Expanded Row Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <td colSpan={8} className="px-6 py-6 bg-slate-50/80">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <DetailCard
                                    icon={FiUser}
                                    title="Customer Details"
                                    items={[
                                        { label: "Phone", value: `******${booking.phoneNumber.slice(-4)}` },
                                        {
                                            label: "Email", value: (() => {
                                                const [localPart, domain] = booking.email.split('@');
                                                return `${localPart.slice(0, 2)}******${localPart.slice(-3)}@${domain}`;
                                            })()
                                        }
                                    ]}
                                />

                                <DetailCard
                                    icon={IoCarSport}
                                    title="Rental Details"
                                    items={[
                                        { label: "Total", value: `$${Number(booking.total)}` },
                                        { label: "Payable at Pickup", value: `$${Number(booking.payableAtPickup).toFixed(2)}` }
                                    ]}
                                />

                                <DetailCard
                                    icon={FiCalendar}
                                    title="Dates & Locations"
                                    items={[
                                        { label: "Pickup", value: booking.pickupLocation },
                                        { label: "Dropoff", value: booking.dropoffLocation },
                                        { label: "Dates", value: `${new Date(booking.pickupDate).toLocaleDateString()} - ${new Date(booking.dropoffDate).toLocaleDateString()}` }
                                    ]}
                                />

                                <DetailCard
                                    icon={FiCreditCard}
                                    title="Payment Details"
                                    items={[
                                        { label: "Card", value: `**** ${booking.cardLast4}` },
                                        { label: "Expires", value: booking.expiration }
                                    ]}
                                />

                                <DetailCard
                                    icon={FiMapPin}
                                    title="Billing Address"
                                    items={[
                                        { label: "Address", value: booking.billingAddress }
                                    ]}
                                />

                                <DetailCard
                                    icon={FiBriefcase}
                                    title="Sales Info"
                                    items={[
                                        { label: "Agent", value: booking.salesAgent }
                                    ]}
                                />
                            </motion.div>

                            <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
                                {/* ✅ Delete Button (Left Side) */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onDelete(booking._id!)} // <-- Call delete function
                                    className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </motion.div>

                                {/* ✅ View & Cancel Buttons (Right Side) */}
                                <div className="flex flex-wrap gap-3 justify-end">
                                    <Link href={`/bookings/${booking._id}/view`}>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            <span>View Full Details</span>
                                        </motion.div>
                                    </Link>

                                    {booking.status !== "CANCELLED" && (
                                        <Link href={`/bookings/cancellation?id=${booking._id}`}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                                            >
                                                <FiXCircle className="w-4 h-4" />
                                                <span>Cancel Booking</span>
                                            </motion.div>
                                        </Link>
                                    )}
                                </div>
                            </div>

                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
}
