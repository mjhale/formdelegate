import { useRouter } from 'next/router';

const useQuery = () => {
  const router = useRouter();

  return new URLSearchParams(router.pathname);
};

export default useQuery;
