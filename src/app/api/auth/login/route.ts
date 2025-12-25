// import { connectDB } from "@/lib/utils/db";
// import { comparePassword, signToken } from "@/lib/utils/auth";
// import Agent from "@/lib/models/Agent";

// export async function POST(req: Request) {
//   try {
//     await connectDB();

//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return apiResponse({ success: false, message: "Email and password are required" }, 400);
//     }

//     const agent = await Agent.findOne({ email });

//     if (!agent) {
//       return apiResponse({ success: false, message: "Invalid credentials" }, 401);
//     }

//     const isMatch = await comparePassword(password, agent.password);

//     if (!isMatch) {
//       return apiResponse({ success: false, message: "Invalid credentials" }, 401);
//     }

//     // ✅ Create JWT token
//     const token = signToken({
//       id: agent._id,
//       email: agent.email,
//       name: agent.name,
//     });

//     // ✅ Prepare response data
//     const response = apiResponse(
//       {
//         success: true,
//         message: "Login successful",
//         data: {
//           id: agent._id,
//           name: agent.name,
//           email: agent.email,
//         },
//       },
//       200
//     );

//     // ✅ Set cookie securely
//     response.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 60 * 60 * 24, // 1 day
//       path: "/",
//     });

//     return response;
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     return apiResponse({ success: false, message }, 500);
//   }
// }





// app/api/auth/login/route.ts

import { connectDB } from "@/lib/utils/db";
import { comparePassword, signToken } from "@/lib/utils/auth";
import Agent from "@/lib/models/Agent";
import { badRequest, unauthorized,internalError, success } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return badRequest("Email and password are required");
    }

    const agent = await Agent.findOne({ email });

    if (!agent) {
      return unauthorized("Invalid credentials");
    }

    const isMatch = await comparePassword(password, agent.password);

    if (!isMatch) {
      return unauthorized("Invalid credentials");
    }

    // Generate JWT Token
    const token = signToken({
      id: agent._id.toString(),
      email: agent.email,
      name: agent.name,
    });

    // Prepare Login Response Payload
    const responsePayload = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
    };

    // Create Response
    const response = success(responsePayload, "Login successful");

    // Attach HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return internalError(message);
  }
}
