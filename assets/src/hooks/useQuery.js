import { useRouter } from 'next/router';

const useQuery = () => {
  const router = useRouter();

  console.log(router);

  return new URLSearchParams(router.pathname);
};

export default useQuery;
