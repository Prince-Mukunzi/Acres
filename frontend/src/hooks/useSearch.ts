import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";

interface SearchHook<T> {
  query: string;
  setQuery: (val: string) => void;
  results: T[];
  isLoading: boolean;
  error: string | null;
}

export function useSearch<T>(
  apiUrl: string,
  delay: number = 500
): SearchHook<T> {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce<string>(query, delay);

  const { data, isLoading, error } = useQuery<T[]>({
    queryKey: ["search", apiUrl, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await fetchApi(
        `${apiUrl}?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60000,
  });

  return {
    query,
    setQuery,
    results: data || [],
    isLoading: isLoading && debouncedQuery.trim().length > 0,
    error: error instanceof Error ? error.message : null,
  };
}
