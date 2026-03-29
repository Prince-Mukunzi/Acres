import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
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
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce<string>(query, delay);

  useEffect(() => {
    // If the user clears the search bar, clear the results and don't fetch
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchApi(
          `${apiUrl}?q=${encodeURIComponent(debouncedQuery)}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery, apiUrl]);

  return { query, setQuery, results, isLoading, error };
}
