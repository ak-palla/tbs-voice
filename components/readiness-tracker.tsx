"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, CheckCircle2, Circle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data for demonstration
const pages = [
  {
    name: "Dashboard",
    href: "/dashboard",
    progress: 100,
  },
  {
<<<<<<< HEAD
    name: "CHQ Timeline",
    href: "/chq-timeline",
    progress: 87,
  },
  {
    name: "Chain of Command",
    href: "/chain-of-command",
=======
    name: "Calendar",
    href: "/calendar",
    progress: 87,
  },
  {
    name: "User Management",
    href: "/users",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    progress: 75,
  },
  {
    name: "Triage Planner",
    href: "/triage-planner",
    progress: 45,
  },
  {
    name: "Business Battle Plan",
<<<<<<< HEAD
    href: "/battle-plan",
=======
    href: "/business-battle-plan",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    progress: 30,
  },
  {
    name: "12Q Planner",
    href: "/planner",
    progress: 90,
  },
  {
    name: "HWGT Plan",
    href: "/hwgt-plan",
    progress: 25,
  },
  {
    name: "Growth Machine Planner",
    href: "/growth-planner",
    progress: 50,
  },
  {
    name: "Growth Machine",
    href: "/growth-machine",
    progress: 65,
  },
  {
    name: "Growth Engine Library",
    href: "/growth-library",
    progress: 80,
  },
  {
<<<<<<< HEAD
    name: "Fulfillment Planner",
=======
    name: "Fulfilment Planner",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    href: "/fulfillment-planner",
    progress: 40,
  },
  {
<<<<<<< HEAD
    name: "Fulfillment Machine",
=======
    name: "Fulfilment Machine",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    href: "/fulfillment",
    progress: 55,
  },
  {
<<<<<<< HEAD
    name: "Fulfillment Engine Library",
=======
    name: "Fulfilment Engine Library",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    href: "/fulfillment-library",
    progress: 70,
  },
  {
    name: "Playbook Planner",
    href: "/playbook-planner",
    progress: 35,
  },
  {
    name: "Company Scorecard",
    href: "/scorecard",
    progress: 95,
  },
  {
    name: "Meeting Rhythm",
    href: "/meetings",
    progress: 85,
  },
  {
    name: "Quarterly Sprint",
    href: "/sprint",
    progress: 60,
  },
];

export function ReadinessTracker() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate overall progress
  const overallProgress = Math.round(
    pages.reduce((acc, page) => acc + page.progress, 0) / pages.length
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "bg-white rounded-2xl -xl transition-all duration-300 border border-gray-100",
          isExpanded ? "w-[380px] h-[calc(100vh-2rem)]" : "w-26"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => !isExpanded && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-full px-2 py-1 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
            
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                {overallProgress}%
              </span>
            </div>
           
              <span className="text-base font-medium">Readiness Tracker</span>
            
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showTooltip && !isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg -lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Chatbot Readiness: {overallProgress}%</span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="px-6 py-4 border-t">
            <div className="space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              {pages.map((page) => (
                <div key={page.href} className="flex items-start gap-3">
                  <div className="mt-1">
                    {page.progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800">{page.name}</span>
                      <span className="text-sm text-gray-600 ml-2">{page.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all bg-blue-500"
                        style={{ width: `${page.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 