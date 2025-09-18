// This service is no longer needed since demo functionality has been removed
// Keeping file for potential future use with sample data

export const demoDataService = {
  async createSampleData() {
    // This function could be used in the future to create sample data
    // for new users if needed, but is not currently implemented
    console.log('Sample data service available for future use');
    return true;
  },

  async getRecentActivities() {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        type: 'project-created',
        description: '<strong>Jules</strong> created a new project: <strong>Skyscraper Tower</strong>',
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        type: 'task-completed',
        description: '<strong>Greta</strong> completed a task: <strong>Finalize blueprints</strong>',
        timestamp: '5 hours ago',
      },
      {
        id: '3',
        type: 'log-submitted',
        description: '<strong>Jules</strong> submitted a daily log for <strong>Skyscraper Tower</strong>',
        timestamp: 'Yesterday',
      },
      {
        id: '4',
        type: 'user-invited',
        description: 'You invited <strong>new.dev@example.com</strong> to the team',
        timestamp: '2 days ago',
      },
    ];
  }
};