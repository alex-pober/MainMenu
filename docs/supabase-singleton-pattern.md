# Supabase Singleton Pattern

This document describes the recommended pattern for using Supabase in this application.

## Problem

Previously, many components were creating new Supabase clients on every render:

```tsx
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

This is inefficient and can cause performance issues, especially in components that re-render frequently.

## Solution

We've implemented a singleton pattern for the Supabase client. This ensures that only one client instance is created for the entire application.

## How to Use

### In React Components

Use the `useSupabase` hook:

```tsx
import { useSupabase } from '@/hooks/use-supabase';

function MyComponent() {
  const { client: supabase, user, error, isLoading } = useSupabase();
  
  // Use supabase client
  // ...
}
```

### In Utility Functions

Use the `getSupabaseClient` function:

```tsx
import { getSupabaseClient } from '@/lib/utils/supabase-helpers';

function myUtilityFunction() {
  const supabase = getSupabaseClient();
  
  // Use supabase client
  // ...
}
```

### For One-off Queries

Use the `withSupabase` helper:

```tsx
import { withSupabase } from '@/lib/utils/supabase-helpers';

async function fetchData() {
  const result = await withSupabase(async (supabase) => {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
      
    if (error) throw error;
    return data;
  });
  
  return result;
}
```

## Benefits

- Improved performance by reusing the same client instance
- Reduced memory usage
- Consistent authentication state across the application
- Cleaner code with less duplication
