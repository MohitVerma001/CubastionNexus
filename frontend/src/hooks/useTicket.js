import { useQuery } from '@tanstack/react-query';
import { getTicket, getAttachments } from '../services/tickets.service';
import { getComments } from '../services/comments.service';

export default function useTicket(id) {
  const ticketQuery = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
    enabled: !!id,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id),
    enabled: !!id,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  const attachmentsQuery = useQuery({
    queryKey: ['attachments', id],
    queryFn: () => getAttachments(id),
    enabled: !!id,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  const refetch = () => Promise.all([
    ticketQuery.refetch(),
    commentsQuery.refetch(),
    attachmentsQuery.refetch(),
  ]);

  return {
    ticket:      ticketQuery.data?.ticket ?? ticketQuery.data,
    comments:    commentsQuery.data?.comments ?? commentsQuery.data ?? [],
    attachments: attachmentsQuery.data?.attachments ?? attachmentsQuery.data ?? [],
    loading:     ticketQuery.isLoading || commentsQuery.isLoading,
    error:       ticketQuery.error ?? commentsQuery.error,
    refetch,
  };
}
