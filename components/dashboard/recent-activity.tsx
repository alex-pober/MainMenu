"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    user: {
      name: "John Smith",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      initials: "JS"
    },
    action: "updated the price of Margherita Pizza",
    time: "2 minutes ago"
  },
  {
    user: {
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      initials: "SJ"
    },
    action: "added new menu item: Vegan Buddha Bowl",
    time: "1 hour ago"
  },
  {
    user: {
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      initials: "MC"
    },
    action: "marked Seafood Pasta as unavailable",
    time: "3 hours ago"
  }
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.image} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.action}
            </p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
}