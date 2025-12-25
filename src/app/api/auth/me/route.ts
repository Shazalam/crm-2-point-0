// import { apiResponse } from "@/lib/utils/apiResponse";
// import { verifyToken } from "@/lib/utils/auth";


// export async function GET(req: Request) {
//   const cookie = req.headers.get("cookie");
//   const token = cookie?.match(/token=([^;]+)/)?.[1];

//   if (!token) {
//     return apiResponse({success:false, message: "Unauthorized" }, 401);
//   }

//   try {
//     const decoded = verifyToken(token) as { id?: string; email?: string; name?: string };

//     if (!decoded?.id || !decoded?.email || !decoded?.name) {
//       return apiResponse({success:false, message: "Invalid token payload" }, 401);
//     }

//     return apiResponse({success:true, data: { id: decoded.id, email: decoded.email, name: decoded.name } }, 200);
//   } catch {
//     return apiResponse({success:false,  message: "Invalid or expired token" }, 401);
//   }
// }



// app/api/auth/me/route.ts

import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import { success, unauthorized, internalError } from  "@/lib/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return unauthorized("Authentication required");
    }

    const decoded = verifyToken(token) as {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };

    if (!decoded?.id || !decoded?.email || !decoded?.name) {
      return unauthorized("Invalid or malformed token");
    }

    return success(
      {
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role ?? "user", // default role
        },
      },
      "Authenticated"
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Invalid or expired authentication token";

    return internalError(message);
  }
}
