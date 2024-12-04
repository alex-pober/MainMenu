"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/ui/breadcrumb"
import { RestaurantForm } from "./restaurant-form"

export default function RestaurantInfoPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        segments={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Restaurant Info" },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Restaurant Information</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Profile</CardTitle>
          <CardDescription>
            Manage your restaurant&apos;s profile and business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RestaurantForm />
        </CardContent>
      </Card>
    </div>
  )
}
