export type BookType = "audio" | "text" | "audio & text";
export type BookStatus = "selected" | "recommended" | "suggested";

export interface Book {
  id: string;
  author: string;
  title: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  totalRating: number;
  averageRating: number;
  keyIdeas: number;
  /** The API returns capitalised values (e.g. "Audio & Text"); compare case-insensitively. */
  type: BookType | string;
  status: BookStatus | string;
  subscriptionRequired: boolean;
  summary: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
}

export type Plan = "basic" | "premium" | "premium-plus";
