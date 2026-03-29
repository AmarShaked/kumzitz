import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../../services/pocketbase';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['auth'],
    queryFn: () => pb.authStore.record,
    initialData: pb.authStore.record,
  });

  const isAuthenticated = pb.authStore.isValid;

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return pb.collection('users').authWithPassword(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, username }: { email: string; password: string; username: string }) => {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        username,
      });
      return pb.collection('users').authWithPassword(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/');
    },
  });

  const logout = () => {
    pb.authStore.clear();
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    navigate('/');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
