// import { apiResponse } from "@/lib/utils/apiResponse";


// export async function POST() {
//   try {
//     // Clear the JWT cookie
//     const response = apiResponse(
//       { success: true, message: "Logged out successfully" },
//       200
//     );

//     response.cookies.set("token", "", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       expires: new Date(0), // Expire immediately
//       path: "/",
//     });

//     return response;
//   } catch (error) {
//     console.error("Logout API error:", error);
//     return apiResponse({ success: false, message: "Logout failed" }, 500);
//   }
// }




// app/api/auth/logout/route.ts

import { success, internalError } from "@/lib/utils/apiResponse";

export async function POST() {
  try {
    // Build JSON response
    const response = success(
      { loggedOut: true },
      "Logged out successfully"
    );

    // Clear token cookie securely
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Force expiration
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return internalError(message);
  }
}
