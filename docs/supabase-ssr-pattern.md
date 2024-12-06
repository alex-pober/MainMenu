# Supabase SSR Client Pattern

## Overview

This document outlines our pattern for using Supabase with Server-Side Rendering (SSR) in the MainMenu application. We use the `@supabase/ssr` package to ensure proper authentication state management across both client and server components.

## Key Principles

1. **Create New Client Per Operation**: Always create a new Supabase client instance for each operation to ensure fresh authentication state.
2. **No Global Client**: Avoid using a global Supabase client instance to prevent stale authentication states.
3. **Consistent Error Handling**: Always include proper error handling and logging.

## Pattern Implementation

### 1. Importing the Client

```typescript
import { createBrowserClient } from '@supabase/ssr';
```

### 2. Creating a Client Instance

```typescript
const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

### 3. Using in Async Operations

```typescript
async function someOperation() {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('your_table')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}
```

### 4. Using in React Components

```typescript
function YourComponent() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Your Supabase operations here
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);
}
```

## Common Use Cases

### Authentication Check

```typescript
const checkAuth = async () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
```

### Database Operations

```typescript
const updateRecord = async (table: string, id: string, data: any) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
};
```

### Storage Operations

```typescript
const uploadFile = async (bucket: string, path: string, file: File) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) throw error;
  return data;
};
```

## Best Practices

1. **Error Handling**
   - Always check for errors in Supabase responses
   - Use try-catch blocks around Supabase operations
   - Include meaningful error messages and logging

2. **Authentication State**
   - Don't store the Supabase client in state or context
   - Create a new client instance for each operation
   - Use the useSupabase hook for reactive auth state

3. **Performance**
   - Create the client only when needed
   - Don't create multiple clients in rapid succession
   - Clean up subscriptions and listeners in useEffect

4. **Type Safety**
   - Use TypeScript types for database tables
   - Define proper interfaces for your data structures
   - Avoid using @ts-ignore with Supabase operations

## Troubleshooting

Common issues and their solutions:

1. **Authentication Errors**
   - Ensure you're creating a new client instance for each operation
   - Check if the user is properly authenticated
   - Verify environment variables are correctly set

2. **Stale Data**
   - Create a new client instance instead of reusing an old one
   - Implement proper data refetching strategies
   - Use real-time subscriptions when needed

3. **Type Errors**
   - Define proper TypeScript interfaces for your data
   - Use the generated types from Supabase
   - Update types when database schema changes

## Migration Guide

When migrating from the old pattern:

1. Remove imports of the global Supabase client:
   ```typescript
   // Remove this
   import { supabase } from '@/lib/supabase';
   ```

2. Add the new import:
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';
   ```

3. Create new client instances for each operation:
   ```typescript
   const supabase = createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

4. Update error handling and logging to be more detailed

## Notes

- The `@/lib/utils` directory still uses the old pattern and should not be modified
- Always test authentication flows after making changes
- Monitor for any performance impacts when creating multiple client instances
