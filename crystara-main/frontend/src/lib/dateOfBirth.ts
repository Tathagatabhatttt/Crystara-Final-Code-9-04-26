import { API_URL } from "@/lib/api";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateOfBirth = (value: string | null | undefined): value is string => {
  if (!value || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  return date.getTime() <= Date.now();
};

export type SaveDateOfBirthResult = {
  ok: boolean;
  error?: string;
  profile?: any;
};

async function parseApiError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => ({}));
    return (
      payload?.error ||
      payload?.detail ||
      `Failed to save date of birth (${response.status})`
    );
  }

  const text = await response.text().catch(() => "");
  if (response.status === 404 || text.includes("Cannot POST") || text.includes("Cannot PATCH")) {
    return "Server is missing the date-of-birth save route. Redeploy the backend, then try again.";
  }
  return `Failed to save date of birth (${response.status})`;
}

/** Persist DOB to the signed-in customer's profile. No OTP / auth side effects. */
export async function saveDateOfBirth(
  accessToken: string | undefined | null,
  dateOfBirth: string,
): Promise<SaveDateOfBirthResult> {
  if (!accessToken) {
    return { ok: false, error: "You must be signed in to save your date of birth." };
  }
  if (!isValidDateOfBirth(dateOfBirth)) {
    return { ok: false, error: "Please enter a valid date of birth." };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const body = JSON.stringify({ date_of_birth: dateOfBirth });

  try {
    // Preferred dedicated route
    let response = await fetch(`${API_URL}/profile/date-of-birth`, {
      method: "POST",
      headers,
      body,
    });

    // Older backends may only have PATCH /profile
    if (response.status === 404) {
      response = await fetch(`${API_URL}/profile`, {
        method: "PATCH",
        headers,
        body,
      });
    }

    if (!response.ok) {
      return { ok: false, error: await parseApiError(response) };
    }

    const payload = await response.json().catch(() => ({}));
    return { ok: true, profile: payload?.profile };
  } catch (error) {
    console.error("Failed to save date of birth:", error);
    return { ok: false, error: "Network error while saving date of birth." };
  }
}

/** Human-readable hint when the DB column hasn't been migrated yet. */
export function isMissingDobColumnError(message?: string | null): boolean {
  if (!message) return false;
  return message.toLowerCase().includes("date_of_birth column is missing");
}
