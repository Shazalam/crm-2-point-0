// components/BookingFormWrapper.jsx
import NewCustomerBookingForm from "./NewCustomerBookingForm";
import ExistingCustomerBookingForm from "./ExistingCustomerBookingForm";
import { BookingFormWrapperProps } from "@/lib/types/booking";


export default async function BookingFormWrapper({ searchParams }: BookingFormWrapperProps) {

  const id = await searchParams?.id as string | undefined;

  return id ? <ExistingCustomerBookingForm id={id} /> : <NewCustomerBookingForm id={id} />;
}