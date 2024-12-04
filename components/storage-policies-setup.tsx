'use client';

import { useEffect } from 'react';
import { setupStoragePolicies } from '@/lib/utils/storage-policies';

export function StoragePoliciesSetup() {
  useEffect(() => {
    setupStoragePolicies().catch(console.error);
  }, []);

  return null;
}
