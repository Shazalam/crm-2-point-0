// app/api/bookings/[id]/notes/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
import { apiResponse } from "@/lib/utils/apiResponse";
import { verifyToken } from "@/lib/utils/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;
        const { text } = await req.json();

        // Auth check
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return apiResponse({ error: "Unauthorized" }, 401);

        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
            return apiResponse({ error: "Invalid token" }, 401);
        }

        // Get agent name (you might need to fetch from user collection)
        const agentName = decoded.name || "Unknown Agent";
        const createdBy = decoded.id;

        const booking = await Booking.findById(id);
        if (!booking) {
            return apiResponse({ error: "Booking not found" }, 404);
        }

        // Add new note
        booking.notes.push({ text, agentName, createdBy });
        await booking.save();

        return apiResponse({ success: true, booking }, 200);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Server error";
        return apiResponse({ error: message }, 500);
    }
}
