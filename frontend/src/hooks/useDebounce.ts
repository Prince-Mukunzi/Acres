import { useState, useEffect } from "react";

//  <T> to accpet any data type
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // restart time if value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
