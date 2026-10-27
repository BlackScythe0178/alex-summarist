import type { Book } from "@/types/book";

const BASE = "https://us-central1-summaristt.cloudfunctions.net";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** The selected endpoint returns an array with one book; normalise to a single object. */
export async function getSelectedBook(signal?: AbortSignal): Promise<Book | null> {
  const data = await getJson<Book | Book[]>(`${BASE}/getBooks?status=selected`, signal);
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export function getRecommendedBooks(signal?: AbortSignal) {
  return getJson<Book[]>(`${BASE}/getBooks?status=recommended`, signal);
}

export function getSuggestedBooks(signal?: AbortSignal) {
  return getJson<Book[]>(`${BASE}/getBooks?status=suggested`, signal);
}

export function getBook(id: string, signal?: AbortSignal) {
  return getJson<Book | null>(`${BASE}/getBook?id=${encodeURIComponent(id)}`, signal);
}

export async function searchBooks(search: string, signal?: AbortSignal) {
  const data = await getJson<Book[] | null>(
    `${BASE}/getBooksByAuthorOrTitle?search=${encodeURIComponent(search)}`,
    signal
  );
  return Array.isArray(data) ? data : [];
}

export const isPremiumOnly = (b: Pick<Book, "subscriptionRequired">) => b.subscriptionRequired;
