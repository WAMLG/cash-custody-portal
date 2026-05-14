import type { CollectionResponse } from "@/types";

export function unwrapCollection<T>(
  response: T[] | CollectionResponse<T>,
): T[] {
  return Array.isArray(response) ? response : response.data;
}
