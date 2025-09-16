import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useStore } from '../../store';

const { FiUser, FiBuilding, FiLock, FiGlobe, FiBell, FiShield, FiSave, FiMail, FiPhone } = FiIcons;

const SettingsScreen: React.FC = () => {
  const { user, company } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'company', label: 'Company', icon: FiBuilding },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'language', label: 'Language & Region', icon: FiGlobe },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
  ];

  const ProfileSettings = () => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      jobTitle: '',
      bio: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiUser} className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">{user?.name}</h3>
            <p className="text-secondary-600 dark:text-secondary-400">{user?.email}</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Avatar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g., Project Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <Button>
          <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    );
  };

  const CompanySettings = () => {
    const [formData, setFormData] = useState({
      name: company?.name || '',
      address: '',
      phone: '',
      website: '',
      description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">Company Information</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Update your company details and business information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourcompany.com"
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St, City, State 12345"
        />

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your company and services..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-md">
          <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">Subscription Plan</h4>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
            Current Plan: <span className="font-medium text-primary-600 dark:text-primary-400">{company?.plan || 'Free'}</span>
          </p>
          <Button variant="outline" size="sm">
            Upgrade Plan
          </Button>
        </div>

        <Button>
          <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    );
  };

  const LanguageSettings = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">Language & Region</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Choose your preferred language and regional settings.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Language
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {languages.map(lang => (
                <label key={lang.code} className="flex items-center p-3 border border-secondary-300 dark:border-secondary-600 rounded-md cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={selectedLanguage === lang.code}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-lg mr-2">{lang.flag}</span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Timezone
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="America/New_York">Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">Central Time (CST/CDT)</option>
              <option value="America/Denver">Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </select>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-md">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiGlobe} className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-1">Multi-language Support</h4>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  ForemanOS will be available in multiple languages in future updates. 
                  Your language preference will be saved and applied automatically when support is added.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button>
          <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
          Save Language Settings
        </Button>
      </div>
    );
  };

  const AppearanceSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">Appearance</h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Customize the look and feel of ForemanOS.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100">Dark Mode</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Switch between light and dark themes
              </p>
            </div>
            <ThemeToggle size="lg" showLabel />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'company':
        return <CompanySettings />;
      case 'language':
        return <LanguageSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              This section is coming soon. We're working on adding more settings and customization options.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                        : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;