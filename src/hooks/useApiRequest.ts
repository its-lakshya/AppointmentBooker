// hooks/useApiRequest.ts
"use client";

import { apiRequest } from "@/utils/api/apiRequest";
import { useState, useEffect } from "react";

export function useApiRequest<T>(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    // eslint-disable-next-line
    body?: any;
    headers?: HeadersInit;
    immediate?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(options?.immediate !== false);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await apiRequest<T>(endpoint, options);
    setData(result.data);
    setError(result.error);
    setIsLoading(false);
  };

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, [endpoint]);

  return { data, error, isLoading, refetch: fetchData };
}
