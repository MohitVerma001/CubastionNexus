import { useQuery } from '@tanstack/react-query';
import { getTicket } from '../services/tickets.service';
import { getComments } from '../services/comments.service';

export default function useTicket(id) {
  const ticketQuery = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
    enabled: !!id,
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id),
    enabled: !!id,
  });

  const refetch = () => Promise.all([ticketQuery.refetch(), commentsQuery.refetch()]);

  return {
    ticket: ticketQuery.data,
    comments: commentsQuery.data ?? [],
    loading: ticketQuery.isLoading || commentsQuery.isLoading,
    error: ticketQuery.error ?? commentsQuery.error,
    refetch,
  };
}
