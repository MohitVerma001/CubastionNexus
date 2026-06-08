import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTickets } from '../services/tickets.service';

export default function useTickets(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => getTickets(filters),
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  return {
    tickets: data?.tickets ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refetch,
    filters,
    setFilters,
    updateFilter,
  };
}
