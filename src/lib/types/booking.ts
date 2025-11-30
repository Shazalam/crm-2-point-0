export interface TimelineChange {
  text: string;
}

export interface TimelineEntry {
  date: string;
  message: string;
  agentName: string;
  changes: TimelineChange[];
}

export interface Booking {
  id: string,
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  confirmationNumber: string;
  vehicleImage: string;
  total?: string;
  mco?: string;
  refundAmount?: string,
  modificationFee: { charge: string }[];   // ✅ important
  payableAtPickup?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cardLast4: string;
  expiration: string;
  billingAddress: string;
  salesAgent: string;
  status: "BOOKED" | "MODIFIED" | "CANCELLED";
  dateOfBirth?: string;
  notes?: {
    _id: string;
    text: string;
    agentName: string;
    createdAt: string;
    createdBy?: string;
  }[];
  timeline?: TimelineEntry[];
  amount?: string;
  giftCode?: string;
  expirationDate?: string;
  customerName?: string;
}

export const editableGroups = {
  Customer: ["fullName", "email", "phoneNumber"],
  Vehicle: ["rentalCompany", "confirmationNumber", "vehicleImage"],
  "Locations & Dates": [
    "pickupLocation",
    "dropoffLocation",
    "pickupDate",
    "dropoffDate",
    "pickupTime",
    "dropoffTime",
  ],
  "Payment Info": [
    "total",
    "payableAtPickup",
    "mco",
    "cardLast4",
    "expiration",
    "billingAddress",
  ],
};

export const emptyForm: Booking = {
  id: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  rentalCompany: "",
  confirmationNumber: "",
  vehicleImage: "",
  total: "",
  mco: "",
  refundAmount: "",
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
  status: "MODIFIED",
  dateOfBirth: "",
};

// types/booking.ts
export interface FormattedBookingChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

export interface Note {
  _id: string;
  text: string;
  agentName: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface CardData {
  fullName: string;
  amount: string;
  giftCode: string;
  expirationDate: string;
}

export type EmailTemplateType = "BOOKED" | "MODIFIED" | "CANCELLED" | "REFUND" | "VOUCHER" | "GENERAL";

export interface BookingFormWrapperProps {
  searchParams: {[key:string]: string | string[] | undefined}
}

export const rentalCompanies = [
  "Alamo",
  "Avis",
  "Budget",
  "Dollar",
  "Enterprise",
  "Europcar",
  "Easirent",
  "Fox",
  "Hertz",
  "National",
  "Other",
  "Payless",
  "SiXT",
  "Thrifty",
  "Zipcar",
];