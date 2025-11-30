"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingButton from "@/components/LoadingButton";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import { ArrowLeft, Calendar, User, CreditCard, MapPin, Briefcase } from "lucide-react";
import TimePicker from "@/components/TimePicker";
import LoadingScreen from "@/components/LoadingScreen";
import { RootState } from "@/app/store/store";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { addRentalCompany, fetchRentalCompanies } from "@/app/store/slices/rentalCompanySlice";
import { motion, AnimatePresence } from "framer-motion";
import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";
import { clearBooking, fetchBookingById, saveBooking } from "@/app/store/slices/bookingSlice";
import { maskEmail, maskPhone } from "@/lib/utils/maskEmainAndPhoneNumber";

export default function BookingForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    // const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPastBooking, setIsPastBooking] = useState(false);
    const { rentalCompanies } = useAppSelector(
        (state: RootState) => state.rentalCompany
    );
    
    const { user } = useAppSelector(
        (state: RootState) => state.auth
    );

    const { currentBooking: booking, loading } = useAppSelector((state) => state.booking);

    const [otherRentalCompany, setOtherRentalCompany] = useState("");
    const { handleSuccessToast, handleErrorToast, showLoadingToast } = useToastHandler();

    const [form, setForm] = useState({
        _id: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        rentalCompany: "",
        confirmationNumber: "",
        vehicleImage: "",
        total: "",
        mco: "",
        payableAtPickup: "",
        pickupDate: "",
        dropoffDate: "",
        pickupTime: "",
        dropoffTime: "",
        pickupLocation: "",
        dropoffLocation: "",
        cardLast4: "",
        expiration: "",
        billingAddress: "",
        salesAgent: "",
        status: "BOOKED"
    });

    // Fetch rental companies on mount
    useEffect(() => {
        dispatch(fetchRentalCompanies());
    }, [dispatch]);

    // ✅ Auto-fill salesAgent when user is available
    useEffect(() => {
        if (!id && user?.name) {
            setForm((prev) => ({
                ...prev,
                salesAgent: user.name, // autofill sales agent
            }));
        }
    }, [user, id]);

    useEffect(() => {
        if (form.rentalCompany === "Other") {
            setOtherRentalCompany(form.rentalCompany);
            setForm(prev => ({ ...prev, rentalCompany: "" }));
        }
    }, [form.rentalCompany]);

    // Reset form when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearBooking());
        };
    }, [dispatch]);

    // Fetch booking data if ID is present in URL
    useEffect(() => {
        if (id && !form._id) {
            setIsEditing(true);
            dispatch(fetchBookingById(id));
        }
    }, [id, dispatch, form._id]);


    // When booking data changes → prefill form
    useEffect(() => {
        if (booking) {
            setForm({
                _id: booking._id || "",
                fullName: booking.fullName || "",
                email: booking.email || "",
                phoneNumber: booking.phoneNumber || "",
                rentalCompany: booking.rentalCompany || "",
                confirmationNumber: booking.confirmationNumber || "",
                vehicleImage: booking.vehicleImage || "",
                total: booking.total || "",
                mco: booking.mco || "",
                payableAtPickup: booking.payableAtPickup || "",
                pickupDate: booking.pickupDate || "",
                dropoffDate: booking.dropoffDate || "",
                pickupTime: booking.pickupTime || "",
                dropoffTime: booking.dropoffTime || "",
                pickupLocation: booking.pickupLocation || "",
                dropoffLocation: booking.dropoffLocation || "",
                cardLast4: booking.cardLast4 || "",
                expiration: booking.expiration || "",
                billingAddress: booking.billingAddress || "",
                salesAgent: user && user.name || "",
                status: booking.status || "BOOKED",
            });
        }
    }, [booking, user]);

    // Calculate MCO when total or payableAtPickup changes
    useEffect(() => {
        if (form.total && form.payableAtPickup) {
            const total = parseFloat(form.total) || 0;
            const payableAtPickup = parseFloat(form.payableAtPickup) || 0;
            const mco = total - payableAtPickup;

            if (mco >= 0) {
                setForm(prev => ({ ...prev, mco: mco.toFixed(2) }));
            }
        } else {
            setForm(prev => ({ ...prev, mco: "0.00" }));
        }
    }, [form.total, form.payableAtPickup]);

    // Check if booking is in the past
    useEffect(() => {
        if (form.pickupDate) {
            const pickupDate = new Date(form.pickupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            setIsPastBooking(pickupDate < today);
        }
    }, [form.pickupDate]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // setLoading(true);

        try {
            const companyName = form.rentalCompany.trim();
            if (!companyName) {
                handleErrorToast("Please enter or select a rental company.");
                return;
            }

            // 1️⃣ Check if company already exists in Redux store
            const companyExists = rentalCompanies.some((rc) => rc.name.toLowerCase() === companyName.toLowerCase());

            // 2️⃣ If it exists, proceed. If it's "Other", set flag to show input field
            if (companyExists && otherRentalCompany === "Other") {
                handleErrorToast("This rental company already exists. Please select it or choose 'Other'.");
                setForm(prev => ({ ...prev, rentalCompany: "" }));
                setOtherRentalCompany("");

                return;
            }

            // 3️⃣ If company doesn't exist & isn't 'Other', add it to MongoDB
            if (!companyExists && otherRentalCompany === "Other") {
                const result = await dispatch(addRentalCompany({ name: companyName }));
                if (addRentalCompany.rejected.match(result)) {
                    handleErrorToast(result?.payload || "Failed to add rental company");
                    setOtherRentalCompany(""); // reset
                    return;
                }
                handleSuccessToast(`Added new company: ${companyName}`);
                await dispatch(fetchRentalCompanies()); // refresh list
            }

            // Determine API endpoint and method
            // const url = isEditing ? `/api/bookings/${id}` : "/api/bookings";
            // const method = isEditing ? "PUT" : "POST";

            const allowedStatuses = ["BOOKED", "MODIFIED", "CANCELLED"] as const;

            // Prepare data for submission
            const formData = {
                ...form,
                total: form.total ? String(form.total) : "0",
                mco: form.mco ? String(form.mco) : "0",
                payableAtPickup: form.payableAtPickup ? String(form.payableAtPickup) : "0",
                status: allowedStatuses.includes(form.status as "BOOKED" | "MODIFIED" | "CANCELLED")
                    ? (form.status as "BOOKED" | "MODIFIED" | "CANCELLED")
                    : "BOOKED", // default fallback
            };

            console.log("formData new booking =>", formData)
            // 1️⃣ Show loading toast before API call
            const toastId = showLoadingToast(`Booking ${isEditing ? 'updateding...' : 'created...'}`);

            // 2️⃣ Call the API
            const result = await dispatch(saveBooking({
                formData,
                id: id || undefined,
            }));

            // 3️⃣ Handle failure
            if (saveBooking.rejected.match(result)) {
                handleErrorToast(result.payload || "Something went wrong", toastId);
                return;
            }

            // 4️⃣ Handle success
            handleSuccessToast(`Booking ${isEditing ? 'updated' : 'created'} successfully!`, toastId);
            router.push("/dashboard");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error";
            handleErrorToast(`Error: ${errorMessage}. Please try again.`);
        }
    }


    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200 self-start"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold">Back to Dashboard</span>
                    </motion.button>

                    <div className="text-center md:text-left">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                        >
                            {isEditing ? "Edit Reservation" : "Create New Reservation"}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-600 mt-2"
                        >
                            {isEditing ? "Update existing booking details" : "Create a new rental booking"}
                        </motion.p>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isPastBooking && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-white text-sm">!</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-amber-800">
                                        Past Booking
                                    </h3>
                                    <p className="text-amber-700 mt-1">
                                        You are editing a booking with a past pickup date.
                                        Some validations have been disabled to allow corrections.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Form Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-8 space-y-12">
                        {/* Section: Personal Information */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField
                                    label="Customer Name"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={id ? maskEmail(form.email) : form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />
                                <InputField
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={id ? maskPhone(form.phoneNumber) : form.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />
                            </div>
                        </motion.section>

                        {/* Section: Booking Details */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Booking Details</h2>
                            </div>

                            {/* Rental Company & Confirmation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Rental Company
                                    </label>
                                    {otherRentalCompany === "Other" || rentalCompanies.length === 0 ? (
                                        <input
                                            name="rentalCompany"
                                            value={form.rentalCompany}
                                            onChange={handleChange}
                                            placeholder="Enter rental company name"
                                            required
                                            className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                        />
                                    ) : (
                                        <select
                                            name="rentalCompany"
                                            value={form.rentalCompany}
                                            onChange={handleChange}
                                            className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                            required
                                        >
                                            <option value="">Select a company</option>
                                            {rentalCompanies.map((company) => (
                                                <option key={company._id} value={company.name}>
                                                    {company.name === "Other" ? "Other (Add new)" : company.name}
                                                </option>
                                            ))}
                                            {/* <option value="Other">Other (Add new)</option> */}
                                        </select>
                                    )}
                                </div>

                                <InputField
                                    label="Confirmation Number"
                                    name="confirmationNumber"
                                    value={form.confirmationNumber}
                                    onChange={handleChange}
                                    placeholder="Enter confirmation number"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />
                            </div>

                            {/* Vehicle Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Vehicle Type
                                </label>
                                <VehicleSelector
                                    value={form.vehicleImage}
                                    onChange={(url) => setForm((prev) => ({ ...prev, vehicleImage: url }))}
                                />
                            </div>

                            {/* Location and Date/Time Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="Pickup Location"
                                    name="pickupLocation"
                                    value={form.pickupLocation}
                                    onChange={handleChange}
                                    placeholder="Enter pickup location"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                />

                                <InputField
                                    label="Pickup Date"
                                    name="pickupDate"
                                    type="date"
                                    value={form.pickupDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const todayStr = new Date().toISOString().split("T")[0];
                                        setForm((prev) => ({
                                            ...prev,
                                            pickupDate: value < todayStr ? todayStr : value,
                                        }));
                                    }}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                                />

                                <TimePicker
                                    label="Pickup Time"
                                    name="pickupTime"
                                    value={form.pickupTime}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Drop-off Location"
                                    name="dropoffLocation"
                                    value={form.dropoffLocation}
                                    onChange={handleChange}
                                    placeholder="Enter drop-off location"
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                />

                                <InputField
                                    label="Drop-off Date"
                                    name="dropoffDate"
                                    type="date"
                                    value={form.dropoffDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const todayStr = new Date().toISOString().split("T")[0];
                                        setForm((prev) => ({
                                            ...prev,
                                            dropoffDate: value < todayStr ? todayStr : value,
                                        }));
                                    }}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                                />

                                <TimePicker
                                    label="Drop-off Time"
                                    name="dropoffTime"
                                    value={form.dropoffTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </motion.section>

                        {/* Section: Payment Information */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <CreditCard className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Payment Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                <InputField
                                    label="Total Amount ($)"
                                    name="total"
                                    value={form.total}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                    step="0.01"
                                    min="0"
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />

                                <InputField
                                    label="Payable at Pickup ($)"
                                    name="payableAtPickup"
                                    value={form.payableAtPickup}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />

                                <InputField
                                    label="MCO Amount"
                                    name="mco"
                                    value={form.mco}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    readOnly
                                    step="0.01"
                                    className="bg-slate-100 border-slate-200 text-slate-500"
                                />

                                <InputField
                                    label="Card Last 4 Digits"
                                    name="cardLast4"
                                    value={form.cardLast4}
                                    onChange={handleChange}
                                    placeholder="1234"
                                    maxLength={4}
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />

                                <InputField
                                    label="Expiration Date"
                                    name="expiration"
                                    type="month"
                                    value={form.expiration}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />

                                <div className="md:col-span-3 lg:col-span-5">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Billing Address
                                    </label>
                                    <textarea
                                        name="billingAddress"
                                        value={form.billingAddress}
                                        onChange={handleChange}
                                        placeholder="Enter complete billing address"
                                        rows={3}
                                        className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                                        required
                                    />
                                </div>
                            </div>
                        </motion.section>

                        {/* Section: Sales Agent */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                    <Briefcase className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Sales Agent</h2>
                            </div>


                            <InputField
                                label="Sales Agent"
                                name="salesAgent"
                                value={form.salesAgent}
                                placeholder="Sales agent name"
                                readOnly={true}
                                className="bg-slate-100 border-slate-200 text-slate-500"
                                icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                            />
                        </motion.section>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="pt-6"
                        >
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>{isEditing ? "Updating..." : "Creating..."}</span>
                                    </div>
                                ) : (
                                    <span>{isEditing ? "Update Booking" : "Create Booking"}</span>
                                )}
                            </LoadingButton>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}