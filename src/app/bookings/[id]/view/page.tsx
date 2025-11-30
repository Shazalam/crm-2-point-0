'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiMail, FiPhone, FiCalendar, FiDollarSign, FiFileText, FiClock, FiChevronDown, FiChevronUp, FiUser, FiMapPin, FiCreditCard, FiCheckCircle, FiGift, FiRefreshCw, FiLink, FiSend, FiTrash2, FiEdit2, FiEdit3, FiEdit, FiSmartphone, FiMonitor, FiHardDrive, FiCamera, FiNavigation, FiGlobe } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { bookingTemplate, BookingTemplateData } from "@/lib/email/templates/booking";
import Modal from "@/components/PreviewModal";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { deleteNote, updateNote, addNote, fetchBookingById, resetOperationStatus, clearBooking } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";
import { bookingModificationTemplate } from "@/lib/email/templates/modification";
import { cancellationTemplate } from "@/lib/email/templates/cancellation";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import Link from "next/link";
import { refundTemplate } from "@/lib/email/templates/refund";
import UrlInputModal from "@/components/UrlInputModal";
import GiftCardModal from "@/components/GiftCardModal";
import { giftCardTemplate, GiftCardTemplateData } from "@/lib/email/templates/giftCard";
import { clearCustomer, fetchCustomerById } from "@/app/store/slices/customerSlice";
import ImagePreviewModal from "@/components/docuSignPreviewModal";
import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";
import { fetchCurrentUser, User } from "@/app/store/slices/authSlice";


// Define the FormattedBookingChange interface locally
interface FormattedBookingChange {
    field: string;
    oldValue: string | number | null;
    newValue: string | number | null;
}

interface Note {
    _id: string;
    text: string;
    agentName: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
}

interface CardData {
    fullName: string;
    amount: string;
    giftCode: string;
    expirationDate: string;
}


