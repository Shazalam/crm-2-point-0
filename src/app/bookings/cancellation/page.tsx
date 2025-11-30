import { Suspense } from "react";
import CancellationForm from "./CancellationForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading cancellation form...</div>}>
      <CancellationForm />
    </Suspense>
  );
}
