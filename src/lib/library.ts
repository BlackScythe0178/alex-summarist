import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { Book } from "@/types/book";

/**
 * Firestore layout:
 *   users/{uid}/library/{bookId}   — books saved with "Add title to My Library"
 *   users/{uid}/finished/{bookId}  — books whose audio was played to the end
 * Each document stores the book fields needed to render a card, plus a timestamp.
 */
type ListName = "library" | "finished";

function snapshotOf(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    subTitle: book.subTitle,
    imageLink: book.imageLink,
    audioLink: book.audioLink,
    averageRating: book.averageRating,
    totalRating: book.totalRating,
    keyIdeas: book.keyIdeas,
    type: book.type,
    status: book.status,
    subscriptionRequired: book.subscriptionRequired,
  };
}

export function saveToList(uid: string, list: ListName, book: Book) {
  return setDoc(doc(getDb(), "users", uid, list, book.id), {
    ...snapshotOf(book),
    addedAt: serverTimestamp(),
  });
}

export function removeFromList(uid: string, list: ListName, bookId: string) {
  return deleteDoc(doc(getDb(), "users", uid, list, bookId));
}

export function listenToList(
  uid: string,
  list: ListName,
  cb: (books: Book[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(collection(getDb(), "users", uid, list), orderBy("addedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as Book)),
    (e) => onError?.(e)
  );
}

export function listenToInList(
  uid: string,
  list: ListName,
  bookId: string,
  cb: (exists: boolean) => void
) {
  return onSnapshot(
    doc(getDb(), "users", uid, list, bookId),
    (snap) => cb(snap.exists()),
    () => cb(false)
  );
}
