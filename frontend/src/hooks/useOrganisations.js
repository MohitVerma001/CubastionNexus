import { useQuery } from '@tanstack/react-query';
import { getOrganisations } from '../services/organisations.service';

export default function useOrganisations() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organisations'],
    queryFn: getOrganisations,
  });

  return {
    organisations: data?.organisations ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
