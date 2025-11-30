import { Suspense } from "react";
import BookingForm from "./BookingForm";


export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading cancellation form...</div>}>
      <BookingForm/>
    </Suspense>
  );
}
