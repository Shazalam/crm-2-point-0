import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    const { id, noteId } = await context.params; // ✅ await here
    const { text } = await req.json();

    if (!text?.trim()) {
      return apiResponse({ error: "Note text is required" }, 400);
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: id, "notes._id": noteId },
      {
        $set: {
          "notes.$.text": text.trim(),
          "notes.$.updatedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!booking) {
      return apiResponse({ error: "Booking or note not found" }, 404);
    }

    return apiResponse({ success: true, booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    const { id, noteId } = await context.params; // ✅ await the params

    // Auth check
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return apiResponse({ error: "Unauthorized" }, 401);

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return apiResponse({ error: "Invalid token" }, 401);
    }

    // Delete the note using $pull
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    if (!updatedBooking) {
      return apiResponse({ error: "Booking not found" }, 404);
    }

    return apiResponse({ success: true, booking: updatedBooking }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}