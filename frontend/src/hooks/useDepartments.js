import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../services/departments.service';

export default function useDepartments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  return {
    departments: data?.departments ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
