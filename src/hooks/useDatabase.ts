import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { dbService } from '../services/database';

export function useDatabase() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.companyName) {
      dbService.setCompanyContext(user.companyName);
    }
  }, [user?.companyName]);

  return dbService;
}