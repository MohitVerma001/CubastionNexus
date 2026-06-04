import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/users.service';

export default function useUsers(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });

  return {
    users: data?.users ?? [],
    loading: isLoading,
    error,
    refetch,
    filters,
    setFilters,
  };
}
