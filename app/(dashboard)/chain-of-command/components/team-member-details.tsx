"use client";

import { User, Users, Briefcase, ClipboardList, BookOpen, Building } from "lucide-react";

type ChainOfCommandData = {
  id: string;
  user_id: string;
  name: string;
  manager: string;
  jobtitle: string;
  criticalaccountabilities: { value: string }[];
  playbooksowned: { value: string }[];
  department: string;
  created_at?: string;
  updated_at?: string;
};

type TeamMemberDetailsProps = {
  data: ChainOfCommandData;
};

export default function TeamMemberDetails({ data }: TeamMemberDetailsProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <User className="h-4 w-4 text-blue-600 mr-2" />
            Name
          </div>
          <div className="text-base font-medium pl-6">
            {data.name || <span className="text-gray-400 italic">Not specified</span>}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            Manager
          </div>
          <div className="text-base font-medium pl-6">
            {data.manager || <span className="text-gray-400 italic">Not specified</span>}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
            Job Title
          </div>
          <div className="text-base font-medium pl-6">
            {data.jobtitle || <span className="text-gray-400 italic">Not specified</span>}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm font-medium text-gray-500">
            <Building className="h-4 w-4 text-blue-600 mr-2" />
            Department
          </div>
          <div className="text-base font-medium pl-6">
            {data.department || <span className="text-gray-400 italic">Not specified</span>}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
          <ClipboardList className="h-4 w-4 text-blue-600 mr-2" />
          Critical Accountabilities
        </div>
        {data.criticalaccountabilities.length > 0 ? (
          <div className="pl-6 space-y-2">
            {data.criticalaccountabilities.map((item, index) => (
              <div 
                key={index} 
                className="p-2 bg-gray-50 rounded text-sm border border-gray-100"
              >
                {item.value}
              </div>
            ))}
          </div>
        ) : (
          <div className="pl-6 text-gray-400 italic text-sm">
            No critical accountabilities specified
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
          <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
          Playbooks Owned
        </div>
        {data.playbooksowned.length > 0 ? (
          <div className="pl-6 space-y-2">
            {data.playbooksowned.map((item, index) => (
              <div 
                key={index} 
                className="p-2 bg-gray-50 rounded text-sm border border-gray-100"
              >
                {item.value}
              </div>
            ))}
          </div>
        ) : (
          <div className="pl-6 text-gray-400 italic text-sm">
            No playbooks specified
          </div>
        )}
      </div>
    </div>
  );
} 