export default function BookingDetailPage() {

    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("details");
    const [expandedSections, setExpandedSections] = useState({
        description: true,
        contact: true,
        company: true
    });
    // ✅ Use Redux state instead of local state
    const { user } = useAppSelector((state) => state.auth);

    const [agent, setAgent] = useState<User | null>(null);

    // 2. Rename states for clarity
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false); // State for loading indicator
    const dispatch = useAppDispatch();
    const { currentBooking: booking, loading, error, actionLoading } = useAppSelector((state) => state.booking);

    const { customer, loading: customerLoading, error: customerError } = useAppSelector((state) => state.customer);

    // Add these states and functions to your component
    const [newNote, setNewNote] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [templateType, setTemplateType] = useState("");

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [url, setUrl] = useState<string>(""); // single URL

    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [cardData, setCardData] = useState<CardData | null>(null);

    const [isDocuSignModalOpen, setIsDocuSignModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState('');

    const { handleSuccessToast, handleErrorToast } = useToastHandler();

    // Reset form when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearBooking());
        };
    }, [dispatch]);

    // Reset customer when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearCustomer());
        };
    }, [dispatch]);

    // Separate handler for voucher emails
    const handleVoucherSend = (voucherData: CardData) => {
        if (!booking) return;

        setCardData(voucherData); // Store for future use

        if (!voucherData?.amount || !voucherData?.giftCode || !voucherData?.expirationDate) {
            handleErrorToast("Voucher card data is missing.");
            return;
        }
        // ... rest of your voucher email logic
        handleSend("Voucher", undefined, voucherData); // pass cardData directly as third parameter
    };

    // Then update your handleGenerateCard:
    const handleGenerateCard = (newCardData: CardData) => {
        handleVoucherSend(newCardData); // Call the dedicated handler
    };

    const handleAddUrl = (newUrl: string) => {
        setUrl(newUrl); // store only one URL
        setModalOpen(false);
        handleSend("General", newUrl); // now handleSend can use `url` (be mindful of closure; see note)
    };

    const handleDeleteClick = (note: Note) => {
        setSelectedNote(note);
        setOpenDialog(true);
    };

    const handleEditClick = (note: Note) => {
        setEditingNoteId(note._id);
        setEditingNoteText(note.text);
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
        setEditingNoteText("");
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        dispatch(addNote({ bookingId: id as string, text: newNote.trim() }))
            .unwrap()
            .then(() => {
                handleSuccessToast("Note added successfully!");
                setNewNote("");
            })
            .catch((err) => handleErrorToast(err));
    };


    // Fetch current user using Redux thunk
    useEffect(() => {
        if (!user) {
            dispatch(fetchCurrentUser())
                .unwrap()
                .then((userData) => {
                    setAgent(userData);
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                    handleErrorToast("Failed to load user information");
                });
        } else {
            setAgent(user);
        }
    }, [dispatch, user, handleErrorToast]);


    // Update Note
    const handleUpdateNote = () => {
        if (!editingNoteId || !editingNoteText.trim()) return;
        dispatch(updateNote({
            bookingId: id as string,
            noteId: editingNoteId,
            text: editingNoteText.trim()
        }))
            .unwrap()
            .then(() => {
                handleSuccessToast("Note updated successfully!");
                setEditingNoteId(null);
                setEditingNoteText("");
            })
            .catch((err) => handleErrorToast(err));
    };

    // Delete Note
    const handleDeleteNote = () => {
        if (!selectedNote) return;
        dispatch(deleteNote({
            bookingId: id as string,
            noteId: selectedNote._id
        }))
            .unwrap()
            .then(() => {
                handleSuccessToast("Note deleted successfully!");
                setSelectedNote(null);
                setOpenDialog(false);
            })
            .catch((err) => handleErrorToast(err));
    };

    const getEmailTemplate = (status: string, emailData: BookingTemplateData & { refundAmount?: string; processingFee?: string }) => {
        switch (status) {
            case "MODIFIED":
                return bookingModificationTemplate(emailData);
            case "CANCELLED":
                return cancellationTemplate(emailData);
            case "BOOKED":
                return bookingTemplate(emailData);
            case "REFUND":
                return refundTemplate(emailData); // <-- added refund case
            case "VOUCHER":
                return giftCardTemplate(emailData); // <-- added refund case
            default:
                return bookingTemplate(emailData);
        }
    };

    const handleSend = async (type: string, overrideUrl?: string, overrideCardData?: CardData) => {
        if (!booking) return;

        // ✅ Get latest URL - use override if provided, otherwise use state
        const currentUrl = overrideUrl || url;

        // ✅ Get latest card data - use override if provided, otherwise use state
        const currentCardData = overrideCardData || cardData;

        // ✅ Get latest timeline + modification fee
        const lastTimelineEntry = booking.timeline?.[booking.timeline.length - 1];
        const lastTimeModificationFee = booking.modificationFee?.[booking.modificationFee.length - 1] || {};
        const modificationMCO = lastTimeModificationFee?.charge || "";

        // ✅ Extract changes
        const changes = lastTimelineEntry?.changes || [];
        const formattedChanges: FormattedBookingChange[] = changes.map(change => {
            const match = change.text.match(/(.*?) updated from "(.*?)" to "(.*?)"/);
            if (match) {
                return {
                    field: match[1],
                    oldValue: match[2],
                    newValue: match[3],
                };
            }

            const feeMatch = change.text.match(/(.*?): (.*)/);
            if (feeMatch) {
                return {
                    field: feeMatch[1],
                    oldValue: null,
                    newValue: feeMatch[2],
                };
            }

            return { field: change.text, oldValue: null, newValue: null };
        });


        const emailData: BookingTemplateData = {
            _id: booking._id, // Include booking ID
            fullName: booking.fullName,
            email: booking.email,
            phoneNumber: booking.phoneNumber,
            rentalCompany: booking.rentalCompany,
            confirmationNumber: booking.confirmationNumber,
            vehicleImage: booking.vehicleImage,
            total: booking.total,
            mco: booking.mco,
            payableAtPickup: booking.payableAtPickup,
            pickupDate: booking.pickupDate,
            dropoffDate: booking.dropoffDate,
            pickupTime: booking.pickupTime,
            dropoffTime: booking.dropoffTime,
            pickupLocation: booking.pickupLocation,
            dropoffLocation: booking.dropoffLocation,
            cardLast4: booking.cardLast4,
            expiration: booking.expiration,
            billingAddress: booking.billingAddress,
            salesAgent: booking.salesAgent,
            changes: formattedChanges,
            modificationMCO: modificationMCO,
            paymentLink: currentUrl, // Use the current URL
        };

        try {
            switch (type) {
                case "General": {
                    const template = getEmailTemplate(booking.status, emailData);
                    setEmailSubject(template.subject);
                    setEmailPreviewHtml(template.html);
                    setIsModalOpen(true);
                    setTemplateType(booking.status);
                    break;
                }

                case "Refund": {
                    if (!booking.refundAmount || !booking.mco) {
                        handleErrorToast("Refund amount is missing.");
                        return;
                    }

                    const refundEmailData = {
                        ...emailData,
                        refundAmount: booking.refundAmount,
                        processingFee: booking.mco,
                    };

                    const refundTemplateData = getEmailTemplate("REFUND", refundEmailData);
                    if (!refundTemplateData) return;

                    setEmailSubject(refundTemplateData.subject);
                    setEmailPreviewHtml(refundTemplateData.html);
                    setIsModalOpen(true);
                    setTemplateType("REFUND");
                    break;
                }

                case "Voucher": {
                    if (!currentCardData?.amount || !currentCardData?.giftCode || !currentCardData?.expirationDate) {
                        handleErrorToast("Voucher card data is missing.");
                        return;
                    }

                    const voucherEmailData: GiftCardTemplateData = {
                        ...emailData,
                        amount: currentCardData?.amount || "",
                        giftCode: currentCardData?.giftCode || "",
                        expirationDate: currentCardData?.expirationDate || "",
                        fullName: currentCardData?.fullName || "",
                    };

                    const voucherTemplateData = getEmailTemplate("VOUCHER", voucherEmailData);

                    if (!voucherTemplateData) return;

                    setEmailSubject(voucherTemplateData.subject);
                    setEmailPreviewHtml(voucherTemplateData.html);
                    setIsModalOpen(true);
                    setTemplateType("VOUCHER");
                    break;
                }

                default:
                    handleErrorToast(`Email template for "${type}" is not yet implemented.`);
            }
        } catch (error) {
            console.error("Error generating email template:", error);
            handleErrorToast("Failed to generate email template.");
        }
    };

    // --- NEW function to handle the actual email submission ---
    const handleEmailSubmit = async () => {
        if (!booking || !emailPreviewHtml) {
            handleErrorToast("Cannot send email. Data is missing.");
            return;
        }

        setIsSendingEmail(true);
        const toastId = toast.loading('Sending email...');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: booking.email,
                    subject: emailSubject,
                    html: emailPreviewHtml,
                }),
            });

            if (!response.ok) {
                // Try to get a more specific error from the backend response
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send email.');
            }

            handleSuccessToast('Email sent successfully!', { id: toastId });
            setIsModalOpen(false); // Close modal on success

        } catch (error: unknown) {
            console.error("Email sending failed:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            handleErrorToast(`Error: ${message}`, { id: toastId });
        } finally {
            setIsSendingEmail(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        if (booking?._id) return; // ✅ already loaded, skip fetching

        (async () => {
            try {
                await dispatch(fetchBookingById(id as string)).unwrap();
            } catch (error) {
                handleErrorToast(
                    error instanceof Error ? error.message : "Failed to load booking details"
                );
            }
        }
        )();
    }, [id, booking?._id, dispatch, handleErrorToast]);

    useEffect(() => {
        console.log("hello")
        if (!id) return;
        if (customer && customer?._id) return
        if (activeTab !== "files") return

        (async () => {
            try {
                await dispatch(fetchCustomerById(id as string)).unwrap();
            } catch (error) {
                handleErrorToast(
                    error instanceof Error ? error.message : "Failed to load customer details"
                );
            }
        })();

    }, [activeTab, id, dispatch, handleErrorToast, customer]);

    // Format date function
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get device icon based on device type
    const getDeviceIcon = (device: string) => {
        switch (device.toLowerCase()) {
            case 'mobile':
                return <FiSmartphone className="text-blue-500" />;
            case 'desktop':
                return <FiMonitor className="text-green-500" />;
            case 'tablet':
                return <FiHardDrive className="text-purple-500" />;
            default:
                return <FiMonitor className="text-gray-500" />;
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev]
        }));
    };

    const formatTimeWithCapitalAMPM = (dateString: string, timeZone: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace(/(am|pm)/i, match => match.toUpperCase());
    };


    if (error) {
        return (
            <ErrorComponent
                title="Failed to Fetch the data"
                message={error || "Unknown error occurred"}
                onRetry={() => dispatch(resetOperationStatus())}
            />
        )
    }

    if (loading) return <LoadingScreen />;

    if (!booking) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking not found</h1>
                <p className="text-gray-600 mb-6">{`The booking you're looking for doesn't exist or may have been removed.`}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition duration-200">
                    Back to Bookings
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section with Action Buttons */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{booking.rentalCompany} ({booking.confirmationNumber})</h1>
                                <p className="text-blue-600 font-semibold text-xl mt-1">${Number(booking.mco).toFixed(2)} (Total - ${Number(booking.total).toFixed(2)})</p>
                                <div className="flex flex-wrap items-center mt-2 gap-2">
                                    <span className="text-sm text-gray-500">Created on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handleSend("General")}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-md"
                                >
                                    <FiSend className="mr-2" /> Preview Email
                                </button>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md"
                                >
                                    <FiLink className="mr-2" /> Payment Link
                                </button>
                                <button
                                    onClick={() => setIsGiftModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-md"
                                >
                                    <FiGift className="mr-2" /> Voucher & Gift Card
                                </button>
                                <button
                                    onClick={() => handleSend("Refund")}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-md"
                                >
                                    <FiRefreshCw className="mr-2" /> Refund Email
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col lg:flex-row">
                        {/* Right Column */}
                        <div className="lg:w-1/3 p-6 bg-gray-50 border-r border-gray-200">

                            {/* Related Contact Section */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                    onClick={() => toggleSection("contact")}
                                >
                                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <FiUser className="text-blue-600" />
                                        </div>
                                        Customer Information
                                    </h2>
                                    {expandedSections.contact ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                                </div>
                                {expandedSections.contact && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                                                {booking?.fullName ? booking?.fullName.split(' ').map(n => n[0]).join('') : ''}

                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{booking?.fullName}</h3>
                                                <p className="text-sm text-gray-600">Primary Customer</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                <FiMail className="mr-3 text-gray-500" />
                                                <span className="text-sm">
                                                    {(() => {
                                                        const [localPart = "", domain = ""] = booking?.email?.split("@") || [];
                                                        return localPart && domain
                                                            ? `${localPart.slice(0, 2)}******${localPart.slice(-3)}@${domain}`
                                                            : "N/A";
                                                    })()}
                                                </span>

                                            </div>
                                            <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                <FiPhone className="mr-3 text-gray-500" />
                                                <span className="text-sm"> ******{booking?.phoneNumber?.slice(-4)}</span>
                                            </div>
                                            {
                                                booking?.dateOfBirth && (
                                                    <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                        <FaRegCalendarAlt className="mr-3 text-gray-500" />
                                                        <span className="text-sm">{booking?.dateOfBirth}</span>
                                                    </div>
                                                )
                                            }

                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Information Section */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                    onClick={() => toggleSection("company")}
                                >
                                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <FiCreditCard className="text-blue-600" />
                                        </div>
                                        Payment Information
                                    </h2>
                                    {expandedSections.company ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                                </div>
                                {expandedSections.company && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                <FiCreditCard className="mr-3 text-gray-500" />
                                                <span className="text-sm">Card: **** **** **** {booking.cardLast4}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg">
                                                <FiCalendar className="mr-3 text-gray-500" />
                                                <span className="text-sm">Expires: {booking.expiration}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 font-medium">Billing Address</p>
                                            <p className="text-sm text-gray-800">{booking.billingAddress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description Section */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-white"
                                    onClick={() => toggleSection("description")}
                                >
                                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <FiFileText className="text-blue-600" />
                                        </div>
                                        Description
                                    </h2>
                                    {expandedSections.description ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                                </div>
                                {expandedSections.description && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <p className="text-gray-600">
                                            This booking includes a rental from <strong>{booking.rentalCompany}</strong>.
                                            <br /><br />
                                            ➤ Pickup: {booking.pickupLocation} on {new Date(booking.pickupDate).toLocaleDateString()}
                                            <br />
                                            ➤ Drop-off: {booking.dropoffLocation} on {new Date(booking.dropoffDate).toLocaleDateString()}
                                            <br />
                                            ➤ Total amount: ${Number(booking.total).toFixed(2)}
                                            <br />
                                            ➤ Payable at pickup: ${Number(booking.payableAtPickup).toFixed(2)}
                                        </p>
                                        <div className="mt-4 text-sm text-gray-500 flex items-center">
                                            <FiClock className="mr-2" />
                                            Status: <span className={`ml-1 font-medium ${booking.status === "BOOKED" ? "text-green-600" :
                                                booking.status === "MODIFIED" ? "text-yellow-600" :
                                                    "text-red-600"}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Left Column */}
                        <div className="lg:w-2/3 p-6">
                            {/* Tabs Navigation */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex overflow-x-auto -mb-px">
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "details" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("timeline")}
                                        className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "timeline" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Timeline
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("notes")}
                                        className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "notes" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Notes
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("files")}
                                        className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "files" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Files
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("emails")}
                                        className={`py-3 px-4 text-center font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === "emails" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Emails
                                    </button>

                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === "details" && (
                                <div className="space-y-6">
                                    {/* ✅ Vehicle Image Section */}
                                    {booking.vehicleImage && (
                                        <div className="flex justify-center">
                                            {/* Relative container with fixed height (needed for next/image fill) */}
                                            <div className="relative w-full h-64 md:h-96">
                                                <Image
                                                    src={booking.vehicleImage}
                                                    alt="Vehicle"
                                                    fill // 🔑 makes the image fill its parent container
                                                    className="rounded-2xl shadow-lg border border-gray-200 object-contain"
                                                    sizes="(max-width: 768px) 100vw, 50vw" // 🔑 responsive image sizes
                                                    priority // optional: load faster if above the fold
                                                />
                                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                                    Vehicle Image
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-500" /> Pickup Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Location:</strong> {booking.pickupLocation}</p>
                                            <p className="text-gray-600"><strong>Date:</strong> {booking.pickupDate}</p>
                                            <p className="text-gray-600"><strong>Time:</strong> {booking.pickupTime}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-500" /> Drop-off Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Location:</strong> {booking.dropoffLocation}</p>
                                            <p className="text-gray-600"><strong>Date:</strong> {booking.dropoffDate}</p>
                                            <p className="text-gray-600"><strong>Time:</strong> {booking.dropoffTime}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiDollarSign className="mr-2 text-blue-500" /> Payment Details
                                            </h3>

                                            <div>
                                                <p className="text-gray-600"><strong>Total Amount:</strong> ${Number(booking.total).toFixed(2)}</p>
                                                <p className="text-gray-600"><strong>Payable at Pickup:</strong> ${Number(booking.payableAtPickup).toFixed(2)}</p>
                                                <p className="text-gray-600"><strong>MCO:</strong> ${booking.mco}</p>
                                            </div>

                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                                                <FiUser className="mr-2 text-blue-500" /> Sales Information
                                            </h3>
                                            <p className="text-gray-600"><strong>Sales Agent:</strong> {booking.salesAgent}</p>

                                            <p className="text-gray-600">
                                                <strong>Booking Created:</strong> {formatTimeWithCapitalAMPM(booking.createdAt, 'America/Vancouver')} PDT
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>Booking Created:</strong> {formatTimeWithCapitalAMPM(booking.createdAt, 'Asia/Kolkata')} IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "timeline" && (
                                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>

                                    {booking.timeline && booking.timeline.length > 0 ? (
                                        <div className="space-y-6 max-h-100 overflow-y-auto pr-1 custom-scrollbar">
                                            {/* Reverse the timeline array to show most recent first */}
                                            {booking.timeline.slice().reverse().map((event, index, array) => {
                                                const eventDate = new Date(event.date);
                                                const isLast = index === array.length - 1;

                                                return (
                                                    <div key={index} className="relative">
                                                        {/* Timeline connector */}
                                                        {!isLast && (
                                                            <div className="absolute left-4 top-8 h-8 w-0.5 bg-blue-200"></div>
                                                        )}

                                                        <div className="flex items-start">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <FiCheckCircle className="text-blue-600 w-4 h-4" />
                                                                </div>
                                                            </div>

                                                            <div className="ml-4 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {eventDate.toLocaleDateString()} at{" "}
                                                                        {eventDate.toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}{" "}
                                                                        - <strong>( {event.agentName} )</strong>
                                                                    </p>
                                                                </div>

                                                                <div className="mt-1 bg-blue-50 p-3 rounded-lg">
                                                                    <p className="text-sm font-medium text-blue-800 mb-2">
                                                                        {event.message}
                                                                    </p>
                                                                    {event.changes && event.changes.length > 0 && (
                                                                        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                                                            {event.changes.map((change, changeIndex) => (
                                                                                <li key={changeIndex}>{change.text}</li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline events</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Activity will appear here as changes are made to this booking.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}


                            {activeTab === "notes" && (
                                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Notes
                                        </h3>
                                        <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {booking.notes?.length || 0} notes
                                        </span>
                                    </div>

                                    {/* Input box */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        {editingNoteId ? (
                                            <>
                                                <textarea
                                                    value={editingNoteText}
                                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                                    placeholder="Edit your note..."
                                                    rows={4}
                                                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none resize-none text-gray-800 placeholder-gray-400 transition-all duration-200"
                                                />
                                                <div className="flex justify-start gap-2 pt-3">
                                                    <button
                                                        onClick={handleUpdateNote}
                                                        disabled={!editingNoteText.trim() || actionLoading}
                                                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow-md disabled:opacity-50"
                                                    >
                                                        {actionLoading ? "Updating..." : "Update"}
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <textarea
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Write a quick note..."
                                                    rows={1}
                                                    onFocus={(e) => (e.target.rows = 4)}
                                                    onBlur={(e) => {
                                                        if (!newNote.trim()) e.target.rows = 1;
                                                    }}
                                                    className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none resize-none text-gray-800 placeholder-gray-400 transition-all duration-200"
                                                />
                                                {newNote.trim() && (
                                                    <div className="flex justify-start gap-2 pt-3">
                                                        <button
                                                            onClick={handleAddNote}
                                                            disabled={!newNote.trim() || actionLoading}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow-md disabled:opacity-50"
                                                        >
                                                            {actionLoading ? "Adding..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={() => setNewNote("")}
                                                            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Notes list */}
                                    {!booking.notes || booking.notes.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <FiEdit2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <h3 className="text-sm font-medium text-gray-700 mb-1">No notes yet</h3>
                                            <p className="text-gray-500 text-sm">
                                                Add your first note to keep track of important info
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-100 overflow-y-auto pr-1 custom-scrollbar">
                                            {booking.notes.slice().reverse().map((note) => (
                                                <div
                                                    key={note._id}
                                                    className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Avatar with initials */}
                                                        <div className="w-9 h-9 flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {note.agentName?.[0] || "A"}
                                                        </div>

                                                        <div className="flex-1">
                                                            {/* Top row: name + date/time + actions */}
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                                                    <span className="font-semibold text-indigo-700 text-sm">
                                                                        {note.agentName || "Agent"}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md w-fit mt-0.5 sm:mt-0">
                                                                        <FiClock className="w-3.5 h-3.5" />
                                                                        {new Date(note.createdAt).toLocaleDateString()} •{" "}
                                                                        {new Date(note.createdAt).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </span>
                                                                </div>


                                                                {
                                                                    note?.createdBy === agent?.id && (
                                                                        < div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleEditClick(note)}
                                                                                className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition"
                                                                                title="Edit note"
                                                                            >
                                                                                <FiEdit2 className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteClick(note)}
                                                                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                                                                                title="Delete note"
                                                                            >
                                                                                <FiTrash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    )


                                                                }


                                                            </div>

                                                            {/* Note text */}
                                                            <p className="text-gray-700 text-sm leading-relaxed mt-1">{note.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "emails" && (
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Email History</h3>
                                    <p className="text-gray-600">No emails have been sent yet.</p>
                                </div>
                            )}

                            {activeTab === "files" && (
                                <div className="space-y-6">
                                    {/* Loading State */}
                                    {customerLoading && (
                                        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                                <span className="text-gray-600">Loading customer data...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {customerError && (
                                        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                                            <div className="flex items-center justify-center mb-3">
                                                <FiClock className="text-red-500 mr-2" />
                                                <span className="text-red-800">Error loading customer data</span>
                                            </div>
                                            <p className="text-red-700 text-sm text-center mb-4">{customerError}</p>
                                            <button
                                                onClick={() => dispatch(fetchCustomerById(id as string))}
                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                                            >
                                                Retry Loading
                                            </button>
                                        </div>
                                    )}

                                    {/* Customer Data Display */}
                                    {customer && !customerLoading && (
                                        <>
                                            {/* ID Documents Section */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
                                                    <FiCamera className="text-blue-500 mr-3 text-2xl" />
                                                    ID Documents
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    {/* Front Image */}
                                                    <div className="text-center">
                                                        <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300 shadow-md"
                                                            onClick={() => {
                                                                if (customer.frontImage) {
                                                                    setSelectedImage(customer.frontImage);
                                                                    setModalTitle('Front Document');
                                                                    setIsDocuSignModalOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            <Image
                                                                src={customer.frontImage}
                                                                alt="Front ID Document"
                                                                fill
                                                                className="object-cover hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/api/placeholder/400/300';
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="mt-4 text-lg font-medium text-gray-800 bg-blue-50 py-2 rounded-lg">Front Document</p>
                                                        <p className="text-sm text-gray-500 mt-1">Uploaded: {formatDate(customer.createdAt)}</p>
                                                    </div>

                                                    {/* Back Image */}
                                                    <div className="text-center">
                                                        <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300 shadow-md"
                                                            onClick={() => {
                                                                if (customer.backImage) {
                                                                    setSelectedImage(customer.backImage);
                                                                    setModalTitle('Back Document');
                                                                    setIsDocuSignModalOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            <Image
                                                                src={customer.backImage}
                                                                alt="Back ID Document"
                                                                fill
                                                                className="object-cover hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/api/placeholder/400/300';
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="mt-4 text-lg font-medium text-gray-800 bg-blue-50 py-2 rounded-lg">Back Document</p>
                                                        <p className="text-sm text-gray-500 mt-1">Updated: {formatDate(customer.updatedAt)}</p>
                                                    </div>
                                                </div>

                                                {/* Document Status */}
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center">
                                                        <FiCheckCircle className={`text-2xl mr-3 ${customer.acknowledged ? 'text-green-500' : 'text-yellow-500'
                                                            }`} />
                                                        <div>
                                                            <span className="text-lg font-semibold text-gray-800">Document Status</span>
                                                            <p className="text-sm text-gray-600">
                                                                {customer.acknowledged ? 'Documents verified and approved' : 'Documents pending review'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${customer.acknowledged
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        }`}>
                                                        {customer.acknowledged ? 'Verified' : 'Under Review'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Device & Session Information */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Device Information */}
                                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
                                                        {getDeviceIcon(customer.device)}
                                                        <span className="ml-3">Device Information</span>
                                                    </h3>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Device Type:</span>
                                                            <span className="text-gray-900 font-semibold capitalize">{customer.device}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Browser:</span>
                                                            <span className="text-gray-900 font-semibold text-sm">{customer.browser}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Operating System:</span>
                                                            <span className="text-gray-900 font-semibold">{customer.os}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location Information */}
                                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
                                                        <FiMapPin className="text-red-500 mr-3 text-2xl" />
                                                        Location Information
                                                    </h3>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Country:</span>
                                                            <span className="text-gray-900 font-semibold">{customer.location.country}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Region:</span>
                                                            <span className="text-gray-900 font-semibold">{customer.location.region}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">City:</span>
                                                            <span className="text-gray-900 font-semibold">{customer.location.city}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                                            <span className="text-gray-700 font-medium">Zip Code:</span>
                                                            <span className="text-gray-900 font-semibold">{customer.location.zipcode}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Session Details */}
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 shadow-sm">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
                                                    <FiGlobe className="text-purple-500 mr-3 text-2xl" />
                                                    Session Details
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                        <div className="flex items-center mb-3">
                                                            <FiNavigation className="text-blue-500 mr-2" />
                                                            <span className="text-lg font-medium text-gray-800">IP Address</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900 text-center font-mono">{customer.ip}</p>
                                                    </div>

                                                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                        <div className="flex items-center mb-3">
                                                            <FiCreditCard className="text-green-500 mr-2" />
                                                            <span className="text-lg font-medium text-gray-800">Session ID</span>
                                                        </div>
                                                        <p className="text-sm font-mono text-gray-700 text-center break-all bg-gray-100 p-2 rounded">
                                                            {customer.sessionId}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Timestamps */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700 font-medium">Created:</span>
                                                            <span className="text-gray-900 font-semibold text-sm">
                                                                {formatDate(customer.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700 font-medium">Last Updated:</span>
                                                            <span className="text-gray-900 font-semibold text-sm">
                                                                {formatDate(customer.updatedAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* No Customer Data State */}
                                    {!customer && !customerLoading && !customerError && (
                                        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <FiFileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Customer Data Available</h3>
                                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                Customer session information, ID documents, and device details will appear here once the data is loaded.
                                            </p>
                                            <button
                                                onClick={() => dispatch(fetchCustomerById(id as string))}
                                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                                            >
                                                <FiRefreshCw className="mr-2" />
                                                Load Customer Data
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 justify-start mt-5">
                                {/* New Booking Button */}
                                <Link
                                    href={`/bookings/new?id=${id}`}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 text-sm hover:scale-105"
                                >
                                    <FiEdit className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Edit Booking</span>
                                </Link>

                                {/* Modification Button */}
                                <Link
                                    href={`/bookings/modification?id=${id}`}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 text-sm hover:scale-105"
                                >
                                    <FiEdit3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Modification</span>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div >

            {
                isModalOpen && (
                    <>
                        {/* Pass the new props to the Modal component */}
                        < Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSubmit={handleEmailSubmit}
                            isSubmitting={isSendingEmail}
                            title={emailSubject || "Email Preview"}
                            status={templateType as "BOOKED" | "MODIFIED" | "CANCELLED" | "REFUND" | "VOUCHER"}
                        >
                            <iframe
                                srcDoc={emailPreviewHtml}
                                title="Email Preview"
                                className="w-full h-[65vh] border-0 rounded-md"
                            />
                        </Modal >
                    </>

                )
            }

            {
                openDialog && (
                    <DeleteConfirmDialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        onConfirm={handleDeleteNote}
                        noteText={selectedNote?.text}
                    />
                )
            }

            {

                modalOpen && (
                    < UrlInputModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        onAdd={handleAddUrl}
                    />
                )
            }


            {
                isGiftModalOpen && (
                    < GiftCardModal
                        isOpen={isGiftModalOpen}
                        onClose={() => setIsGiftModalOpen(false)}
                        onGenerate={handleGenerateCard}
                        initialCustomerName={booking?.fullName || 'JOHN DOE'}
                    />
                )
            }

            {/* Image Preview Modal */}
            {selectedImage && (
                <ImagePreviewModal
                    isOpen={isDocuSignModalOpen}
                    onClose={() => setIsDocuSignModalOpen(false)}
                    imageUrl={selectedImage}
                    title={modalTitle}
                />
            )}
        </>
    );
}
