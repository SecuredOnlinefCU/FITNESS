export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export type LoadResult<T> = {
  data: T | null;
  status: LoadStatus;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};
