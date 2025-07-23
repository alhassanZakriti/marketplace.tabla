'use client'

import { useQuery } from '@tanstack/react-query'
import { cityDataProvider, type City, type CitiesAPIResponse } from '@/lib/dataProvider'

// Query keys for cities
export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: () => [...cityKeys.lists()] as const,
  details: () => [...cityKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...cityKeys.details(), id] as const,
}

// Get all cities
export const useCities = () => {
  return useQuery({
    queryKey: cityKeys.list(),
    queryFn: () => cityDataProvider.getCities(),
    staleTime: 30 * 60 * 1000, // 30 minutes - cities don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Get single city
export const useCity = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => cityDataProvider.getCity(id),
    enabled: enabled && !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
