import React from 'react';

interface ActivityListProps {
  activities: Array<{
    type: string;
    timestamp: string;
    credits: number;
    details?: Record<string, any>;
  }>;
  title: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  title
}) => {
  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div 
              key={index} 
              className="flex justify-between items-start py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
                {activity.details && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {Object.entries(activity.details).map(([key, value]) => (
                      <span key={key} className="mr-4">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-accent-500 font-medium">
                {activity.credits} credits
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};