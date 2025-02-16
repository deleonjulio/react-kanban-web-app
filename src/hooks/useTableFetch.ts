/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

export const useTableFetch = ({endpoint = null, queryKey}: {endpoint: any, queryKey?: string}) => {
    const [tableConfig, setTableConfig] = useState({
        currentPage: 1,
        rowSize: 5,
        // rows: new Array(70).fill(1).map((_, index) => index + 1)
    })

    const changeRowSize = (rowSize = 5) => setTableConfig((prev) => ({
      ...prev,
      currentPage: 1,
      rowSize
    }))
    const {
        data,
        refetch,
        isRefetching,
      } = useQuery({
        queryKey: [queryKey, tableConfig],
        // &search=${tableConfig.search}${tableConfig.filter}
        queryFn: () => endpoint(`?page=${tableConfig.currentPage}&limit=${tableConfig.rowSize}`),
        // staleTime: 0,
        // cacheTime: 0,
        refetchOnWindowFocus: false,
        retry: false,
      })

    const pageCount = Math.ceil(data?.data?.total / tableConfig?.rowSize)

    return { data: data?.data?.data || [], total: data?.data?.total, fetch: refetch, isLoading: isRefetching, tableConfig, setTableConfig, pageCount, changeRowSize }
}