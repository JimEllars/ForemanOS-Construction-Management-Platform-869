import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { demoDataService } from '../../services/demoDataService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const { FiRss } = FiIcons;

const activityIcons = {
  'project-created': FiIcons.FiFolderPlus,
  'task-completed': FiIcons.FiCheckSquare,
  'log-submitted': FiIcons.FiFileText,
  'user-invited': FiIcons.FiUserPlus,
};

const RecentActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await demoDataService.getRecentActivities();
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SafeIcon icon={FiRss} className="w-5 h-5 mr-3 text-primary-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner message="Loading activities..." />
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-4">
                <div className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-full">
                  <SafeIcon icon={activityIcons[activity.type] || FiIcons.FiActivity} className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary-800 dark:text-secondary-200" dangerouslySetInnerHTML={{ __html: activity.description }} />
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{activity.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
