import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSongs, getSong, getTopArtists, createSong, updateSong, deleteSong } from '../../../services/api';

export function useSongList(search?: string, artist?: string) {
  return useQuery({
    queryKey: ['songs', { search, artist }],
    queryFn: () => getSongs({ search, artist }),
  });
}

export function useTopArtists() {
  return useQuery({
    queryKey: ['artists', 'top'],
    queryFn: () => getTopArtists(),
    staleTime: 60_000,
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: ['songs', id],
    queryFn: () => getSong(id),
    enabled: !!id,
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['artists', 'top'] });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSong>[1] }) =>
      updateSong(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songs', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['artists', 'top'] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['artists', 'top'] });
    },
  });
}
