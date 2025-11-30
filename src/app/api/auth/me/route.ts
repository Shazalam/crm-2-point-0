import { apiResponse } from "@/lib/utils/apiResponse";
import { verifyToken } from "@/lib/utils/auth";


export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return apiResponse({success:false, message: "Unauthorized" }, 401);
  }

  try {
    const decoded = verifyToken(token) as { id?: string; email?: string; name?: string };

    if (!decoded?.id || !decoded?.email || !decoded?.name) {
      return apiResponse({success:false, message: "Invalid token payload" }, 401);
    }

    return apiResponse({success:true, data: { id: decoded.id, email: decoded.email, name: decoded.name } }, 200);
  } catch {
    return apiResponse({success:false,  message: "Invalid or expired token" }, 401);
  }
}
