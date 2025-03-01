/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface TableFetchProps {
  endpoint: (query: string) => Promise<any>;
  queryKey?: string;
  queryParams?: Record<string, any>; // Accept an object for dynamic query params
  enabled?: boolean
}

export const useTableFetch = ({ endpoint, queryKey, queryParams = {}, enabled = true }: TableFetchProps) => {
  const [tableConfig, setTableConfig] = useState({
    currentPage: 1,
    rowSize: 5,
  });

  // Convert queryParams object to a query string
  const buildQueryString = (params: Record<string, any>) =>
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

  const changeRowSize = (rowSize = 5) =>
    setTableConfig((prev) => ({
      ...prev,
      currentPage: 1,
      rowSize,
    }));

  const queryString = buildQueryString(queryParams);

  const { data, refetch, isPending, isRefetching } = useQuery({
    queryKey: [queryKey, tableConfig, queryString],
    queryFn: () =>
      endpoint(`?page=${tableConfig.currentPage}&limit=${tableConfig.rowSize}&${queryString}`),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled
  });

  const pageCount = Math.ceil(data?.data?.total / tableConfig.rowSize);

  return {
    data: data?.data?.data || [],
    total: data?.data?.total,
    fetch: refetch,
    isLoading: isPending || isRefetching,
    tableConfig,
    setTableConfig,
    pageCount,
    changeRowSize,
  };
};
