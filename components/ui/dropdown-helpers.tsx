"use client";

import { Building2, User, Hash, Percent, DollarSign, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomDropdown, type DropdownOption } from "./custom-dropdown";

// Types for common dropdown data
export interface Department {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  profile_picture_url?: string;
}

// Utility function to get metric type icon
export const getMetricTypeIcon = (metricType: string) => {
  switch (metricType) {
    case "Currency / Revenue":
      return DollarSign;
    case "Percentages":
      return Percent;
    case "Numeric Count":
    default:
      return Hash;
  }
};

// Utility function to get format hint for metric types
export const getFormatHint = (metricType: string): string => {
  switch (metricType) {
    case "Currency / Revenue":
      return "Will display as: £1,234";
    case "Percentages":
      return "Will display as: 85%";
    case "Numeric Count":
    default:
      return "Will display as: 1,234";
  }
};

// Department Dropdown Component
interface DepartmentDropdownProps {
  value: string;
  onChange: (value: string) => void;
  departments: Department[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  allowNone?: boolean;
  noneLabel?: string;
}

export const DepartmentDropdown = ({
  value,
  onChange,
  departments,
  placeholder = "Select department",
  className,
  size = "md",
  allowNone = true,
  noneLabel = "No Department"
}: DepartmentDropdownProps) => {
  const options: DropdownOption[] = [
    ...(allowNone ? [{ value: "", label: noneLabel, data: null }] : []),
    ...departments.map(dept => ({ value: dept.id, label: dept.name, data: dept }))
  ];

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      size={size}
      className={className}
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded bg-gray-200 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-gray-500">{option.label}</span>
            </>
          )}
        </div>
      )}
      renderSelected={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded bg-gray-200 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-gray-500">{option.label}</span>
            </>
          )}
        </div>
      )}
    />
  );
};

// Team Member Dropdown Component
interface TeamMemberDropdownProps {
  value: string;
  onChange: (value: string) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  allowNone?: boolean;
  noneLabel?: string;
}

export const TeamMemberDropdown = ({
  value,
  onChange,
  teamMembers,
  placeholder = "Select team member",
  className,
  size = "md",
  allowNone = true,
  noneLabel = "No Owner"
}: TeamMemberDropdownProps) => {
  const options: DropdownOption[] = [
    ...(allowNone ? [{ value: "", label: noneLabel, data: null }] : []),
    ...teamMembers.map(member => ({ value: member.id, label: member.full_name, data: member }))
  ];

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      size={size}
      className={className}
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={option.data.profile_picture_url || ''} alt={option.data.full_name} />
                <AvatarFallback>{option.data.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-gray-500">{option.label}</span>
            </>
          )}
        </div>
      )}
      renderSelected={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={option.data.profile_picture_url || ''} alt={option.data.full_name} />
                <AvatarFallback>{option.data.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-400" />
              </div>
              <span className="text-gray-500">{option.label}</span>
            </>
          )}
        </div>
      )}
    />
  );
};

// Metric Type Dropdown Component
interface MetricTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  metricTypes: string[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showHints?: boolean;
}

export const MetricTypeDropdown = ({
  value,
  onChange,
  metricTypes,
  placeholder = "Select metric type",
  className,
  size = "md",
  showHints = true
}: MetricTypeDropdownProps) => {
  const options: DropdownOption[] = metricTypes.map(type => ({ 
    value: type, 
    label: type, 
    data: type 
  }));

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      size={size}
      className={className}
      renderOption={(option) => {
        const IconComponent = getMetricTypeIcon(option.data);
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-50">
              <IconComponent className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              {showHints && (
                <span className="text-xs text-gray-500">{getFormatHint(option.data)}</span>
              )}
            </div>
          </div>
        );
      }}
      renderSelected={(option) => {
        const IconComponent = getMetricTypeIcon(option.data);
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-50">
              <IconComponent className="h-3 w-3 text-blue-600" />
            </div>
            <span>{option.label}</span>
          </div>
        );
      }}
    />
  );
};

// Department Filter Dropdown (for filtering lists)
interface DepartmentFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  departments: Department[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  allLabel?: string;
}

export const DepartmentFilterDropdown = ({
  value,
  onChange,
  departments,
  placeholder = "All Departments",
  className,
  size = "md",
  allLabel = "All Departments"
}: DepartmentFilterDropdownProps) => {
  const options: DropdownOption[] = [
    { value: "all", label: allLabel, data: null },
    ...departments.map(dept => ({ value: dept.id, label: dept.name, data: dept }))
  ];

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      size={size}
      className={className}
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{option.label}</span>
            </>
          )}
        </div>
      )}
      renderSelected={(option) => (
        <div className="flex items-center gap-2">
          {option.data ? (
            <>
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{option.label}</span>
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{option.label}</span>
            </>
          )}
        </div>
      )}
    />
  );
}; 