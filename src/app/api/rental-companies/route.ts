import RentalCompany from "@/lib/models/RentalCompany";
import { connectDB } from "@/lib/utils/db";
import { apiResponse } from "@/lib/utils/apiResponse";


// ✅ GET all rental companies
export async function GET() {
  try {
    await connectDB();

    // ✅ Ensure at least one default company exists
    const count = await RentalCompany.countDocuments();

    if (count === 0) {
      await RentalCompany.create({ name: "Other" });
    }

    const companies = await RentalCompany.find().sort({ name: 1 });
    return apiResponse({ success: true, data: companies });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message }, 500);
  }
}

// ✅ POST create rental company
export async function POST(req: Request) {
  
  try {
    await connectDB();
    
    const data = await req.json();

    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      return apiResponse({ success: false, message: "Invalid company name" }, 400);
    }

    // const existing = await RentalCompany.findOne({ name: data.name });
    const existing = await RentalCompany.findOne({ name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") } });
   
    if (existing) {
      return apiResponse({ success: false, message: "This rental company already exists. Please select it or select 'Other'" }, 400);
    }

    const newCompany = await RentalCompany.create({ name: data.name.trim() });
    return apiResponse({ success: true, message:"New company added successfully", data: newCompany });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message }, 500);
  }
}
