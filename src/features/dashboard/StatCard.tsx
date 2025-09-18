import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardContent } from '../../components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType }) => {
  const iconColor = changeType === 'increase' ? 'text-success-600' :
                    changeType === 'decrease' ? 'text-danger-600' : 'text-primary-600';
  const iconBgColor = changeType === 'increase' ? 'bg-success-100' :
                      changeType === 'decrease' ? 'bg-danger-100' : 'bg-primary-100';

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 truncate">{title}</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBgColor} dark:bg-opacity-20`}>
            <SafeIcon icon={icon} className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
        {change && (
          <div className="mt-2 flex items-center text-sm">
            <span className={`font-semibold ${changeType === 'increase' ? 'text-success-600' : 'text-danger-600'}`}>
              {change}
            </span>
            <span className="text-secondary-500 dark:text-secondary-400 ml-1">vs. last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
