"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { ArrowLeft, AlertTriangle, Calculator, User, Calendar, MapPin, CreditCard, Briefcase, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearBooking, fetchBookingById } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";
import { Booking } from "@/lib/types/booking";
import TimePicker from "@/components/TimePicker";
import { fetchCurrentUserThunk } from "@/app/store/slices/authSlice";
import { RootState } from "@/app/store/store";
import { addRentalCompany, fetchRentalCompanies } from "@/app/store/slices/rentalCompanySlice";
import { useToastHandler } from "@/lib/hooks/useToastHandler";
import { maskEmail, maskPhone } from "@/lib/utils/maskEmainAndPhoneNumber";

export default function CancellationForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { currentBooking, loading, error } = useAppSelector((state) => state.booking);
    const { user } = useAppSelector((state) => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExistingCustomer] = useState(!!id);
    const [cancellationFee, setCancellationFee] = useState("");
    const { rentalCompanies } = useAppSelector(
        (state: RootState) => state.rentalCompany
    );

    const [form, setForm] = useState<Booking>({
        id: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        rentalCompany: "",
        confirmationNumber: "",
        vehicleImage: "",
        total: "",
        mco: "",
        modificationFee: [],
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
        status: "CANCELLED",
        dateOfBirth: "",
        refundAmount: ""
    });

    const [otherRentalCompany, setOtherRentalCompany] = useState("");
    const { handleSuccessToast, handleErrorToast } = useToastHandler();

    // Fetch rental companies on mount
    useEffect(() => {
        if (rentalCompanies && rentalCompanies.length !== 0) return

        (
            async () => {
                try {
                    dispatch(fetchRentalCompanies()).unwrap()
                } catch (error) {
                    handleErrorToast(
                        error instanceof Error ? error.message : "Failed to fetch rental companies"
                    )
                }
            }
        )()

    }, [dispatch, rentalCompanies, handleErrorToast]);

    useEffect(() => {
        if (form.rentalCompany === "Other") {
            setOtherRentalCompany(form.rentalCompany);
            setForm(prev => ({ ...prev, rentalCompany: "" }));
        }
    }, [form.rentalCompany]);

    // Fetch booking data when component mounts or id changes
    useEffect(() => {
        if (!id) return
        if (currentBooking?._id) return

        (async () => {
            try {
                dispatch(fetchBookingById(id))
                    .unwrap()
            } catch (error) {
                handleErrorToast(
                    error instanceof Error ? error.message : "Failed to fetch booking"
                );
            }
        }
        )()
    }, [id, dispatch, router, handleErrorToast, currentBooking?._id]);


    // Update form when booking data is available
    useEffect(() => {
        if (currentBooking && id) {
            setForm({
                id: currentBooking._id || "",
                fullName: currentBooking.fullName || "",
                email: currentBooking.email || "",
                phoneNumber: currentBooking.phoneNumber || "",
                rentalCompany: currentBooking.rentalCompany || "",
                confirmationNumber: currentBooking.confirmationNumber || "",
                vehicleImage: currentBooking.vehicleImage || "",
                total: currentBooking.total?.toString() || "",
                mco: currentBooking.mco?.toString() || "",
                modificationFee: currentBooking.modificationFee || [],
                payableAtPickup: currentBooking.payableAtPickup?.toString() || "",
                pickupDate: currentBooking.pickupDate || "",
                dropoffDate: currentBooking.dropoffDate || "",
                pickupTime: currentBooking.pickupTime || "",
                dropoffTime: currentBooking.dropoffTime || "",
                pickupLocation: currentBooking.pickupLocation || "",
                dropoffLocation: currentBooking.dropoffLocation || "",
                cardLast4: currentBooking.cardLast4 || "",
                expiration: currentBooking.expiration || "",
                billingAddress: currentBooking.billingAddress || "",
                salesAgent: user && user?.name || "",
                status: "CANCELLED",
                dateOfBirth: currentBooking.dateOfBirth || "",
                refundAmount: ""
            });
        }
    }, [currentBooking, id, user]);

    // Fetch current user using Redux thunk
    useEffect(() => {
        if (user?.id) return

        (async () => {
            try {
                dispatch(fetchCurrentUserThunk())
                    .unwrap()
                    .then((userData) => {
                        setForm((prev) => ({ ...prev, salesAgent: userData.name }));
                    })
                    .catch((error) => {
                        console.error("Failed to fetch user:", error);
                        handleErrorToast("Failed to load user information");
                    });
            } catch (error) {
                handleErrorToast(
                    error instanceof Error ? error.message : "Failed to load user information"
                );
            }
        })()

    }, [dispatch, handleErrorToast, user?.id]);

    useEffect(() => {
        if (user?.id) {
            setForm((prev) => ({ ...prev, salesAgent: user.name }));
        }
    }, [user])

    // Calculate refund and update MCO with cancellation fee
    const calculateRefund = () => {
        if (isExistingCustomer && form.mco && cancellationFee) {
            const mco = parseFloat(form.mco) || 0;
            const fee = parseFloat(cancellationFee) || 0;
            const refund = mco - fee;

            setForm((prev) => ({
                ...prev,
                refundAmount: refund >= 0 ? refund.toFixed(2) : "0.00",
                mco:fee.toString()
            }));
        }
    };

    // Reset form when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearBooking());
        };
    }, [dispatch]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value } as Booking));
    };

    // Handle form submission for cancellation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const companyName = form.rentalCompany.trim();
            if (!companyName) {
                handleErrorToast("Please enter or select a rental company.");
                return;
            }

            // Check if company already exists in Redux store
            const companyExists = rentalCompanies.some((rc) => rc.name.toLowerCase() === companyName.toLowerCase());

            // If it exists, proceed. If it's "Other", set flag to show input field
            if (companyExists && otherRentalCompany === "Other") {
                handleErrorToast("This rental company already exists. Please select it or choose 'Other'.");
                setForm(prev => ({ ...prev, rentalCompany: "" }));
                setOtherRentalCompany("");
                return;
            }

            // If company doesn't exist & isn't 'Other', add it to MongoDB
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

            console.log("cancellation Fee =>", form)

            // Prepare data for API
            const requestData = {
                bookingId: isExistingCustomer ? form.id : undefined,
                email: form.email,
                customerType: isExistingCustomer ? "existing" : "new",
                refundAmount: form.refundAmount,
                salesAgent: form.salesAgent,
                mco:cancellationFee,
                // For new customers, include all necessary booking details
                ...(isExistingCustomer ? {} : {
                    fullName: form.fullName,
                    phoneNumber: form.phoneNumber,
                    rentalCompany: form.rentalCompany,
                    confirmationNumber: form.confirmationNumber,
                    total: form.total,
                    mco: cancellationFee,
                    payableAtPickup: form.payableAtPickup,
                    pickupDate: form.pickupDate,
                    dropoffDate: form.dropoffDate,
                    pickupTime: form.pickupTime,
                    dropoffTime: form.dropoffTime,
                    pickupLocation: form.pickupLocation,
                    dropoffLocation: form.dropoffLocation,
                    cardLast4: form.cardLast4,
                    expiration: form.expiration,
                    billingAddress: form.billingAddress,
                    salesAgent: form.salesAgent,
                    dateOfBirth: form.dateOfBirth
                })
            };

            console.log("cancellation form =>", requestData)

            const response = await fetch("/api/bookings/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to process cancellation");
            }
            router.push("/dashboard");
            handleSuccessToast("Reservation cancelled successfully!");
        } catch (err: unknown) {
            if (err instanceof Error) {
                handleErrorToast(err.message);
            } else {
                handleErrorToast("Failed to cancel reservation");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <ErrorComponent
                title="Failed to Load Booking"
                message={error || "Unknown error occurred"}
                onRetry={() => dispatch(fetchBookingById(id!))}
            />
        );
    }

    if (loading && id) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 py-8">
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:border-red-300 hover:text-red-600 transition-all duration-200 self-start"
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
                            {isExistingCustomer ? "Cancel Reservation" : "New Cancellation"}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-600 mt-2"
                        >
                            {isExistingCustomer ? "Cancel an existing booking" : "Process a new cancellation"}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Warning Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800">
                                Cancellation Notice
                            </h3>
                            <p className="text-red-700 mt-1">
                                This action cannot be undone. The booking will be marked as cancelled and any applicable refunds will be processed.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Form Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-8 space-y-12">
                        {/* Section: Customer Information */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Customer Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="Customer Name"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter full name"
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<User className="w-4 h-4 text-slate-400" />}
                                />
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={id ? maskEmail(form.email) : form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<User className="w-4 h-4 text-slate-400" />}
                                />
                                <InputField
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={id ? maskPhone(form.phoneNumber) : form.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<User className="w-4 h-4 text-slate-400" />}
                                />
                                <InputField
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={form.dateOfBirth || ""}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                                />
                            </div>
                        </motion.section>

                        {/* Section: Booking Details */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
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
                                            disabled={isExistingCustomer}
                                            className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                                        />
                                    ) : (
                                        <select
                                            name="rentalCompany"
                                            value={form.rentalCompany}
                                            onChange={handleChange}
                                            className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                                            required
                                            disabled={isExistingCustomer}
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
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                />
                            </div>

                            {/* Location and Date/Time Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="Pickup Location"
                                    name="pickupLocation"
                                    value={form.pickupLocation}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter pickup location"
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                />

                                <InputField
                                    label="Pickup Date"
                                    name="pickupDate"
                                    type="date"
                                    value={form.pickupDate}
                                    onChange={handleChange}
                                    required
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                                />

                                <TimePicker
                                    label="Pickup Time"
                                    name="pickupTime"
                                    value={form.pickupTime}
                                    onChange={handleChange}
                                    required
                                    disabled={isExistingCustomer}
                                />

                                <InputField
                                    label="Drop-off Location"
                                    name="dropoffLocation"
                                    value={form.dropoffLocation}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter drop-off location"
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                />

                                <InputField
                                    label="Drop-off Date"
                                    name="dropoffDate"
                                    type="date"
                                    value={form.dropoffDate}
                                    onChange={handleChange}
                                    required
                                    readOnly={isExistingCustomer}
                                    className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                                />

                                <TimePicker
                                    label="Drop-off Time"
                                    name="dropoffTime"
                                    value={form.dropoffTime}
                                    onChange={handleChange}
                                    required
                                    disabled={isExistingCustomer}
                                />
                            </div>
                        </motion.section>

                        {/* Section: Payment Information */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <CreditCard className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Payment Information</h2>
                            </div>

                            {isExistingCustomer ? (
                                // Existing customer payment info (read-only)
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
                                    <InputField
                                        label="Total Amount ($)"
                                        name="total"
                                        value={form.total || ""}
                                        onChange={handleChange}
                                        readOnly={true}
                                        className="bg-slate-100 border-slate-200 text-slate-500"
                                        icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                    />
                                    <InputField
                                        label="Payable at Pickup ($)"
                                        name="payableAtPickup"
                                        value={form.payableAtPickup || ""}
                                        onChange={handleChange}
                                        readOnly={true}
                                        className="bg-slate-100 border-slate-200 text-slate-500"
                                        icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                    />
                                    <InputField
                                        label="MCO Amount ($)"
                                        name="mco"
                                        value={form.mco || ""}
                                        onChange={handleChange}
                                        readOnly={true}
                                        className="bg-slate-100 border-slate-200 text-slate-500"
                                        icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                    />
                                    <InputField
                                        label="Card Last 4 Digits"
                                        name="cardLast4"
                                        value={form.cardLast4}
                                        onChange={handleChange}
                                        placeholder="Enter last 4 digits"
                                        maxLength={4}
                                        readOnly={true}
                                        className="bg-slate-100 border-slate-200 text-slate-500"
                                        icon={<CreditCard className="w-4 h-4 text-slate-400" />}
                                    />
                                    <InputField
                                        label="Expiration Date"
                                        name="expiration"
                                        type="month"
                                        value={form.expiration}
                                        onChange={handleChange}
                                        readOnly={true}
                                        className="bg-slate-100 border-slate-200 text-slate-500"
                                    />
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Billing Address
                                        </label>
                                        <textarea
                                            name="billingAddress"
                                            value={form.billingAddress}
                                            onChange={handleChange}
                                            placeholder="Enter billing address"
                                            rows={3}
                                            readOnly={true}
                                            className="w-full border-2 border-slate-200 bg-slate-100 rounded-xl p-4 text-slate-500 placeholder-slate-400 outline-none transition-all duration-200 resize-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                // New customer payment info (editable)
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
                                    <InputField
                                        label="Card Last 4 Digits"
                                        name="cardLast4"
                                        value={form.cardLast4}
                                        onChange={handleChange}
                                        placeholder="Enter last 4 digits"
                                        maxLength={4}
                                        required
                                        className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                                        icon={<CreditCard className="w-4 h-4 text-slate-400" />}
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
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Billing Address
                                        </label>
                                        <textarea
                                            name="billingAddress"
                                            value={form.billingAddress}
                                            onChange={handleChange}
                                            placeholder="Enter complete billing address"
                                            rows={3}
                                            required
                                            className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.section>

                        {/* Section: Cancellation Details */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Cancellation Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/50 rounded-2xl p-6 border border-red-200">
                                <div className="space-y-4">
                                    <InputField
                                        label="Cancellation Fee ($)"
                                        name="cancellationFee"
                                        value={cancellationFee}
                                        onChange={(e) => setCancellationFee(e.target.value)}
                                        required
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="bg-white/50 border-red-200 focus:border-red-500 focus:ring-red-200"
                                        icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                    />
                                    {isExistingCustomer && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={calculateRefund}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                                        >
                                            <Calculator className="w-4 h-4" />
                                            <span>Calculate Refund</span>
                                        </motion.button>
                                    )}
                                </div>

                                <InputField
                                    label={isExistingCustomer ? "Refund Amount ($)" : "Refund if Applicable ($)"}
                                    name="refundAmount"
                                    value={form.refundAmount || ""}
                                    onChange={handleChange}
                                    readOnly={isExistingCustomer}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className={isExistingCustomer ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"}
                                    icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                />
                            </div>

                            {isExistingCustomer && form.mco && cancellationFee && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
                                >
                                    <p className="text-sm text-blue-800 font-medium">
                                        Refund Calculation: ${form.mco} (Original MCO) - ${cancellationFee} (Cancellation Fee) = ${form.refundAmount}
                                    </p>
                                </motion.div>
                            )}
                        </motion.section>

                        {/* Section: Sales Agent */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
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
                                onChange={handleChange}
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
                            transition={{ delay: 1.0 }}
                            className="pt-6"
                        >
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>Processing Cancellation...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Confirm Cancellation</span>
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}