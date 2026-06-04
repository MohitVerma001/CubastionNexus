import { useQuery } from '@tanstack/react-query';
import { getStats } from '../services/admin.service';

export default function useAdminStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
    refetchInterval: 60000,
  });

  return {
    stats: data,
    loading: isLoading,
    error,
    refetch,
  };
}
