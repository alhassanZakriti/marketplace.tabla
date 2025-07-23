"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

interface QueryProviderProps {
  children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time before data is considered stale
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Time to keep data in cache when not in use
            gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except 401
              if (error?.status >= 400 && error?.status < 500 && error?.status !== 401) {
                return false
              }
              return failureCount < 3
            },
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except 401
              if (error?.status >= 400 && error?.status < 500 && error?.status !== 401) {
                return false
              }
              return failureCount < 2
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
