export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Request failed: ${response.statusText}`);
    }

    return response.json();
}
