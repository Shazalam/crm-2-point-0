import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";

// Define interfaces for type safety
interface TimelineChange {
  text: string;
}

interface TimelineEntry {
  date: string;
  message: string;
  agentName: string;
  changes: TimelineChange[];
}

// ✅ GET /api/bookings/:id
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ params is a Promise
    const booking = await Booking.findById(id);

    if (!booking) {
      return apiResponse({ success: false, message: "Booking not found" }, 404);
    }

    return apiResponse({ success: true, booking }, 200);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message: message }, 500);
  }
}


function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  // Expecting input like "23:30" or "08:15"
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  // const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 to 12
  return `${hour}:${minute}`;
}


// ✅ PUT /api/bookings/:id
export async function PUT(req: Request) {
  try {
    await connectDB();

    // ✅ Auth check
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ success: false, message: "Unauthorized" }, 401);

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ success: false, message: "Invalid token" }, 401);
    }

    // ✅ Get ID from pathname
    const pathParts = new URL(req.url).pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) return apiResponse({ success: false, message: "Booking ID required" }, 400);

    const data = await req.json();

    console.log("edit and modify data >", data)
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) return apiResponse({ success: false, message: "Booking not found" }, 404);

    const changes: TimelineChange[] = [];
    const updatedFields: Record<string, unknown> = {}; // ✅ fixed any -> unknown

    // Map raw fields to human-readable labels
    const fieldLabels: Record<string, string> = {
      pickupLocation: "Pickup Location",
      dropoffLocation: "Dropoff Location",
      pickupDate: "Pickup Date",
      dropoffDate: "Dropoff Date",
      pickupTime: "Pickup Time",
      dropoffTime: "Dropoff Time",
      fullName: "Full Name",
      email: "Email",
      phoneNumber: "Phone Number",
      rentalCompany: "Rental Company",
      confirmationNumber: "Confirmation Number",
      vehicleImage: "Vehicle Image",
      total: "Total",
      mco: "MCO",
      payableAtPickup: "Payable at Pickup",
      cardLast4: "Card Last 4 Digits",
      expiration: "Expiration",
      billingAddress: "Billing Address",
      status: "Status",
      dateOfBirth: "Date of Birth"
    };

    // Handle modification fees
    if (data.modificationFee && Array.isArray(data.modificationFee)) {
      updatedFields.modificationFee = data.modificationFee;
      const lastFee = data.modificationFee[data.modificationFee.length - 1];
      if (JSON.stringify(existingBooking.modificationFee) !== JSON.stringify(data.modificationFee)) {
        changes.push({ text: `Modification fee added: $${lastFee.charge}` });
      }
    }

    // Fields to check
    const fieldsToCheck = Object.keys(fieldLabels);

    fieldsToCheck.forEach(field => {
      const newValue = data[field];
      const oldValue = existingBooking[field];

      // Treat null, undefined, or "null" as empty
      const oldEmpty = oldValue === null || oldValue === undefined || oldValue === "" || oldValue === "null";

      // ✅ Use const instead of let
      const displayOld = oldEmpty ? null : oldValue;
      const displayNew = newValue ?? "";

      // Handle numeric fields
      if (["total", "mco", "payableAtPickup"].includes(field)) {
        const numNew = newValue ? Number(newValue) : 0;
        const numOld = oldValue ? Number(oldValue) : 0;
        if (numNew !== numOld) {
          changes.push({ text: `Change in ${fieldLabels[field]}: from "${numOld}" to "${numNew}"` });
          updatedFields[field] = numNew;
        }
        return;
      }

      // Handle date fields
      if (["pickupDate", "dropoffDate"].includes(field)) {
        const oldDate = oldValue ? oldValue : null;
        const newDate = newValue ? newValue : null;
        if (oldDate !== newDate) {
          if (!oldDate) {
            changes.push({ text: `Change in ${fieldLabels[field]}: to "${newDate}"` });
          } else {
            changes.push({ text: `Change in ${fieldLabels[field]}: from "${oldDate}" to "${newDate}"` });
          }
          updatedFields[field] = newDate;
        }
        return;
      }

      // Handle pickupTime and dropoffTime
      if (["pickupTime", "dropoffTime"].includes(field)) {
        const oldTimeFormatted = oldEmpty ? null : formatTime(oldValue);
        const newTimeFormatted = newValue ? formatTime(newValue) : "";

        if (oldTimeFormatted !== newTimeFormatted) {
          if (!oldTimeFormatted) {
            changes.push({ text: `Change in ${fieldLabels[field]}: to "${newTimeFormatted}"` });
          } else {
            changes.push({ text: `Change in ${fieldLabels[field]}: from "${oldTimeFormatted}" to "${newTimeFormatted}"` });
          }
          updatedFields[field] = newValue;
        }
        return;
      }

      // Handle all other fields
      if (newValue !== undefined && newValue !== oldValue) {
        if (oldEmpty) {
          changes.push({ text: `Change in ${fieldLabels[field]}: to "${displayNew}"` });
        } else {
          changes.push({ text: `Change in ${fieldLabels[field]}: from "${displayOld}" to "${displayNew}"` });
        }
        updatedFields[field] = newValue;
      }
    });

    // Prepare update payload
    const updatePayload: Record<string, unknown> = { ...updatedFields };

    if (changes.length > 0) {
      const timelineEntry: TimelineEntry = {
        date: new Date().toISOString(),
        message: `Updated ${changes.length} field(s)`,
        agentName: decoded?.name || "",
        changes
      };
      updatePayload.$push = { timeline: timelineEntry };
    }

    const booking = await Booking.findByIdAndUpdate(id, updatePayload, { new: true });
    return apiResponse({ success: true, booking }, 200);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message: message }, 500);
  }
}


// DELETE (Soft Delete)
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ success: false, message: "Unauthorized access. Token missing." }, 401);

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ success: false, message: "Invalid or expired token." }, 401);
    }

    // ✅ Get ID from pathname
    const pathParts = new URL(req.url).pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) return apiResponse({ success: false, message: "Booking ID is required." }, 400);

    const booking = await Booking.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!booking) return apiResponse({ success: false, message: "Booking not found." }, 404);

    return apiResponse(
      {
        success: true,
        message: "Booking soft-deleted successfully.",
        data: {
          bookingId: booking._id,
          status: booking.status,
          deletedAt: new Date(),
        },
      },
      200
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return apiResponse(
      { success: false, message }, 500);
  }
}
