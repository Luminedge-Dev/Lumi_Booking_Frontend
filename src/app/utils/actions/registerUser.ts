'use server';
import { API_BASE } from "@/lib/config";
import { formatData } from "@/app/register/page";

export const registerUser = async (formData: formatData) => {
  const res = await fetch(`${API_BASE}/api/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    cache: 'no-store',
  });
  const body = await res.text();
  try {
    return JSON.parse(body);
  } catch {
    return {
      message: `The registration API returned a non-JSON response (${res.status}). NEXT_PUBLIC_API_BASE_URL must be the backend origin.`,
    };
  }
};
