export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // important to include cookies
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
                                                                                          