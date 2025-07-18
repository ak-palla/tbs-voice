"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type MachineData = {
  id: string;
  user_id: string;
  enginename: string;
  enginetype: string;
  description: string;
  triggeringevents: { value: string }[];
  endingevent: { value: string }[];
  actionsactivities: { value: string }[];
  created_at: string;
  updated_at: string;
};

interface MachineDetailsProps {
  machine: MachineData;
  onEdit: () => void;
  onClose: () => void;
}

export default function MachineDetails({ machine, onEdit, onClose }: MachineDetailsProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{machine.enginename}</h3>
          <p className="text-sm text-gray-500">
            Last updated: {formatDate(machine.updated_at)}
          </p>
        </div>
        <Button
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      
      {machine.description && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 whitespace-pre-line">{machine.description}</p>
        </div>
      )}
      
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Triggering Events</h4>
          {machine.triggeringevents && machine.triggeringevents.length > 0 ? (
            <ul className="space-y-2">
              {machine.triggeringevents.map((event, index) => (
                <li key={index} className="bg-gray-50 px-3 py-2 rounded-md text-sm">
                  {event.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-sm">No triggering events defined</p>
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Ending Events</h4>
          {machine.endingevent && machine.endingevent.length > 0 ? (
            <ul className="space-y-2">
              {machine.endingevent.map((event, index) => (
                <li key={index} className="bg-gray-50 px-3 py-2 rounded-md text-sm">
                  {event.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-sm">No ending events defined</p>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Actions & Activities</h4>
        {machine.actionsactivities && machine.actionsactivities.length > 0 ? (
          <ul className="space-y-2">
            {machine.actionsactivities.map((action, index) => (
              <li key={index} className="bg-gray-50 px-3 py-2 rounded-md text-sm">
                {action.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic text-sm">No actions or activities defined</p>
        )}
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
} 