"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
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
  const [profile, setProfile] = useState<RestaurantFormValues | null>(null)

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
    async function loadProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.log('Supabase session error:', sessionError);
          throw sessionError;
        }
        
        if (!session) {
          return;
        }

        const { data, error: profileError } = await supabase
          .from("restaurant_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
        
        if (profileError) {
          console.log('Supabase profile fetch error:', {
            error: profileError,
            userId: session.user.id
          });
          throw profileError;
        }
        
        setProfile(data);
        // Update form values when profile is loaded
        if (data) {
          Object.keys(data).forEach((key) => {
            form.setValue(key as keyof RestaurantFormValues, data[key]);
          });
        }
      } catch (error) {
        console.log('Profile loading error details:', {
          error,
          timestamp: new Date().toISOString()
        });
        toast.error('Failed to load restaurant profile')
      }
    }

    loadProfile()
  }, [form]) // Add form to dependencies

  useEffect(() => {
    if (profile) {
      Object.keys(profile).forEach((key) => {
        form.setValue(key as keyof RestaurantFormValues, profile[key as keyof RestaurantFormValues]);
      });
    }
  }, [profile, form]);

  async function onSubmit(data: RestaurantFormValues) {
    try {
      setIsLoading(true)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log('Supabase session error:', sessionError);
        throw sessionError;
      }
      
      if (!session) throw new Error("Not authenticated")

      // First try to update
      const { data: updatedProfile, error: updateError } = await supabase
        .from("restaurant_profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (updateError) {
        console.log('Supabase update error:', {
          error: updateError,
          data: {
            ...data,
            user_id: session.user.id,
          }
        });
        throw updateError;
      }

      // Update local state with the new data
      setProfile(updatedProfile);
      form.reset(updatedProfile); // This marks the form as pristine

      toast.success("Restaurant information updated", {
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.log("Profile update error details:", {
        error,
        formData: data,
        session: await supabase.auth.getSession(),
        timestamp: new Date().toISOString()
      });
      toast.error("Failed to update restaurant information")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {form.formState.isDirty && (
          <Alert 
            variant="warning" 
            className="mb-6 sticky top-4 z-10 animate-in fade-in slide-in-from-top duration-300 shadow-md"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You have unsaved changes. Please save your changes before leaving this page.
              </span>
              <Button 
                size="sm" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="ml-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Now
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="space-y-4">
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
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : form.formState.isDirty ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
