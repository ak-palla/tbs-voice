"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateFilterPopupProps {
  onDateChange: (startDate: string, endDate: string, label: string) => void;
  currentRange: DateRange;
}

export default function DateFilterPopup({ onDateChange, currentRange }: DateFilterPopupProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const presets: DateRange[] = [
    {
      startDate: '7daysAgo',
      endDate: 'today',
      label: 'Last 7 days'
    },
    {
      startDate: '30daysAgo',
      endDate: 'today',
      label: 'Last 30 days'
    },
    {
      startDate: '90daysAgo',
      endDate: 'today',
      label: 'Last 90 days'
    },
   
  ];

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];

  const handlePresetClick = (preset: DateRange) => {
    onDateChange(preset.startDate, preset.endDate, preset.label);
    setShowCustom(false);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const label = `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
      onDateChange(customStartDate, customEndDate, label);
      setShowCustom(false);
    }
  };

  const toggleCustom = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      setCustomStartDate(thirtyDaysAgoString);
      setCustomEndDate(today);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {currentRange.label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3">Select Date Range</h4>
            <div className="space-y-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={currentRange.label === preset.label ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="w-full justify-start"
                >
                  {preset.label}
                </Button>
              ))}
              
              <Button
                variant={showCustom ? "default" : "ghost"}
                size="sm"
                onClick={toggleCustom}
                className="w-full justify-start"
              >
                Custom Range
                <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${showCustom ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {showCustom && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  size="sm"
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button
                  onClick={() => setShowCustom(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 