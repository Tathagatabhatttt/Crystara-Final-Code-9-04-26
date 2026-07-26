import { API_URL } from "@/lib/api";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateOfBirth = (value: string | null | undefined): value is string => {
  if (!value || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const [year, month, day] = value.split("-").map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    date.getTime() <= Date.now()
  );
};

/** Persist DOB to the signed-in customer's profile. No OTP / auth side effects. */
export async function saveDateOfBirth(
  accessToken: string | undefined | null,
  dateOfBirth: string,
): Promise<boolean> {
  if (!accessToken || !isValidDateOfBirth(dateOfBirth)) return false;

  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ date_of_birth: dateOfBirth }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to save date of birth:", error);
    return false;
  }
}
