import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=20'),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount:   countData?.count ?? 0,
    loading:       isLoading,
    markAllRead,
    refetch,
  };
}
