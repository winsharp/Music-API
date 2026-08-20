import type { RatedItem } from "./ratedItem";

export interface UserList {
    id: string;
    name: string;
    items: Omit<RatedItem, "rating" | "ratedAt">[]; // snapshot of item info, no rating needed here
    createdAt: string;
}