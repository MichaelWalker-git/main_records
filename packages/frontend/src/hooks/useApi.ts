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
      const response = await api.get(url);
      // Unwrap { data: ... } envelope if present
      const body = response.data;
      return (body && typeof body === 'object' && 'data' in body) ? body.data : body;
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
      const response = await api.get(url, { params });
      const body = response.data;
      const requestedPage = params?.page ?? 1;
      const requestedSize = params?.pageSize ?? 25;

      // Backend returns { data: [...], total, page, pageSize, totalPages? }
      if (body && typeof body === 'object' && 'data' in body && 'total' in body) {
        const total = Number(body.total) || 0;
        const pageSize = Number(body.pageSize) || requestedSize;
        const page = Number(body.page) || requestedPage;
        const totalPages = body.totalPages != null
          ? Number(body.totalPages)
          : Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
        return { data: body.data, total, page, pageSize, totalPages } as PaginatedResponse<T>;
      }
      // Backend returns { data: [...] } without pagination
      if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
        return { data: body.data, total: body.data.length, page: 1, pageSize: body.data.length || requestedSize, totalPages: 1 } as PaginatedResponse<T>;
      }
      // Backend returns raw array
      const arr = Array.isArray(body) ? body : [];
      return { data: arr, total: arr.length, page: 1, pageSize: arr.length || requestedSize, totalPages: 1 } as PaginatedResponse<T>;
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
