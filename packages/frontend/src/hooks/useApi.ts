import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from '../services/api';
import { PaginatedResponse } from '../types';

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get<T>(url);
      return response.data;
    },
    ...options,
  });
}

export function usePaginatedQuery<T>(
  key: string[],
  url: string,
  params?: { page?: number; pageSize?: number; [k: string]: unknown },
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [...key, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(url, { params });
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await api[method]<TData>(url, variables);
      return response.data;
    },
    ...options,
  });
}
