// src/app/api/bookings/cancel/route.ts
import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";

const REQUIRED_FIELDS = [
  "fullName",
  "phoneNumber",
  "rentalCompany",
  "confirmationNumber",
  "pickupDate",
  "dropoffDate",
  "pickupLocation",
  "dropoffLocation",
  "cardLast4",
  "expiration",
  "billingAddress",
  "dateOfBirth",
  "salesAgent"
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Auth check
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ error: "Unauthorized" }, 401);

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ error: "Invalid token" }, 401);
    }

    const body = await req.json();
    const { bookingId, customerType, refundAmount, mco, ...rest } = body;

    let booking;

    if (customerType === "existing" && bookingId) {
      // Get the existing booking to check for changes
      const existingBooking = await Booking.findById(bookingId);
      
      if (!existingBooking) {
        return apiResponse({ error: "Booking not found" }, 404);
      }

      console.log("existing =>", existingBooking)
      console.log("mco =>", mco)

      // Create a single timeline entry with all changes
      const changes = [];
      
      // Check if MCO has changed
      if (existingBooking.mco !== mco) {
        changes.push({
          text: `MCO changed from $${existingBooking.mco} to $${mco}`
        });
      }
      
      // Check if refund amount is being set (it was likely null before)
      if (refundAmount && (!existingBooking.refundAmount || existingBooking.refundAmount !== refundAmount)) {
        changes.push({
          text: `Refund amount set to $${refundAmount}`
        });
      }
      
      // Create a single timeline entry with all changes
      const timelineEntry = {
        date: new Date(),
        message: `Cancellation processed by ${rest.salesAgent || "System"}`,
        agentName: rest.salesAgent || "System",
        agentId: decoded.id,
        changes: changes
      };

      // Update existing booking
      booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: "CANCELLED",
          refundAmount,
          mco:mco,
          updatedAt: new Date(),
          // Add the single timeline entry
          $push: { timeline: timelineEntry }
        },
        { new: true }
      );
    } else {
      // ✅ Check required fields for new cancellations
      const missing = REQUIRED_FIELDS.filter(
        (field) => !rest[field] || rest[field].toString().trim() === ""
      );

      if (missing.length > 0) {
        return apiResponse(
          { error: `Missing required fields: ${missing.join(", ")}` },
          400
        );
      }

      // Create new cancellation with a single timeline entry
      booking = new Booking({
        ...rest,
        status: "CANCELLED",
        refundAmount,
        mco,
        agentId: decoded.id,
        timeline: [{
          date: new Date(),
          message: "Cancellation requested",
          agentName: rest.salesAgent || "Unknown Employee",
          changes: [
            {
              text: "Reservation cancelled"
            },
            ...(mco ? [{ text: `Cancellation fee applied: $${mco}` }] : []),
            ...(refundAmount ? [{ text: `Refund amount: $${refundAmount}` }] : [])
          ]
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await booking.save();
    }

    if (!booking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    return apiResponse({ success: true, booking }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}