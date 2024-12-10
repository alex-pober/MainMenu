// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSupabase } from "@/hooks/use-supabase"
import { Loader2, Save, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BusinessHoursEditor } from "@/components/forms/business-hours-editor"
import { ImageUpload } from "@/components/forms/image-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"

const restaurantFormSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  banner_image_url: z.string().optional().nullable(),
  logo_image_url: z.string().optional().nullable(),
  business_hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional()
  })).optional().nullable(),
  social_media: z.record(z.string()).optional().nullable(),
})

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>

export function RestaurantForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { client: supabase, user, error: supabaseError, isLoading: isSupabaseLoading } = useSupabase({ requireAuth: true })
  const [loadError, setLoadError] = useState<string | null>(null)

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      phone_number: "",
      email: "",
      website: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      banner_image_url: "",
      logo_image_url: "",
      business_hours: null,
      social_media: null,
    },
  })

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form.formState.isDirty])

  useEffect(() => {
    if (isSupabaseLoading) {
      console.log('Waiting for Supabase to initialize...');
      return;
    }

    async function loadProfile() {
      try {
        setLoadError(null);
        if (!supabase || !user) {
          console.error('Supabase or user not available');
          setLoadError('Unable to connect to the service');
          return;
        }

        console.log('Loading profile for user:', user.id);
        const { data, error } = await supabase
          .from("restaurant_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          setLoadError(error.message);
          return;
        }

        console.log('Loaded profile data:', data);
        if (data) {
          form.reset({
            name: data.name || "",
            description: data.description || "",
            phone_number: data.phone_number || "",
            email: data.email || "",
            website: data.website || "",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            city: data.city || "",
            state: data.state || "",
            postal_code: data.postal_code || "",
            country: data.country || "",
            banner_image_url: data.banner_image_url || "",
            logo_image_url: data.logo_image_url || "",
            business_hours: data.business_hours || null,
            social_media: data.social_media || null,
          }, { 
            keepDirty: false,
            keepIsSubmitted: false,
            keepTouched: false,
            keepIsValid: false,
            keepErrors: false,
          });
        }
      } catch (error) {
        console.error('Profile loading error:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load profile');
      }
    }

    loadProfile();
  }, [supabase, user, form, isSupabaseLoading]);

  async function onSubmit(data: RestaurantFormValues) {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      if (!supabase || !user) {
        throw new Error('Unable to connect to the service');
      }

      console.log('Updating profile with data:', data);
      const { data: updatedProfile, error: updateError } = await supabase
        .from("restaurant_profiles")
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully:', updatedProfile);
      form.reset(updatedProfile, {
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepErrors: false,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }

  if (supabaseError || loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {supabaseError || loadError}
        </AlertDescription>
      </Alert>
    );
  }

  if (isSupabaseLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter restaurant name" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="banner_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    imageType="banner"
                    uid={user?.id || ''}
                    onUploadComplete={() => form.handleSubmit(onSubmit)()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    imageType="logo"
                    uid={user?.id || ''}
                    onUploadComplete={() => form.handleSubmit(onSubmit)()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your restaurant"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter email" 
                    type="email" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter website URL" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          
          <FormField
            control={form.control}
            name="address_line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Street address" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Apartment, suite, etc." 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="City" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="State" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Postal code" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Country" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Hours</h3>
          <FormField
            control={form.control}
            name="business_hours"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <BusinessHoursEditor
                    value={field.value || {
                      monday: { open: "09:00", close: "17:00" },
                      tuesday: { open: "09:00", close: "17:00" },
                      wednesday: { open: "09:00", close: "17:00" },
                      thursday: { open: "09:00", close: "17:00" },
                      friday: { open: "09:00", close: "17:00" },
                      saturday: { open: "10:00", close: "15:00" },
                      sunday: { open: "10:00", close: "15:00" },
                    }}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isLoading || !form.formState.isDirty} 
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : form.formState.isDirty ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
