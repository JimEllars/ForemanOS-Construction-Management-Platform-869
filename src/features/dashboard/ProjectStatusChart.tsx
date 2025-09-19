import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiPieChart } = FiIcons;

const ProjectStatusChart: React.FC = () => {
  const projects = useStore(state => state.data.projects);

  const statusCounts = projects.reduce((acc, project) => {
    const status = project.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: '#6b7280', // text-secondary-500
      },
    },
    series: [
      {
        name: 'Project Status',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
        color: [
          '#3b82f6', // primary-500 for 'in_progress'
          '#10b981', // success-500 for 'completed'
          '#f59e0b', // warning-500 for 'on_hold'
          '#6b7280', // secondary-500 for 'planning'
        ],
      },
    ],
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SafeIcon icon={FiPieChart} className="w-5 h-5 mr-3 text-primary-600" />
          Project Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '300px' }} />
      </CardContent>
    </Card>
  );
};

export default ProjectStatusChart;
