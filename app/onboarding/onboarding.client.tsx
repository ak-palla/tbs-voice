'use client';

<<<<<<< HEAD
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
=======
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
<<<<<<< HEAD
=======
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Progress } from "@/components/ui/progress";
import { signOutAction } from "@/app/actions";
import Link from "next/link";
<<<<<<< HEAD
import { HelpCircle, LogOut, ChevronLeft, ChevronRight, CheckCircle, Check, Menu, Clock, Settings, Zap, Target, Sparkles, Wand2, RefreshCw, Loader2 } from "lucide-react";
=======
import { HelpCircle, LogOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, Check, Menu, Clock, Settings, Zap, Target, Sparkles, Wand2, RefreshCw, Loader2, MessageCircle, Bot, Send, X, ArrowRight, Users, Building, DollarSign, TrendingUp, Calendar as CalendarIcon, MapPin, Mail, Phone, FileText, Lightbulb, PoundSterling } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Animated AI Blob Component
function AnimatedAIBlob({ className = "w-5 h-5", isActive = false }: { className?: string; isActive?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        {/* Main blob */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ${
            isActive ? 'animate-pulse scale-110' : ''
          }`}
          style={{
            animation: isActive 
              ? 'blob-active 2s ease-in-out infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
              : 'blob-idle 4s ease-in-out infinite'
          }}
        />
        
        {/* Inner glow */}
        <div 
          className="absolute inset-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-60"
          style={{
            animation: isActive 
              ? 'blob-glow-active 1.5s ease-in-out infinite reverse' 
              : 'blob-glow-idle 3s ease-in-out infinite reverse'
          }}
        />
        
        {/* Core highlight */}
        <div 
          className="absolute inset-2 rounded-full bg-white opacity-30"
          style={{
            animation: 'blob-highlight 2.5s ease-in-out infinite'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes blob-idle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            border-radius: 50%;
          }
          25% { 
            transform: scale(1.1) rotate(90deg);
            border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
          }
          50% { 
            transform: scale(0.95) rotate(180deg);
            border-radius: 30% 70% 70% 30%/40% 60% 40% 60%;
          }
          75% { 
            transform: scale(1.05) rotate(270deg);
            border-radius: 70% 30% 40% 60%/30% 70% 60% 40%;
          }
        }
        
        @keyframes blob-active {
          0%, 100% { 
            transform: scale(1.1) rotate(0deg);
            border-radius: 40% 60% 70% 30%/40% 50% 60% 50%;
          }
          20% { 
            transform: scale(1.2) rotate(72deg);
            border-radius: 60% 40% 50% 50%/30% 60% 40% 70%;
          }
          40% { 
            transform: scale(0.9) rotate(144deg);
            border-radius: 50% 50% 30% 70%/50% 40% 60% 40%;
          }
          60% { 
            transform: scale(1.15) rotate(216deg);
            border-radius: 70% 30% 60% 40%/60% 70% 30% 50%;
          }
          80% { 
            transform: scale(1.0) rotate(288deg);
            border-radius: 30% 70% 40% 60%/50% 30% 70% 40%;
          }
        }
        
        @keyframes blob-glow-idle {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.3;
          }
        }
        
        @keyframes blob-glow-active {
          0%, 100% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.4);
            opacity: 0.4;
          }
        }
        
        @keyframes blob-highlight {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.3);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { SubmissionLoader } from "./components/submission-loader";

// Question interface for type safety
interface Question {
  name: string;
  label: string;
<<<<<<< HEAD
  type: 'input' | 'textarea';
=======
  type: 'input' | 'textarea' | 'business-owners-repeater' | 'competitors-repeater' | 'employees-repeater' | 'date-picker' | 'sop-links-repeater';
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  placeholder?: string;
  inputType?: string;
  required: boolean;
  aiAssist?: boolean;
<<<<<<< HEAD
=======
  icon?: any;
  description?: string;
}

// Business Owner interface
interface BusinessOwner {
  id: string;
  fullName: string;
  role: string;
}

// Competitor interface
interface Competitor {
  id: string;
  name: string;
}

// Employee interface
interface Employee {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
}

// SOP Link interface
interface SOPLink {
  id: string;
  title: string;
  url: string;
}

// Business Owners Repeater Component
function BusinessOwnersRepeater({ 
  value, 
  onChange, 
  required 
}: { 
  value: BusinessOwner[]; 
  onChange: (owners: BusinessOwner[]) => void; 
  required: boolean;
}) {
  const addOwner = () => {
    const newOwner: BusinessOwner = {
      id: Date.now().toString(),
      fullName: '',
      role: ''
    };
    onChange([...value, newOwner]);
  };

  const removeOwner = (id: string) => {
    onChange(value.filter(owner => owner.id !== id));
  };

  const updateOwner = (id: string, field: 'fullName' | 'role', newValue: string) => {
    onChange(value.map(owner => 
      owner.id === id ? { ...owner, [field]: newValue } : owner
    ));
  };

  return (
    <div className="space-y-4">
      {value.map((owner, index) => (
        <div key={owner.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                value={owner.fullName}
                onChange={(e) => updateOwner(owner.id, 'fullName', e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Input
                value={owner.role}
                onChange={(e) => updateOwner(owner.id, 'role', e.target.value)}
                placeholder="e.g. CEO, COO, Director"
                className="w-full"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeOwner(owner.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addOwner}
        className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      >
        <Users className="h-4 w-4 mr-2" />
        Add Business Owner
      </Button>
      
                            {required && value.length === 0 && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-4 w-4" />
                          At least one business owner is required
                        </p>
                      )}
                      {required && value.length > 0 && !value.every((owner: any) => owner.fullName && owner.role) && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-4 w-4" />
                          Please fill in all business owner names and roles
                        </p>
                      )}
    </div>
  );
}

// Competitors Repeater Component
function CompetitorsRepeater({ 
  value, 
  onChange, 
  required 
}: { 
  value: Competitor[]; 
  onChange: (competitors: Competitor[]) => void; 
  required: boolean;
}) {
  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: ''
    };
    onChange([...value, newCompetitor]);
  };

  const removeCompetitor = (id: string) => {
    onChange(value.filter(competitor => competitor.id !== id));
  };

  const updateCompetitor = (id: string, newValue: string) => {
    onChange(value.map(competitor => 
      competitor.id === id ? { ...competitor, name: newValue } : competitor
    ));
  };

  return (
    <div className="space-y-4">
      {value.map((competitor, index) => (
        <div key={competitor.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Competitor {index + 1}
            </label>
            <Input
              value={competitor.name}
              onChange={(e) => updateCompetitor(competitor.id, e.target.value)}
              placeholder="e.g. ABC Company Ltd (similar services, same target market)"
              className="w-full"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeCompetitor(competitor.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addCompetitor}
        className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Add Competitor
      </Button>
      
      {required && value.length === 0 && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          At least one competitor is required
        </p>
      )}
      {required && value.length > 0 && !value.every((competitor: any) => competitor.name) && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          Please fill in all competitor names
        </p>
      )}
    </div>
  );
}

// Employees Repeater Component
function EmployeesRepeater({ 
  value, 
  onChange, 
  required 
}: { 
  value: Employee[]; 
  onChange: (employees: Employee[]) => void; 
  required: boolean;
}) {
  const addEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: '',
      role: '',
      responsibilities: ''
    };
    onChange([...value, newEmployee]);
  };

  const removeEmployee = (id: string) => {
    onChange(value.filter(employee => employee.id !== id));
  };

  const updateEmployee = (id: string, field: 'name' | 'role' | 'responsibilities', newValue: string) => {
    onChange(value.map(employee => 
      employee.id === id ? { ...employee, [field]: newValue } : employee
    ));
  };

  return (
    <div className="space-y-4">
      {value.map((employee, index) => (
        <div key={employee.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <Input
                value={employee.name}
                onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role/Position
              </label>
              <Input
                value={employee.role}
                onChange={(e) => updateEmployee(employee.id, 'role', e.target.value)}
                placeholder="e.g. Operations Manager"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Responsibilities
              </label>
              <Textarea
                value={employee.responsibilities}
                onChange={(e) => updateEmployee(employee.id, 'responsibilities', e.target.value)}
                placeholder="e.g. Managing daily operations, overseeing team performance, handling customer inquiries"
                className="w-full min-h-[80px]"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEmployee(employee.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addEmployee}
        className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      >
        <Users className="h-4 w-4 mr-2" />
        Add Employee
      </Button>
      
      {required && value.length === 0 && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          At least one employee is required
        </p>
      )}
      {required && value.length > 0 && !value.every((employee: any) => employee.name && employee.role && employee.responsibilities) && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          Please fill in all employee names, roles, and responsibilities
        </p>
      )}
    </div>
  );
}

// SOP Links Repeater Component
function SOPLinksRepeater({
  value,
  onChange,
  required
}: {
  value: SOPLink[];
  onChange: (links: SOPLink[]) => void;
  required: boolean;
}) {
  const addLink = () => {
    const newLink: SOPLink = {
      id: Date.now().toString(),
      title: '',
      url: ''
    };
    onChange([...value, newLink]);
  };

  const removeLink = (id: string) => {
    onChange(value.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: 'title' | 'url', newValue: string) => {
    onChange(value.map(link =>
      link.id === id ? { ...link, [field]: newValue } : link
    ));
  };

  return (
    <div className="space-y-4">
      {value.map((link, index) => (
        <div key={link.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Title
              </label>
              <Input
                value={link.title}
                onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                placeholder="e.g. Customer Onboarding SOP"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document URL
              </label>
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                placeholder="https://docs.google.com/document/..."
                className="w-full"
                type="url"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeLink(link.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addLink}
        className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Add SOP Link
      </Button>
      
      {required && value.length === 0 && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          At least one SOP link is required
        </p>
      )}
      {required && value.length > 0 && !value.every((link: any) => link.title && link.url) && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="h-4 w-4" />
          Please fill in all SOP document titles and URLs
        </p>
      )}
    </div>
  );
}

// Date Picker Component
function DatePicker({
  value,
  onChange,
  required,
  placeholder = "Pick a date"
}: {
  value: string;
  onChange: (date: string) => void;
  required: boolean;
  placeholder?: string;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  // Update internal date when value prop changes
  React.useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD for form submission
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  // Get today's date for max date restriction
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal h-12 px-4 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
            !date && "text-muted-foreground"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => date > today} // Disable future dates
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
}

// Highly descriptive schema for AI training
const formSchema = z.object({
  // Company Information
  company_name_official_registered: z.string().min(2, "Company name must be at least 2 characters"),
<<<<<<< HEAD
  list_of_business_owners_full_names: z.string().min(2, "Please list at least one business owner"),
=======
  list_of_business_owners_full_names: z.array(z.object({
    id: z.string(),
    fullName: z.string().min(1, "Full name is required"),
    role: z.string().min(1, "Role is required")
  })),
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  primary_company_email_address: z.string().email("Please enter a valid email"),
  primary_company_phone_number: z.string().min(2, "Please enter a valid phone number"),
  main_office_physical_address_full: z.string().min(2, "Please enter a complete address"),
  business_founding_date_iso: z.string().min(1, "Please enter the founding date"),
  company_origin_story_and_founder_motivation: z.string().min(2, "Please provide more details about your company's story"),
<<<<<<< HEAD
  main_competitors_list_and_reasons: z.string().min(2, "Please list 3-5 competitors with reasons"),
  current_employees_and_roles_responsibilities: z.string().min(2, "Please list employees with their roles"),
=======
  main_competitors_list_and_reasons: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Competitor name is required")
  })).min(1, "Please add at least one competitor"),
  current_employees_and_roles_responsibilities: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Employee name is required"),
    role: z.string().min(1, "Role is required"),
    responsibilities: z.string().min(1, "Responsibilities are required")
  })),
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  last_full_year_annual_revenue_amount: z.string().min(1, "Please enter annual revenue"),
  current_profit_margin_percentage: z.string().min(1, "Please enter profit margin"),
  company_long_term_vision_statement: z.string().min(2, "Please provide your company's vision"),

  // War Machine Vision
  ultimate_long_term_goal_for_business_owner: z.string().optional(),
  definition_of_success_in_5_10_20_years: z.string().optional(),
  additional_income_streams_or_investments_needed: z.string().optional(),
  focus_on_single_business_or_multiple_long_term: z.string().optional(),
  personal_skills_knowledge_networks_to_develop: z.string().optional(),

  // Products and Services
  business_overview_for_potential_investor: z.string().optional(),
  description_of_target_customers_for_investor: z.string().optional(),
  list_of_things_going_right_in_business: z.string().optional(),
  list_of_things_going_wrong_in_business: z.string().optional(),
  list_of_things_missing_in_business: z.string().optional(),
  list_of_things_confusing_in_business: z.string().optional(),
  plans_to_expand_services_or_locations: z.string().optional(),

  // Sales & Customer Journey
  detailed_sales_process_from_first_contact_to_close: z.string().optional(),
  structured_follow_up_process_for_unconverted_leads: z.string().optional(),
  customer_experience_and_fulfillment_process: z.string().optional(),

  // Operations & Systems
<<<<<<< HEAD
  documented_systems_or_sops_links: z.string().optional(),
=======
  documented_systems_or_sops_links: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Document title is required"),
    url: z.string().url("Please enter a valid URL")
  })).optional(),
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  software_and_tools_used_for_operations: z.string().optional(),
  team_structure_and_admin_sales_marketing_roles: z.string().optional(),
  regular_team_meetings_frequency_attendees_agenda: z.string().optional(),
  kpi_scorecards_metrics_tracked_and_review_frequency: z.string().optional(),
  biggest_current_operational_headache: z.string().optional(),

  // Final Section
  most_exciting_aspect_of_bootcamp_for_you: z.string().optional(),
  specific_expectations_or_requests_for_bootcamp: z.string().optional(),
  additional_comments_or_items_for_attention: z.string().optional(),
});

<<<<<<< HEAD
// Define all questions in a config array
=======
// Define all questions in a config array with icons and descriptions
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
const questions: Question[] = [
  // Company Information
  {
    name: 'company_name_official_registered',
<<<<<<< HEAD
    label: "What is your business's full legal name as registered?",
=======
    label: "What is your company name?",
    description: "This helps us set up your official business profile",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'input',
    placeholder: "Enter your business's legal name",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'list_of_business_owners_full_names',
    label: "List all business owners with their full names and roles.",
    type: 'input',
    placeholder: "e.g. Jane Doe (CEO), John Smith (COO)",
    required: true,
    aiAssist: false,
  },
  {
    name: 'primary_company_email_address',
    label: "What is the primary business email address for official communication?",
=======
    icon: Building,
  },
  {
    name: 'list_of_business_owners_full_names',
    label: "Please list the Business Owners names and roles.",
    description: "We need to know who the key decision makers are",
    type: 'business-owners-repeater',
    required: true,
    aiAssist: false,
    icon: Users,
  },
  {
    name: 'primary_company_email_address',
    label: "What is the best company email address?",
    description: "This will be used for all official business correspondence",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'input',
    inputType: 'email',
    placeholder: "Enter business email",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'primary_company_phone_number',
    label: "What is the main business phone number for client or partner contact?",
=======
    icon: Mail,
  },
  {
    name: 'primary_company_phone_number',
    label: "What is the best company phone number?",
    description: "Your main contact number for business purposes",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'input',
    placeholder: "Enter business phone number",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'main_office_physical_address_full',
    label: "What is the full address of your business's main office or headquarters?",
=======
    icon: Phone,
  },
  {
    name: 'main_office_physical_address_full',
    label: "What is your companies main office address? (Please insert the full company address as you would want it displayed across the internet).",
    description: "We need your complete business address",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'textarea',
    placeholder: "Enter full business address",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'business_founding_date_iso',
    label: "What is the official founding date of the business? (YYYY-MM-DD)",
    type: 'input',
    inputType: 'date',
    required: true,
    aiAssist: false,
  },
  {
    name: 'company_origin_story_and_founder_motivation',
    label: "Describe the origin story of your company and the motivation behind starting it.",
=======
    icon: MapPin,
  },
  {
    name: 'business_founding_date_iso',
    label: "What date was the business founded?",
    description: "When was your business officially established?",
    type: 'date-picker',
    required: true,
    aiAssist: false,
    icon: CalendarIcon,
  },
  {
    name: 'company_origin_story_and_founder_motivation',
    label: "Can you tell us more about how the company got started and what was the motivation to start?",
    description: "Tell us your unique business story - this helps us understand your journey",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'textarea',
    placeholder: "Share your company's origin story and motivation",
    required: true,
    aiAssist: true,
<<<<<<< HEAD
  },
  {
    name: 'main_competitors_list_and_reasons',
    label: "Who are your main competitors and why did you select them as competitors? (List 3-5 with reasons)",
    type: 'textarea',
    placeholder: "List competitors and reasons",
    required: true,
    aiAssist: true,
  },
  {
    name: 'current_employees_and_roles_responsibilities',
    label: "List all current employees, their roles, and their main responsibilities.",
    type: 'textarea',
    placeholder: "List employees, roles, and responsibilities",
    required: true,
    aiAssist: true,
  },
  {
    name: 'last_full_year_annual_revenue_amount',
    label: "What was your business's annual revenue for the last fiscal year?",
=======
    icon: Lightbulb,
  },
  {
    name: 'main_competitors_list_and_reasons',
    label: "Who are your main competitors? (Please list 3-5 with a reason to why you have chose them).",
    description: "Understanding your competitive landscape helps us position your business better",
    type: 'competitors-repeater',
    required: true,
    aiAssist: false,
    icon: TrendingUp,
  },
  {
    name: 'current_employees_and_roles_responsibilities',
    label: "Please let us know how many Employees currently work for the business? (It is important here not just to name the team members, but also to include their role and responsibilities within the business).",
    description: "This helps us understand your team structure and capabilities",
    type: 'employees-repeater',
    required: true,
    aiAssist: false,
    icon: Users,
  },
  {
    name: 'last_full_year_annual_revenue_amount',
    label: "What is your companies Annual Revenue?",
    description: "This helps us tailor our recommendations to your business size",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'input',
    placeholder: "Enter annual revenue",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'current_profit_margin_percentage',
    label: "What is your business's current profit margin (as a percentage)?",
=======
    icon: DollarSign,
  },
  {
    name: 'current_profit_margin_percentage',
    label: "What is your companies current profit margin percentage?",
    description: "Understanding your profitability helps us focus on the right areas",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    type: 'input',
    placeholder: "Enter profit margin (%)",
    required: true,
    aiAssist: false,
<<<<<<< HEAD
  },
  {
    name: 'company_long_term_vision_statement',
    label: "Describe your business's long-term vision and the impact you hope to achieve.",
    type: 'textarea',
    placeholder: "Describe vision and impact",
    required: true,
    aiAssist: true,
  },

  // War Machine Vision
  { name: 'ultimate_long_term_goal_for_business_owner', label: 'What is your ultimate long-term goal? (e.g., financial freedom, a specific revenue target, a legacy business, an exit strategy, etc.)', type: 'textarea', required: false, aiAssist: true },
  { name: 'definition_of_success_in_5_10_20_years', label: 'What does success look like for you in 5, 10, and 20 years?', type: 'textarea', required: false, aiAssist: true },
  { name: 'additional_income_streams_or_investments_needed', label: "If your current business isn't enough to reach this goal, what other income streams, investments, or businesses might be needed?", type: 'textarea', required: false, aiAssist: true },
  { name: 'focus_on_single_business_or_multiple_long_term', label: 'Do you see yourself focusing on one business long-term, or do you want to build a group of companies?', type: 'textarea', required: false, aiAssist: true },
  { name: 'personal_skills_knowledge_networks_to_develop', label: 'What personal skills, knowledge, or networks do you think you would need to develop to build your War Machine successfully?', type: 'textarea', required: false, aiAssist: true },

  // Products and Services
  { name: 'business_overview_for_potential_investor', label: 'Please give a short overview of what your business does as if you were explaining it to a potential investor.', type: 'textarea', required: false, aiAssist: true },
  { name: 'description_of_target_customers_for_investor', label: 'Please give a short overview of who your business serves as if you were explaining it to a potential investor.', type: 'textarea', required: false, aiAssist: true },
  { name: 'list_of_things_going_right_in_business', label: 'Please list all the things that you feel are going right in the business right now.', type: 'textarea', required: false, aiAssist: true },
  { name: 'list_of_things_going_wrong_in_business', label: 'Please list all the things that you feel are going wrong in the business right now.', type: 'textarea', required: false, aiAssist: true },
  { name: 'list_of_things_missing_in_business', label: 'Please list all the things that you feel are missing in the business right now.', type: 'textarea', required: false, aiAssist: true },
  { name: 'list_of_things_confusing_in_business', label: 'Please list all the things that you feel are confusing in the business right now.', type: 'textarea', required: false, aiAssist: true },
  { name: 'plans_to_expand_services_or_locations', label: 'Do you have plans to expand into new services or locations?', type: 'textarea', required: false, aiAssist: true },

  // Sales & Customer Journey
  { name: 'detailed_sales_process_from_first_contact_to_close', label: 'What does your sales process look like? (From first contact to closed deal - please be as detailed as possible)', type: 'textarea', required: false, aiAssist: true },
  { name: 'structured_follow_up_process_for_unconverted_leads', label: "Do you have a structured follow-up process for leads that don't convert immediately?", type: 'textarea', required: false, aiAssist: true },
  { name: 'customer_experience_and_fulfillment_process', label: 'How do you ensure customers have a great experience with your business? (From closed deal to completing the job - please be as detailed as possible as to the fulfilment process)', type: 'textarea', required: false, aiAssist: true },

  // Operations & Systems
  { name: 'documented_systems_or_sops_links', label: 'Do you currently have documented systems or SOPs in place? (If so, please share link to them below so we can review before your 3-1 kick-off meeting).', type: 'textarea', required: false, aiAssist: true },
  { name: 'software_and_tools_used_for_operations', label: 'What software or tools are you currently using for operations? (E.g., CRM, job management, accounting, etc.)', type: 'textarea', required: false, aiAssist: true },
  { name: 'team_structure_and_admin_sales_marketing_roles', label: 'Do you have a team that handles admin, sales, or marketing, or are you doing most of it yourself?', type: 'textarea', required: false, aiAssist: true },
  { name: 'regular_team_meetings_frequency_attendees_agenda', label: 'Do you currently hold regular team meetings? If so, how often do they happen, who attends, and do you follow a set agenda?', type: 'textarea', required: false, aiAssist: true },
  { name: 'kpi_scorecards_metrics_tracked_and_review_frequency', label: 'Do you currently use scorecards or track key performance indicators (KPIs) for your team members? If so, what metrics do you monitor, and how frequently do you review them? If not, what challenges have prevented you from implementing a tracking system?', type: 'textarea', required: false, aiAssist: true },
  { name: 'biggest_current_operational_headache', label: 'What is your biggest operational headache right now?', type: 'textarea', required: false, aiAssist: true },

  // Final Section
  { name: 'most_exciting_aspect_of_bootcamp_for_you', label: 'What are you most excited about in this Bootcamp?', type: 'textarea', required: false, aiAssist: true },
  { name: 'specific_expectations_or_requests_for_bootcamp', label: 'Do you have any specific expectations or requests for us?', type: 'textarea', required: false, aiAssist: true },
  { name: 'additional_comments_or_items_for_attention', label: 'Please list any additional comments or items that you would like to bring to our attention before we get started.', type: 'textarea', required: false, aiAssist: true },
=======
    icon: TrendingUp,
  },


  // War Machine Vision
  { name: 'ultimate_long_term_goal_for_business_owner', label: 'What is your ultimate long-term goal? (e.g., financial freedom, a specific revenue target, a legacy business, an exit strategy, etc.)', type: 'textarea', required: false, aiAssist: true, icon: Target, description: 'Define your ultimate business destination' },
  { name: 'definition_of_success_in_5_10_20_years', label: 'What does success look like for you in 5, 10, and 20 years?', type: 'textarea', required: false, aiAssist: true, icon: CalendarIcon, description: 'Paint a picture of your future success' },
  { name: 'additional_income_streams_or_investments_needed', label: "If your current business isn't enough to reach this goal, what other income streams, investments, or businesses might be needed?", type: 'textarea', required: false, aiAssist: true, icon: PoundSterling, description: 'Think beyond your current business model' },
  { name: 'focus_on_single_business_or_multiple_long_term', label: 'Do you see yourself focusing on one business long-term, or do you want to build a group of companies?', type: 'textarea', required: false, aiAssist: true, icon: Building, description: 'Single focus or empire building?' },
  { name: 'personal_skills_knowledge_networks_to_develop', label: 'What personal skills, knowledge, or networks do you think you would need to develop to build your War Machine successfully?', type: 'textarea', required: false, aiAssist: true, icon: Users, description: 'Identify your growth areas' },

  // Products and Services
  { name: 'business_overview_for_potential_investor', label: 'Please give a short overview of what your business does as if you were explaining it to a potential investor.', type: 'textarea', required: false, aiAssist: true, icon: FileText, description: 'Your elevator pitch for investors' },
  { name: 'description_of_target_customers_for_investor', label: 'Please give a short overview of who your business serves as if you were explaining it to a potential investor.', type: 'textarea', required: false, aiAssist: true, icon: Users, description: 'Who exactly do you serve?' },
  { name: 'list_of_things_going_right_in_business', label: 'Please list all the things that you feel are going right in the business right now.', type: 'textarea', required: false, aiAssist: true, icon: CheckCircle, description: 'Celebrate your wins and strengths' },
  { name: 'list_of_things_going_wrong_in_business', label: 'Please list all the things that you feel are going wrong in the business right now.', type: 'textarea', required: false, aiAssist: true, icon: X, description: 'Honest assessment of current challenges' },
  { name: 'list_of_things_missing_in_business', label: 'Please list all the things that you feel are missing in the business right now.', type: 'textarea', required: false, aiAssist: true, icon: HelpCircle, description: 'What gaps need to be filled?' },
  { name: 'list_of_things_confusing_in_business', label: 'Please list all the things that you feel are confusing in the business right now.', type: 'textarea', required: false, aiAssist: true, icon: HelpCircle, description: 'What needs clarity and understanding?' },
  { name: 'plans_to_expand_services_or_locations', label: 'Do you have plans to expand into new services or locations?', type: 'textarea', required: false, aiAssist: true, icon: ArrowRight, description: 'Think about your expansion opportunities' },

  // Sales & Customer Journey
  { name: 'detailed_sales_process_from_first_contact_to_close', label: 'What does your sales process look like? (From first contact to closed deal - please be as detailed as possible)', type: 'textarea', required: false, aiAssist: true, icon: TrendingUp, description: 'Map out your complete sales journey' },
  { name: 'structured_follow_up_process_for_unconverted_leads', label: "Do you have a structured follow-up process for leads that don't convert immediately?", type: 'textarea', required: false, aiAssist: true, icon: RefreshCw, description: 'How do you nurture prospects?' },
  { name: 'customer_experience_and_fulfillment_process', label: 'How do you ensure customers have a great experience with your business? (From closed deal to completing the job - please be as detailed as possible as to the fulfilment process)', type: 'textarea', required: false, aiAssist: true, icon: Users, description: 'Detail your customer success process' },

  // Operations & Systems
  { name: 'documented_systems_or_sops_links', label: 'Do you currently have documented systems or SOPs in place? (If so, please share link to them below so we can review before your 3-1 kick-off meeting).', type: 'sop-links-repeater', required: false, aiAssist: true, icon: FileText, description: 'Share your existing documentation' },
  { name: 'software_and_tools_used_for_operations', label: 'What software or tools are you currently using for operations? (E.g., CRM, job management, accounting, etc.)', type: 'textarea', required: false, aiAssist: false, icon: Settings, description: 'List your current tech stack' },
  { name: 'team_structure_and_admin_sales_marketing_roles', label: 'Do you have a team that handles admin, sales, or marketing, or are you doing most of it yourself?', type: 'textarea', required: false, aiAssist: false, icon: Users, description: 'Understand your current team structure' },
  { name: 'regular_team_meetings_frequency_attendees_agenda', label: 'Do you currently hold regular team meetings? If so, how often do they happen, who attends, and do you follow a set agenda?', type: 'textarea', required: false, aiAssist: true, icon: CalendarIcon, description: 'How does your team communicate?' },
  { name: 'kpi_scorecards_metrics_tracked_and_review_frequency', label: 'Do you currently use scorecards or track key performance indicators (KPIs) for your team members? If so, what metrics do you monitor, and how frequently do you review them? If not, what challenges have prevented you from implementing a tracking system?', type: 'textarea', required: false, aiAssist: true, icon: TrendingUp, description: 'How do you measure performance?' },
  { name: 'biggest_current_operational_headache', label: 'What is your biggest operational headache right now?', type: 'textarea', required: false, aiAssist: true, icon: HelpCircle, description: 'What keeps you up at night?' },

  // Final Section
  { name: 'most_exciting_aspect_of_bootcamp_for_you', label: 'What are you most excited about in this Bootcamp?', type: 'textarea', required: false, aiAssist: true, icon: Sparkles, description: 'Share your excitement and expectations' },
  { name: 'specific_expectations_or_requests_for_bootcamp', label: 'Do you have any specific expectations or requests for us?', type: 'textarea', required: false, aiAssist: true, icon: MessageCircle, description: 'Tell us how we can serve you best' },
  { name: 'additional_comments_or_items_for_attention', label: 'Please list any additional comments or items that you would like to bring to our attention before we get started.', type: 'textarea', required: false, aiAssist: true, icon: FileText, description: 'Anything else we should know?' },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
];

// Define categories
const categories = [
  {
    id: 'company-info',
    title: 'Company Information',
    description: 'Basic details about your company',
<<<<<<< HEAD
    questions: questions.slice(0, 12)
  },
  {
    id: 'war-machine',
    title: 'War Machine Vision',
    description: 'Your long-term business goals and vision',
    questions: questions.slice(12, 17)
=======
    questions: questions.slice(0, 12),
    color: 'blue',
    icon: Building
  },
  {
    id: 'war-machine',
    title: 'Company Vision',
    description: 'Your long-term business goals and vision',
    questions: questions.slice(12, 17),
    color: 'purple',
    icon: Target
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  },
  {
    id: 'products-services',
    title: 'Products and Services',
    description: 'Details about your business offerings',
<<<<<<< HEAD
    questions: questions.slice(17, 24)
=======
    questions: questions.slice(17, 24),
    color: 'green',
    icon: Users
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  },
  {
    id: 'sales-customer',
    title: 'Sales & Customer Journey',
    description: 'Your sales process and customer experience',
<<<<<<< HEAD
    questions: questions.slice(24, 27)
=======
    questions: questions.slice(24, 27),
    color: 'orange',
    icon: TrendingUp
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  },
  {
    id: 'operations',
    title: 'Operations & Systems',
    description: 'Your business operations and systems',
<<<<<<< HEAD
    questions: questions.slice(27, 33)
=======
    questions: questions.slice(27, 33),
    color: 'red',
    icon: Settings
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  },
  {
    id: 'final-section',
    title: 'Final Section',
    description: 'Final thoughts and expectations',
<<<<<<< HEAD
    questions: questions.slice(33, 36)
=======
    questions: questions.slice(33, 36),
    color: 'indigo',
    icon: Sparkles
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  }
];

function StepIndicator({ step, title, description, isActive, isCompleted, onClick }: { step: number; title: string; description: string; isActive: boolean; isCompleted: boolean; onClick: () => void }) {
  return (
    <button
      className={`group relative flex text-left items-center w-full px-4 py-3 transition-all duration-200
        ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
        ${isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={onClick}
      disabled={!isCompleted}
    >

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
      )}

      {/* Step indicator */}
      <div className={`relative w-8 h-8 flex items-center justify-center rounded-full mr-4 transition-all duration-200
        ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
        group-hover:${isCompleted || isActive ? 'scale-105' : ''}`}
      >
        {isCompleted ? <Check size={16} className="stroke-[2.5]" /> : step}
      </div>

      {/* Text content */}
      <div className="flex flex-col min-w-0">
        <div className={`font-medium text-sm truncate ${isActive ? 'text-blue-800' : 'text-gray-700'}`}>
          {title}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
      </div>
    </button>
  );
}

function OnboardingHeader({ userName }: { userName: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
<<<<<<< HEAD
          <Link href="/" className="flex items-center">
            {/* <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2"
            /> */}
            <span className="font-semibold text-lg">TBS</span>
          </Link>
=======
          <img src="https://tradebusinessschool.com/wp-content/uploads/2024/11/TBS-coloured-logo-1.webp" alt="Logo" width={100} />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
            <Link href="/help">
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </Link>
          </Button>
          <div className="text-sm text-gray-600">
            {userName}
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

function WelcomeScreen({ userEmail = "user@example.com", onStart = () => console.log("Getting started...") }: { userEmail?: string; onStart?: () => void }) {
  const firstName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TBS</span>
            </div>
=======
           
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            <span className="text-sm text-gray-500 font-medium">Trades business School</span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl md:p-12 p-6 border border-blue-100">
          <div className="flex items-start gap-8">
            {/* Icon section */}


            {/* Content section */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Welcome, <span className="text-blue-600">{firstName}</span>
                </h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Ready to get started</span>
                </div>
              </div>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
<<<<<<< HEAD
                Let's set up your personalised workspace in <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">TBS</span>.
                We'll configure everything to match your workflow and preferences.
=======
              Let's set up your personalised workspace in your Command HQ. This will become the digital brain of your business.
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              </p>

              {/* Enhanced features grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
<<<<<<< HEAD
                    <Settings size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Workspace Setup</h3>
                    <p className="text-sm text-gray-600">Personalized dashboard and tools</p>
=======
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">AI Enhancement</h3>
                    <p className="text-sm text-gray-600">Write your thoughts first, then let AI help improve and expand them.</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
<<<<<<< HEAD
                    <Target size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Preferences</h3>
                    <p className="text-sm text-gray-600">Tailored experience configuration</p>
=======
                    <Settings size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Detailed Information</h3>
                    <p className="text-sm text-gray-600">Take your time as this information will be used to train your AI.</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <h3 className="font-semibold text-gray-900 mb-1">Quick Start</h3>
                    <p className="text-sm text-gray-600">Ready in under 5 minutes</p>
=======
                    <h3 className="font-semibold text-gray-900 mb-1">Setup Time</h3>
                    <p className="text-sm text-gray-600">Estimated 30-45 minutes</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </div>
              </div>

              {/* CTA section */}
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div>
                  <Button size="lg" onClick={onStart}>
                    Start Setup
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Clock size={14} />
                    Estimated time: 3-5 minutes
                  </p>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <p>Step 0 of 6</p>
                  <div className="flex gap-1 mt-1">
                    <div className="w-8 h-1 bg-blue-600 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                    <div className="w-8 h-1 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


<<<<<<< HEAD
=======

// Floating AI Assistant Component
function FloatingAIAssistant({ 
  focusedQuestion,
  form,
  categories,
  onAcceptContent,
  isMobile = false,
  isOpen = true,
  onToggle
}: {
  focusedQuestion: string | null;
  form: any;
  categories: any[];
  onAcceptContent: (questionName: string, content: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [chatStates, setChatStates] = useState<{[key: string]: {
    chatMode: boolean;
    chatHistory: Array<{role: 'user' | 'assistant', content: string}>;
    generatedContent: string;
  }}>({});
  // Removed chatContainerRef since we now use editable content instead of chat history display
  const { toast } = useToast();

  const currentQuestion = focusedQuestion ? questions.find(q => q.name === focusedQuestion) : null;
  const currentValue = focusedQuestion ? form.watch(focusedQuestion as keyof z.infer<typeof formSchema>) || "" : "";
  const hasContent = currentQuestion ? (
    currentQuestion.type === 'business-owners-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((owner: any) => owner.fullName && owner.role)
      : currentQuestion.type === 'competitors-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((competitor: any) => competitor.name)
      : currentQuestion.type === 'employees-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((employee: any) => employee.name && employee.role && employee.responsibilities)
      : currentQuestion.type === 'sop-links-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((link: any) => link.title && link.url)
      : !!(currentValue && typeof currentValue === 'string' ? currentValue.trim() : currentValue)
  ) : false;

  // Get current chat state for focused question
  const currentChatState = focusedQuestion ? chatStates[focusedQuestion] : null;
  const chatHistory = currentChatState?.chatHistory || [];
  // Chat mode should be true if there's any chat history or if explicitly set
  const chatMode = currentChatState?.chatMode || chatHistory.length > 0;

  // Debug logging
  useEffect(() => {
    if (focusedQuestion) {
      console.log('Question changed to:', focusedQuestion);
      console.log('Chat state for this question:', chatStates[focusedQuestion]);
      console.log('Chat mode:', chatMode);
      console.log('Chat history length:', chatHistory.length);
    }
  }, [focusedQuestion, chatStates, chatMode, chatHistory]);

  // Sync generatedContent when switching questions
  useEffect(() => {
    if (focusedQuestion && chatStates[focusedQuestion]?.generatedContent) {
      setGeneratedContent(chatStates[focusedQuestion].generatedContent);
    } else {
      setGeneratedContent("");
    }
  }, [focusedQuestion, chatStates]);

  // Auto-scroll functionality removed since we now use editable content instead of chat history

  // Generate smart suggestions based on question type - only for improving existing content
  const getSmartSuggestions = () => {
    if (!currentQuestion || !hasContent) return [];

    const suggestions = [];
    
    if (currentQuestion.name.includes('competitor')) {
      suggestions.push("Add more detail about why these are competitors");
      suggestions.push("Include their pricing and service comparison");
      suggestions.push("Explain their competitive advantages");
    } else if (currentQuestion.name.includes('vision') || currentQuestion.name.includes('goal')) {
      suggestions.push("Make this more inspiring and compelling");
      suggestions.push("Add specific measurable outcomes");
      suggestions.push("Include timeline and milestones");
    } else if (currentQuestion.name.includes('sales') || currentQuestion.name.includes('process')) {
      suggestions.push("Add more detail to each step");
      suggestions.push("Include timelines and responsibilities");
      suggestions.push("Add qualification criteria");
    } else if (currentQuestion.name.includes('team') || currentQuestion.name.includes('employee')) {
      suggestions.push("Clarify roles and responsibilities");
      suggestions.push("Add reporting structure details");
      suggestions.push("Include skills and experience levels");
    } else {
      suggestions.push("Make this more detailed and specific");
      suggestions.push("Add examples from my industry");
      suggestions.push("Improve the structure and flow");
    }

    return suggestions;
  };

  const handleGenerateContent = async (action: 'generate' | 'improve' = 'generate', prompt?: string) => {
    if (!focusedQuestion) return;
    
    setIsLoading(true);
    
    const currentFormValues = form.getValues();
    const currentCategoryObj = categories.find(cat => cat.questions.some((q: any) => q.name === focusedQuestion));
    const promptToUse = prompt || customPrompt;
    const existingGeneratedContent = chatStates[focusedQuestion]?.generatedContent || "";

    // Initialize or update chat state for this question
    setChatStates(prev => ({
      ...prev,
      [focusedQuestion]: {
        ...prev[focusedQuestion],
        chatMode: true,
        chatHistory: prev[focusedQuestion]?.chatHistory || [], // Keep existing history but don't display it
        generatedContent: prev[focusedQuestion]?.generatedContent || ""
      }
    }));

    try {
      const response = await fetch('/api/gemini/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentFormValues,
          questionName: focusedQuestion,
          questionLabel: currentQuestion?.label,
          categoryTitle: currentCategoryObj?.title,
          customPrompt: promptToUse + " Please provide a plain text response without any markdown formatting, asterisks, or special characters.",
          existingContent: action === 'improve' ? existingGeneratedContent || currentValue : undefined,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error generating content: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Remove any remaining markdown from the response
      const cleanedContent = data.generatedContent
        .replace(/\*\*/g, '')  // Remove bold markers
        .replace(/\*/g, '')    // Remove italic markers
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`([^`]+)`/g, '$1'); // Remove inline code
      
      setGeneratedContent(cleanedContent);
      
      // Update the editable content directly
      setChatStates(prev => ({
        ...prev,
        [focusedQuestion]: {
          ...prev[focusedQuestion],
          chatHistory: [...(prev[focusedQuestion]?.chatHistory || []), { role: 'user', content: promptToUse }, { role: 'assistant', content: cleanedContent }],
          generatedContent: cleanedContent,
          chatMode: true
        }
      }));
      
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    const currentGeneratedContent = chatStates[focusedQuestion!]?.generatedContent || generatedContent;
    if (currentGeneratedContent && focusedQuestion) {
      onAcceptContent(focusedQuestion, currentGeneratedContent);
      setGeneratedContent("");
      setCustomPrompt("");
      // Keep chat history but mark as not actively in chat mode
      setChatStates(prev => ({
        ...prev,
        [focusedQuestion]: {
          ...prev[focusedQuestion],
          chatMode: false,
          generatedContent: currentGeneratedContent // Keep the generated content
        }
      }));
      
      // Scroll to the question in the form
      setTimeout(() => {
        const questionElement = document.getElementById(focusedQuestion);
        if (questionElement) {
          questionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Optional: briefly highlight the field to draw attention
          questionElement.focus();
        }
      }, 100); // Small delay to ensure the content is filled first
    }
  };

  // AI Assistant can now be opened/closed
  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <div className={`h-full bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden ${
        isMobile ? 'shadow-none border-gray-200' : 'shadow-lg'
      }`}>
        {/* Clean Header - only show on desktop */}
        {!isMobile && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                  <AnimatedAIBlob className="w-4 h-4" isActive={focusedQuestion !== null} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Need Writing Help?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">AI assistant ready to help</p>
                </div>
              </div>
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0 hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {focusedQuestion && currentQuestion && currentQuestion.aiAssist ? (
            <div className="space-y-4 h-full flex flex-col">
              {/* Current Question Header */}
              <div className="flex-shrink-0 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="hidden w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {currentQuestion.icon && <currentQuestion.icon className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {currentQuestion.label}
                    </h3>
                    {currentQuestion.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{currentQuestion.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {chatMode ? (
                /* Chat Mode Interface */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Current AI Response - Editable */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-shrink-0">
                      AI Generated Content (editable)
                    </label>
                    <div className="flex-1 relative">
                      <Textarea
                        value={currentChatState?.generatedContent || ""}
                        onChange={(e) => {
                          if (focusedQuestion) {
                            setChatStates(prev => ({
                              ...prev,
                              [focusedQuestion]: {
                                ...prev[focusedQuestion],
                                generatedContent: e.target.value
                              }
                            }));
                          }
                        }}
                        placeholder="AI response will appear here..."
                        className={`w-full text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4 resize-none ${
                          isMobile ? 'h-[250px]' : 'h-[400px]'
                        }`}
                      />
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">AI is generating content...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fixed bottom section */}
                  <div className="flex-shrink-0 space-y-3 pt-4 border-t bg-white">
                    {/* Action Buttons */}
                    {(currentChatState?.generatedContent) && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAccept}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Use This Answer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (focusedQuestion) {
                              setChatStates(prev => {
                                const newState = { ...prev };
                                delete newState[focusedQuestion];
                                return newState;
                              });
                              setGeneratedContent("");
                              setCustomPrompt("");
                            }
                          }}
                        >
                          Start Over
                        </Button>
                      </div>
                    )}

                    {/* Modification Input */}
                    <div className="relative">
                      <Input
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Type what you'd like to change or improve..."
                        className="pr-10 border-gray-200 focus:border-blue-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading && customPrompt.trim()) {
                            e.preventDefault();
                            handleGenerateContent('improve');
                            setCustomPrompt("");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (customPrompt.trim()) {
                            handleGenerateContent('improve');
                            setCustomPrompt("");
                          }
                        }}
                        disabled={isLoading || !customPrompt.trim()}
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Suggestion Mode Interface */
                <div className="space-y-4">
                  {hasContent ? (
                    <>
                      {/* Quick Actions - Clean Pills */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleGenerateContent('improve', 'Rewrite the existing content in a better way, it is very important to ensure the core message and details are retained and dont make it lengthy keep it short and concise.')}
                          disabled={isLoading}
                          className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group bg-white shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm">
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              ) : (
                                <AnimatedAIBlob className="w-4 h-4" isActive={!isLoading} />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                                Improve what I wrote
                              </span>
                              <p className="text-xs text-gray-500 mt-1">Make it better and more polished</p>
                            </div>
                          </div>
                        </button>
                        {getSmartSuggestions().map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleGenerateContent('improve', suggestion)}
                            disabled={isLoading}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group bg-white shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm">
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                ) : (
                                  <AnimatedAIBlob className="w-4 h-4" isActive={!isLoading} />
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                                  {suggestion}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Custom Input - Clean */}
                      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200">
                        <Input
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Tell me how to improve what you wrote..."
                          className="pr-12 border-0 focus:ring-0 bg-transparent h-12 text-sm placeholder:text-gray-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isLoading && customPrompt.trim()) {
                              e.preventDefault();
                              handleGenerateContent('improve');
                              setCustomPrompt("");
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (customPrompt.trim()) {
                              handleGenerateContent('improve');
                              setCustomPrompt("");
                            }
                          }}
                          disabled={isLoading || !customPrompt.trim()}
                          className="absolute right-2 top-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* No content message */
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <FileText className="h-9 w-9 text-blue-600" />
                      </div>
                      <h3 className="text-gray-900 font-semibold mb-3 text-lg">Write your thoughts first</h3>
                      <p className="text-gray-600 text-sm max-w-sm mx-auto text-center leading-relaxed">
                        Start by writing your own answer in the form field above. Then I'll help you improve and expand on it.
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-full">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Ready to help once you start writing</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : focusedQuestion && currentQuestion && !currentQuestion.aiAssist ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-600 font-medium mb-2">No AI assistance needed</h3>
                <p className="text-gray-500 text-sm">This question is not supported by AI assistance. Just fill it out with your business information.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AnimatedAIBlob className="w-8 h-8" isActive={true} />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 text-lg">Hi! I'm here to help you</h3>
                <p className="text-gray-600 mb-3">I'll help you improve and expand on your answers after you've written your initial thoughts.</p>
                <p className="text-sm text-blue-600 font-medium">
                  ✨ Start writing your answers and I'll help you improve them
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile AI Assistant Component - Compact version that writes directly to form field
function MobileAIAssistant({
  focusedQuestion,
  form,
  categories,
  onClose
}: {
  focusedQuestion: string | null;
  form: any;
  categories: any[];
  onClose: () => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentQuestion = focusedQuestion ? questions.find(q => q.name === focusedQuestion) : null;

  // Generate smart suggestions based on question type - only for improving existing content
  const getSmartSuggestions = () => {
    if (!currentQuestion) return [];

    const currentValue = form.watch(focusedQuestion as keyof z.infer<typeof formSchema>) || "";
    const hasContent = currentQuestion ? (
      currentQuestion.type === 'business-owners-repeater'
        ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((owner: any) => owner.fullName && owner.role)
        : currentQuestion.type === 'competitors-repeater'
        ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((competitor: any) => competitor.name)
        : currentQuestion.type === 'employees-repeater'
        ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((employee: any) => employee.name && employee.role && employee.responsibilities)
        : currentQuestion.type === 'sop-links-repeater'
        ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((link: any) => link.title && link.url)
        : !!(currentValue && typeof currentValue === 'string' ? currentValue.trim() : currentValue)
    ) : false;
    
    if (!hasContent) return [];

    const suggestions = [];
    
    if (currentQuestion.name.includes('competitor')) {
      suggestions.push("Add more detail about why these are competitors");
      suggestions.push("Include their pricing and service comparison");
    } else if (currentQuestion.name.includes('vision') || currentQuestion.name.includes('goal')) {
      suggestions.push("Make this more inspiring and compelling");
      suggestions.push("Add specific measurable outcomes");
    } else if (currentQuestion.name.includes('sales') || currentQuestion.name.includes('process')) {
      suggestions.push("Add more detail to each step");
      suggestions.push("Add qualification criteria");
    } else {
      suggestions.push("Make this more detailed and specific");
      suggestions.push("Improve the structure and flow");
    }

    return suggestions.slice(0, 2); // Only show 2 suggestions for mobile
  };

  const handleGenerateContent = async (prompt?: string) => {
    if (!focusedQuestion) return;
    
    setIsLoading(true);
    
    const currentFormValues = form.getValues();
    const currentCategoryObj = categories.find(cat => cat.questions.some((q: any) => q.name === focusedQuestion));
    const promptToUse = prompt || customPrompt;
    const currentValue = form.getValues(focusedQuestion as keyof z.infer<typeof formSchema>) || "";

    try {
      const response = await fetch('/api/gemini/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentFormValues,
          questionName: focusedQuestion,
          questionLabel: currentQuestion?.label,
          categoryTitle: currentCategoryObj?.title,
          customPrompt: promptToUse + " Please provide a plain text response without any markdown formatting, asterisks, or special characters.",
          existingContent: currentValue,
          action: currentValue ? 'improve' : 'generate',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error generating content: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Remove any remaining markdown from the response
      const cleanedContent = data.generatedContent
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1');
      
      // Write directly to the form field
      form.setValue(focusedQuestion as keyof z.infer<typeof formSchema>, cleanedContent, { shouldValidate: true });
      
      // Keep the AI assistant open after generating content (to match desktop behavior)
      // onClose();  // Removed to allow continued editing
      
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentValue = form.watch(focusedQuestion as keyof z.infer<typeof formSchema>) || "";
  const hasContent = currentQuestion ? (
    currentQuestion.type === 'business-owners-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((owner: any) => owner.fullName && owner.role)
      : currentQuestion.type === 'competitors-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((competitor: any) => competitor.name)
      : currentQuestion.type === 'employees-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((employee: any) => employee.name && employee.role && employee.responsibilities)
      : currentQuestion.type === 'sop-links-repeater'
      ? Array.isArray(currentValue) && currentValue.length > 0 && currentValue.every((link: any) => link.title && link.url)
      : !!(currentValue && typeof currentValue === 'string' ? currentValue.trim() : currentValue)
  ) : false;

  return (
    <div className="lg:hidden mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
      {hasContent ? (
        <>
          {/* Compact suggestions */}
          <div className="space-y-2 mb-3">
            <button
              onClick={() => handleGenerateContent('Rewrite the existing content in a more better way.')}
              disabled={isLoading}
              className="w-full text-left p-2 rounded border border-blue-200 bg-white hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
            >
              Improve what I wrote
            </button>
            {getSmartSuggestions().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleGenerateContent(suggestion)}
                disabled={isLoading}
                className="w-full text-left p-2 rounded border border-blue-200 bg-white hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="relative">
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tell me how to improve what you wrote..."
              className="pr-16 text-sm border-blue-200 focus:border-blue-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading && customPrompt.trim()) {
                  e.preventDefault();
                  handleGenerateContent();
                  setCustomPrompt("");
                }
              }}
            />
            <div className="absolute right-1 top-1 flex gap-1">
              <Button
                size="sm"
                onClick={() => {
                  if (customPrompt.trim()) {
                    handleGenerateContent();
                    setCustomPrompt("");
                  }
                }}
                disabled={isLoading || !customPrompt.trim()}
                className="h-7 w-7 p-0"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* No content message */
        <div className="flex flex-col items-center py-6 px-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="text-gray-900 font-medium text-sm mb-2">Write your thoughts first</h4>
          <p className="text-xs text-gray-600 text-center leading-relaxed mb-4">
            Start by writing your own answer above, then I'll help you improve it.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Ready to help</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="mt-3 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
export default function OnboardingClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submissionSteps, setSubmissionSteps] = useState<{
    title: string;
    done: boolean;
  }[]>([
    { title: "Saving your information", done: false },
<<<<<<< HEAD
    { title: "Creating your SOP", done: false },
=======
    { title: "Creating your Battle Plan", done: false },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    { title: "Preparing your workspace", done: false },
    { title: "Redirecting to dashboard", done: false },
  ]);

<<<<<<< HEAD
  // State for AI assistance per question
  const [aiState, setAiState] = useState<{
    [key: string]: {
      isLoading: boolean;
      generatedContent: string | null;
      customPrompt: string;
    };
  }>({});

  // State to track which question's AI popup is open
  const [activeAiQuestion, setActiveAiQuestion] = useState<string | null>(null);
=======
  // State for AI assistant
  const [currentFocusedQuestion, setCurrentFocusedQuestion] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [mobileAiOpen, setMobileAiOpen] = useState<{[key: string]: boolean}>({});
  const [desktopAiOpen, setDesktopAiOpen] = useState(true); // Desktop AI assistant starts open
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      company_name_official_registered: "",
<<<<<<< HEAD
      list_of_business_owners_full_names: "",
=======
      list_of_business_owners_full_names: [],
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      primary_company_email_address: "",
      primary_company_phone_number: "",
      main_office_physical_address_full: "",
      business_founding_date_iso: "",
      company_origin_story_and_founder_motivation: "",
<<<<<<< HEAD
      main_competitors_list_and_reasons: "",
      current_employees_and_roles_responsibilities: "",
=======
      main_competitors_list_and_reasons: [],
      current_employees_and_roles_responsibilities: [],
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      last_full_year_annual_revenue_amount: "",
      current_profit_margin_percentage: "",
      company_long_term_vision_statement: "",
      ultimate_long_term_goal_for_business_owner: "",
      definition_of_success_in_5_10_20_years: "",
      additional_income_streams_or_investments_needed: "",
      focus_on_single_business_or_multiple_long_term: "",
      personal_skills_knowledge_networks_to_develop: "",
      business_overview_for_potential_investor: "",
      description_of_target_customers_for_investor: "",
      list_of_things_going_right_in_business: "",
      list_of_things_going_wrong_in_business: "",
      list_of_things_missing_in_business: "",
      list_of_things_confusing_in_business: "",
      plans_to_expand_services_or_locations: "",
      detailed_sales_process_from_first_contact_to_close: "",
      structured_follow_up_process_for_unconverted_leads: "",
      customer_experience_and_fulfillment_process: "",
<<<<<<< HEAD
      documented_systems_or_sops_links: "",
=======
      documented_systems_or_sops_links: [],
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      software_and_tools_used_for_operations: "",
      team_structure_and_admin_sales_marketing_roles: "",
      regular_team_meetings_frequency_attendees_agenda: "",
      kpi_scorecards_metrics_tracked_and_review_frequency: "",
      biggest_current_operational_headache: "",
      most_exciting_aspect_of_bootcamp_for_you: "",
      specific_expectations_or_requests_for_bootcamp: "",
      additional_comments_or_items_for_attention: "",
    },
  });

  // Watch form changes and save them
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Save form data when it changes
      const saveData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
<<<<<<< HEAD
=======
        
        // Convert business owners array to string format for backward compatibility
        const dataToSave = { ...data } as any;
        if (dataToSave.list_of_business_owners_full_names && Array.isArray(dataToSave.list_of_business_owners_full_names)) {
          dataToSave.list_of_business_owners_full_names = dataToSave.list_of_business_owners_full_names
            .filter((owner: any) => owner && owner.fullName && owner.role)
            .map((owner: any) => `${owner.fullName} (${owner.role})`)
            .join(', ');
        }

        // Convert competitors array to string format for backward compatibility
        if (dataToSave.main_competitors_list_and_reasons && Array.isArray(dataToSave.main_competitors_list_and_reasons)) {
          dataToSave.main_competitors_list_and_reasons = dataToSave.main_competitors_list_and_reasons
            .filter((competitor: any) => competitor && competitor.name)
            .map((competitor: any) => competitor.name)
            .join(', ');
        }

        // Convert employees array to string format for backward compatibility
        if (dataToSave.current_employees_and_roles_responsibilities && Array.isArray(dataToSave.current_employees_and_roles_responsibilities)) {
          dataToSave.current_employees_and_roles_responsibilities = dataToSave.current_employees_and_roles_responsibilities
            .filter((employee: any) => employee && employee.name && employee.role)
            .map((employee: any) => `${employee.name} (${employee.role})`)
            .join(', ');
// Convert SOP links array to string format for backward compatibility
        if (dataToSave.documented_systems_or_sops_links && Array.isArray(dataToSave.documented_systems_or_sops_links)) {
          dataToSave.documented_systems_or_sops_links = dataToSave.documented_systems_or_sops_links
            .filter((link: any) => link && link.title && link.url)
            .map((link: any) => `${link.title}: ${link.url}`)
            .join('\n');
        }
        }
        
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        await supabase
          .from('company_onboarding')
          .upsert(
            {
              user_id: user.id,
<<<<<<< HEAD
              onboarding_data: data,
=======
              onboarding_data: dataToSave,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              completed: false,
            },
            {
              onConflict: 'user_id',
              ignoreDuplicates: false
            }
          );
      };
      saveData();
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Load onboarding data on mount
  useEffect(() => {
    const fetchOnboardingData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('company_onboarding')
        .select('onboarding_data')
        .eq('user_id', user.id)
        .single();
      if (data && data.onboarding_data) {
<<<<<<< HEAD
        // Use reset to set form values from fetched data
        form.reset(data.onboarding_data);
=======
        // Convert legacy string format to new array format for business owners
        const onboardingData = { ...data.onboarding_data } as any;
        if (typeof onboardingData.list_of_business_owners_full_names === 'string') {
          // Parse the old string format and convert to new array format
          const ownersString = onboardingData.list_of_business_owners_full_names;
          if (ownersString.trim()) {
            // Try to parse comma-separated format like "Jane Doe (CEO), John Smith (COO)"
            const owners = ownersString.split(',').map((owner: string, index: number) => {
              const trimmed = owner.trim();
              const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return {
                  id: `legacy-${index}`,
                  fullName: match[1].trim(),
                  role: match[2].trim()
                };
              } else {
                return {
                  id: `legacy-${index}`,
                  fullName: trimmed,
                  role: ''
                };
              }
            });
            onboardingData.list_of_business_owners_full_names = owners;
          } else {
            onboardingData.list_of_business_owners_full_names = [];
          }
        }

        // Convert legacy string format to new array format for competitors
        if (typeof onboardingData.main_competitors_list_and_reasons === 'string') {
          // Parse the old string format and convert to new array format
          const competitorsString = onboardingData.main_competitors_list_and_reasons;
          if (competitorsString.trim()) {
            // Parse comma-separated format - keep the full text as the name
            const competitors = competitorsString.split(',').map((competitor: string, index: number) => {
              return {
                id: `legacy-competitor-${index}`,
                name: competitor.trim()
              };
            });
            onboardingData.main_competitors_list_and_reasons = competitors;
          } else {
            onboardingData.main_competitors_list_and_reasons = [];
          }
        }

        // Convert legacy string format to new array format for employees
        if (typeof onboardingData.current_employees_and_roles_responsibilities === 'string') {
          // Parse the old string format and convert to new array format
          const employeesString = onboardingData.current_employees_and_roles_responsibilities;
          if (employeesString.trim()) {
            // Try to parse comma-separated format like "John Smith (Operations Manager), Jane Doe (Sales Director)"
            const employees = employeesString.split(',').map((employee: string, index: number) => {
              const trimmed = employee.trim();
              const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return {
                  id: `legacy-employee-${index}`,
                  name: match[1].trim(),
                  role: match[2].trim(),
                  responsibilities: ''
                };
              } else {
                return {
                  id: `legacy-employee-${index}`,
                  name: trimmed,
                  role: '',
                  responsibilities: ''
                };
              }
            });
            onboardingData.current_employees_and_roles_responsibilities = employees;
          } else {
            onboardingData.current_employees_and_roles_responsibilities = [];
          }
        }
        // Convert legacy string format to new array format for SOP links
        if (typeof onboardingData.documented_systems_or_sops_links === 'string') {
          // Parse the old string format and convert to new array format
          const sopsString = onboardingData.documented_systems_or_sops_links;
          if (sopsString.trim()) {
            // Try to parse line-separated format like "Title: URL"
            const links = sopsString.split('\n').map((line: string, index: number) => {
              const trimmed = line.trim();
              const match = trimmed.match(/^(.+?):\s*(https?:\/\/.+)$/);
              if (match) {
                return {
                  id: `legacy-sop-${index}`,
                  title: match[1].trim(),
                  url: match[2].trim()
                };
              } else {
                // Fallback: treat entire line as URL with generic title
                return {
                  id: `legacy-sop-${index}`,
                  title: `Document ${index + 1}`,
                  url: trimmed
                };
              }
            });
            onboardingData.documented_systems_or_sops_links = links;
          } else {
            onboardingData.documented_systems_or_sops_links = [];
          }
        }

        // Use reset to set form values from fetched data
        form.reset(onboardingData);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      }
    };
    fetchOnboardingData();
  }, []);

  // Fetch user name on mount
  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('business_info')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setUserName(data.full_name);
        } else if (error) {
          console.error("Error fetching business info:", error);
          // Fallback to email if name not found or error
          setUserName(user.email || "");
        } else {
           // Fallback to email if name data is null
           setUserName(user.email || "");
        }
      } else {
        setUserName(""); // Clear name if no user
      }
    };
    fetchUserName();
  }, []);

  const handleStartOnboarding = () => {
    setShowWelcome(false);
  };

  const handleNext = async () => {
<<<<<<< HEAD
    // Trigger form validation for the current category's questions
    const currentCategoryQuestions = categories[currentCategory].questions;
    const fieldsToValidate = currentCategoryQuestions.filter(q => q.required).map(q => q.name);

    const isValid = await form.trigger(fieldsToValidate as (keyof z.infer<typeof formSchema>)[]);

    if (isValid) {
      setCurrentCategory((prev) => Math.min(prev + 1, categories.length - 1));
    } else {
       toast({
        title: "Incomplete Section",
        description: "Please complete all required fields in the current section before proceeding.",
=======
    // Custom validation for the current category's questions
    const currentCategoryQuestions = categories[currentCategory].questions;
    const formValues = form.getValues();
    let firstInvalidField: Question | null = null;
    let invalidFieldError = "";

    // Check each required field in the current category
    for (const question of currentCategoryQuestions) {
      if (question.required) {
        const fieldValue = formValues[question.name as keyof z.infer<typeof formSchema>];
        let isFieldValid = false;

        // Validate different field types
        if (question.type === 'business-owners-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((owner: any) => owner.fullName && owner.role);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all business owner names and roles.";
            }
          } else {
            invalidFieldError = "Please add at least one business owner.";
          }
        } else if (question.type === 'competitors-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((competitor: any) => competitor.name);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all competitor names.";
            }
          } else {
            invalidFieldError = "Please add at least one competitor.";
          }
        } else if (question.type === 'employees-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((employee: any) => employee.name && employee.role && employee.responsibilities);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all employee names, roles, and responsibilities.";
            }
          } else {
            invalidFieldError = "Please add at least one employee.";
          }
        } else if (question.type === 'sop-links-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((link: any) => link.title && link.url);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all SOP document titles and URLs.";
            }
          } else {
            invalidFieldError = "Please add at least one SOP document.";
          }
        } else {
          // Standard field validation
          isFieldValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
          if (!isFieldValid) {
            invalidFieldError = "This field is required.";
          }
        }

        if (!isFieldValid) {
          firstInvalidField = question;
          break;
        }
      }
    }

    // If all fields are valid, proceed to next category
    if (!firstInvalidField) {
      setCurrentCategory((prev) => Math.min(prev + 1, categories.length - 1));
    } else {
      // Scroll to the first invalid field
      const fieldElement = document.getElementById(firstInvalidField.name);
      if (fieldElement) {
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Focus on the field after a short delay to ensure scrolling completes
        setTimeout(() => {
          fieldElement.focus();
          // Also set it as the focused question for AI assistant
          setCurrentFocusedQuestion(firstInvalidField.name);
        }, 500);
      }

      toast({
        title: "Incomplete Field",
        description: invalidFieldError,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentCategory((prev) => Math.max(prev - 1, 0));
  };

  const isCategoryComplete = (categoryIndex: number) => {
    const category = categories[categoryIndex];
    // Get values directly from react-hook-form
    const formValues = form.getValues();
    return category.questions.every(q => {
      if (q.required) {
        const answer = formValues[q.name as keyof z.infer<typeof formSchema>];
<<<<<<< HEAD
=======
        if (q.type === 'business-owners-repeater') {
          return Array.isArray(answer) && answer.length > 0 && answer.every((owner: any) => owner.fullName && owner.role);
        }
        if (q.type === 'competitors-repeater') {
          return Array.isArray(answer) && answer.length > 0 && answer.every((competitor: any) => competitor.name);
        }
        if (q.type === 'employees-repeater') {
          return Array.isArray(answer) && answer.length > 0 && answer.every((employee: any) => employee.name && employee.role && employee.responsibilities);
        }
        if (q.type === 'sop-links-repeater') {
          return Array.isArray(answer) && answer.length > 0 && answer.every((link: any) => link.title && link.url);
        }
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        return answer !== undefined && answer !== null && answer !== '';
      }
      return true; // Optional fields are considered complete
    });
  };

  const handleCategoryClick = (index: number) => {
    if (index <= currentCategory) {
      // Allow navigating back to any previous or current sectionnn
      setCurrentCategory(index);
    } else if (index === currentCategory + 1) {
      // Allow navigating to the next section if the current section is complete
<<<<<<< HEAD
      if (isCategoryComplete(currentCategory)) {
        setCurrentCategory(index);
      } else {
        toast({
          title: "Incomplete Section",
          description: "Please complete the current section before moving to the next.",
=======
      const currentCategoryQuestions = categories[currentCategory].questions;
      const formValues = form.getValues();
      let firstInvalidField: Question | null = null;
      let invalidFieldError = "";

      // Check each required field in the current category
      for (const question of currentCategoryQuestions) {
        if (question.required) {
          const fieldValue = formValues[question.name as keyof z.infer<typeof formSchema>];
          let isFieldValid = false;

          // Validate different field types
          if (question.type === 'business-owners-repeater') {
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              isFieldValid = fieldValue.every((owner: any) => owner.fullName && owner.role);
              if (!isFieldValid) {
                invalidFieldError = "Please fill in all business owner names and roles.";
              }
            } else {
              invalidFieldError = "Please add at least one business owner.";
            }
          } else if (question.type === 'competitors-repeater') {
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              isFieldValid = fieldValue.every((competitor: any) => competitor.name);
              if (!isFieldValid) {
                invalidFieldError = "Please fill in all competitor names.";
              }
            } else {
              invalidFieldError = "Please add at least one competitor.";
            }
          } else if (question.type === 'employees-repeater') {
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              isFieldValid = fieldValue.every((employee: any) => employee.name && employee.role && employee.responsibilities);
              if (!isFieldValid) {
                invalidFieldError = "Please fill in all employee names, roles, and responsibilities.";
              }
            } else {
              invalidFieldError = "Please add at least one employee.";
            }
          } else if (question.type === 'sop-links-repeater') {
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              isFieldValid = fieldValue.every((link: any) => link.title && link.url);
              if (!isFieldValid) {
                invalidFieldError = "Please fill in all SOP document titles and URLs.";
              }
            } else {
              invalidFieldError = "Please add at least one SOP document.";
            }
          } else {
            // Standard field validation
            isFieldValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
            if (!isFieldValid) {
              invalidFieldError = "This field is required.";
            }
          }

          if (!isFieldValid) {
            firstInvalidField = question;
            break;
          }
        }
      }

      if (!firstInvalidField) {
        setCurrentCategory(index);
      } else {
        // Find the first invalid field in the current section and scroll to it
        if (firstInvalidField) {
          // Scroll to the first invalid field
          const fieldElement = document.getElementById(firstInvalidField.name);
          if (fieldElement) {
            fieldElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            // Focus on the field after a short delay to ensure scrolling completes
            setTimeout(() => {
              fieldElement.focus();
              // Also set it as the focused question for AI assistant
              setCurrentFocusedQuestion(firstInvalidField.name);
            }, 500);
          }
        }

        toast({
          title: "Incomplete Field",
          description: invalidFieldError,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          variant: "destructive",
        });
      }
    }
    // Do not allow skipping sections beyond the next one via sidebar click
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // NEW CHECK: Only allow submission if we are truly on the last category page.
    if (currentCategory !== categories.length - 1) {
      toast({
        title: "Submission Error",
        description: "Form can only be submitted from the final section.",
        variant: "destructive",
      });
      return;
    }

    // Validate the final section before submitting
<<<<<<< HEAD
    if (!isCategoryComplete(categories.length - 1)) {
       toast({
        title: "Incomplete Section",
        description: "Please complete all required fields in the final section before submitting.",
        variant: "destructive",
      });
=======
    const finalCategoryQuestions = categories[categories.length - 1].questions;
    const formValues = form.getValues();
    let firstInvalidField: Question | null = null;
    let invalidFieldError = "";

    // Check each required field in the final category
    for (const question of finalCategoryQuestions) {
      if (question.required) {
        const fieldValue = formValues[question.name as keyof z.infer<typeof formSchema>];
        let isFieldValid = false;

        // Validate different field types
        if (question.type === 'business-owners-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((owner: any) => owner.fullName && owner.role);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all business owner names and roles.";
            }
          } else {
            invalidFieldError = "Please add at least one business owner.";
          }
        } else if (question.type === 'competitors-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((competitor: any) => competitor.name);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all competitor names.";
            }
          } else {
            invalidFieldError = "Please add at least one competitor.";
          }
        } else if (question.type === 'employees-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((employee: any) => employee.name && employee.role && employee.responsibilities);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all employee names, roles, and responsibilities.";
            }
          } else {
            invalidFieldError = "Please add at least one employee.";
          }
        } else if (question.type === 'sop-links-repeater') {
          if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            isFieldValid = fieldValue.every((link: any) => link.title && link.url);
            if (!isFieldValid) {
              invalidFieldError = "Please fill in all SOP document titles and URLs.";
            }
          } else {
            invalidFieldError = "Please add at least one SOP document.";
          }
        } else {
          // Standard field validation
          isFieldValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
          if (!isFieldValid) {
            invalidFieldError = "This field is required.";
          }
        }

        if (!isFieldValid) {
          firstInvalidField = question;
          break;
        }
      }
    }

    if (firstInvalidField) {
      // Scroll to the first invalid field
      const fieldElement = document.getElementById(firstInvalidField.name);
      if (fieldElement) {
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Focus on the field after a short delay to ensure scrolling completes
        setTimeout(() => {
          fieldElement.focus();
          // Also set it as the focused question for AI assistant
          setCurrentFocusedQuestion(firstInvalidField.name);
        }, 500);
      }

      toast({
        title: "Incomplete Field",
        description: invalidFieldError,
        variant: "destructive",
      });
      setIsLoading(false);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      return;
    }

    // Get all form values for submission
    const allFormValues = form.getValues();

<<<<<<< HEAD
=======
    // Convert business owners array to string format for backward compatibility
    const dataToSubmit = { ...allFormValues } as any;
    if (dataToSubmit.list_of_business_owners_full_names && Array.isArray(dataToSubmit.list_of_business_owners_full_names)) {
      dataToSubmit.list_of_business_owners_full_names = dataToSubmit.list_of_business_owners_full_names
        .filter((owner: any) => owner && owner.fullName && owner.role)
        .map((owner: any) => `${owner.fullName} (${owner.role})`)
        .join(', ');
    }

    // Convert competitors array to string format for backward compatibility
    if (dataToSubmit.main_competitors_list_and_reasons && Array.isArray(dataToSubmit.main_competitors_list_and_reasons)) {
      dataToSubmit.main_competitors_list_and_reasons = dataToSubmit.main_competitors_list_and_reasons
        .filter((competitor: any) => competitor && competitor.name)
        .map((competitor: any) => competitor.name)
        .join(', ');
    }

    // Convert employees array to string format for backward compatibility
    if (dataToSubmit.current_employees_and_roles_responsibilities && Array.isArray(dataToSubmit.current_employees_and_roles_responsibilities)) {
      dataToSubmit.current_employees_and_roles_responsibilities = dataToSubmit.current_employees_and_roles_responsibilities
        .filter((employee: any) => employee && employee.name && employee.role)
        .map((employee: any) => `${employee.name} (${employee.role})`)
        .join(', ');
    }

    // Convert SOP links array to string format for backward compatibility
    if (dataToSubmit.documented_systems_or_sops_links && Array.isArray(dataToSubmit.documented_systems_or_sops_links)) {
      dataToSubmit.documented_systems_or_sops_links = dataToSubmit.documented_systems_or_sops_links
        .filter((link: any) => link && link.title && link.url)
        .map((link: any) => `${link.title}: ${link.url}`)
        .join('\n');
    }

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    try {
      // Update first step - Saving your information
      setSubmissionSteps(steps => steps.map((step, i) =>
        i === 0 ? { ...step, done: true } : step
      ));

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if user already has onboarding data
      const { data: existingOnboarding } = await supabase
        .from('company_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingOnboarding) {
        // Update existing record
        console.log('📝 Updating existing onboarding record for user:', user.id);
        await supabase
          .from('company_onboarding')
          .update({
<<<<<<< HEAD
            onboarding_data: allFormValues,
=======
            onboarding_data: dataToSubmit,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        console.log('✅ Successfully updated onboarding record');
      } else {
        // Insert new record
        console.log('🆕 Creating new onboarding record for user:', user.id);
        await supabase
          .from('company_onboarding')
          .insert({
            user_id: user.id,
<<<<<<< HEAD
            onboarding_data: allFormValues,
=======
            onboarding_data: dataToSubmit,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            completed: true,
          });
        console.log('✅ Successfully created onboarding record');
      }

      // Update second step - Creating your SOP
      setSubmissionSteps(steps => steps.map((step, i) =>
        i === 1 ? { ...step, done: true } : step
      ));

      // Generate SOP automatically after successful onboarding
      try {
        const sopResponse = await fetch('/api/sop/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
<<<<<<< HEAD
            onboardingData: allFormValues,
=======
            onboardingData: dataToSubmit,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          }),
        });

        if (sopResponse.ok) {
<<<<<<< HEAD
          console.log('✅ SOP generated successfully');
        } else {
          console.warn('⚠️ SOP generation failed, but onboarding completed');
        }
      } catch (sopError) {
        console.warn('⚠️ SOP generation error:', sopError);
=======
          console.log('✅ Battle Plan generated successfully');
        } else {
          console.warn('⚠️ Battle Plan generation failed, but onboarding completed');
        }
      } catch (sopError) {
        console.warn('⚠️ Battle Plan generation error:', sopError);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        // Don't fail the onboarding if SOP generation fails
      }

      // Update third step - Preparing your workspace
      setSubmissionSteps(steps => steps.map((step, i) =>
        i === 2 ? { ...step, done: true } : step
      ));

      // Small delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update final step - Redirecting to dashboard
      setSubmissionSteps(steps => steps.map((step, i) =>
        i === 3 ? { ...step, done: true } : step
      ));

      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500));

<<<<<<< HEAD
      toast({ title: "Success", description: "Your company information has been saved and SOP generated!" });
=======
      toast({ title: "Success", description: "Your company information has been saved and Battle Plan generated!" });
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      
      // Add URL parameter to indicate fresh onboarding completion
      router.push('/dashboard?onboarding=completed');
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save your information. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  // AI Assistance Handlers
  const toggleAiAssist = (questionName: string) => {
    setActiveAiQuestion(activeAiQuestion === questionName ? null : questionName);
    // Initialize state for the question if it doesn't exist
    if (!aiState[questionName]) {
      setAiState(prevState => ({
        ...prevState,
        [questionName]: { isLoading: false, generatedContent: null, customPrompt: "" },
      }));
    }
  };

  const handleCustomPromptChange = (questionName: string, value: string) => {
    setAiState(prevState => ({
      ...prevState,
      [questionName]: {
        ...prevState[questionName],
        customPrompt: value,
      },
    }));
  };

  const handleGenerateContent = async (questionName: string) => {
    setAiState(prevState => ({
      ...prevState,
      [questionName]: {
        ...prevState[questionName],
        isLoading: true,
        generatedContent: null,
      },
    }));

    const currentFormValues = form.getValues();
    const currentQuestion = questions.find(q => q.name === questionName);
    const currentCategoryObj = categories.find(cat => cat.questions.some(q => q.name === questionName));
    const customPrompt = aiState[questionName]?.customPrompt || "";

    try {
      const response = await fetch('/api/gemini/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentFormValues,
          questionName,
          questionLabel: currentQuestion?.label,
          categoryTitle: currentCategoryObj?.title,
          customPrompt,
          action: 'generate',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error generating content: ${response.statusText}`);
      }

      const data = await response.json();
      setAiState(prevState => ({
        ...prevState,
        [questionName]: {
          ...prevState[questionName],
          generatedContent: data.generatedContent,
          isLoading: false,
        },
      }));
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
      setAiState(prevState => ({
        ...prevState,
        [questionName]: {
          ...prevState[questionName],
          isLoading: false,
          generatedContent: null,
        },
      }));
    }
  };

   const handleImproveContent = async (questionName: string) => {
    setAiState(prevState => ({
      ...prevState,
      [questionName]: {
        ...prevState[questionName],
        isLoading: true,
        generatedContent: null,
      },
    }));

    const currentFormValues = form.getValues();
    const currentQuestion = questions.find(q => q.name === questionName);
    const currentCategoryObj = categories.find(cat => cat.questions.some(q => q.name === questionName));
    const customPrompt = aiState[questionName]?.customPrompt || "";
    const existingContent = form.getValues(questionName as keyof z.infer<typeof formSchema>);


    try {
      const response = await fetch('/api/gemini/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentFormValues,
          questionName,
          questionLabel: currentQuestion?.label,
          categoryTitle: currentCategoryObj?.title,
          customPrompt,
          existingContent, // Include existing content for improvement
          action: 'improve', // Indicate improvement action
        }),
      });

      if (!response.ok) {
        throw new Error(`Error improving content: ${response.statusText}`);
      }

      const data = await response.json();
      setAiState(prevState => ({
        ...prevState,
        [questionName]: {
          ...prevState[questionName],
          generatedContent: data.generatedContent,
          isLoading: false,
        },
      }));
    } catch (error: any) {
      console.error("AI Improvement Error:", error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to improve content. Please try again.",
        variant: "destructive",
      });
      setAiState(prevState => ({
        ...prevState,
        [questionName]: {
          ...prevState[questionName],
          isLoading: false,
          generatedContent: null,
        },
      }));
    }
  };


  const handleAcceptContent = (questionName: string) => {
    const generatedContent = aiState[questionName]?.generatedContent;
    if (generatedContent) {
      form.setValue(questionName as keyof z.infer<typeof formSchema>, generatedContent, { shouldValidate: true });
      setAiState(prevState => ({
        ...prevState,
        [questionName]: {
          ...prevState[questionName],
          generatedContent: null, // Clear generated content after accepting
          customPrompt: "", // Clear custom prompt
        },
      }));
      setActiveAiQuestion(null); // Close popup after accepting
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, questionName: string) => {
    if (event.key === 'Enter' && !aiState[questionName]?.isLoading) {
      event.preventDefault(); // Prevent default form submission
      const fieldValue = form.getValues(questionName as keyof z.infer<typeof formSchema>);
      const hasContent = !!fieldValue;
      if (hasContent) {
        handleImproveContent(questionName);
      } else {
        handleGenerateContent(questionName);
      }
    }
=======
  // AI Content Accept Handler for inline assistant
  const handleAiContentAccept = (questionName: string, content: string) => {
    form.setValue(questionName as keyof z.infer<typeof formSchema>, content, { shouldValidate: true });
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  };

  const currentQuestions = categories[currentCategory].questions;

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {isLoading && <SubmissionLoader loadingSteps={submissionSteps} />}
      <OnboardingHeader userName={userName} />
      <main className="mx-auto p-0">
        {showWelcome ? (
          <WelcomeScreen userEmail={userName} onStart={handleStartOnboarding} />
        ) : (
          <div className="min-h-screen w-full flex relative">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
<<<<<<< HEAD
              className="md:hidden fixed top-20 left-4 z-20 bg-white border p-2 shadow-md hover:bg-gray-100 transition-colors"
=======
              className="md:hidden fixed top-20 left-4 z-20 bg-white border p-2 hover:bg-gray-100 transition-colors"
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Sidebar for desktop */}
            <div className="hidden md:block w-full max-w-[380px] bg-white sticky top-16 self-start min-h-[calc(100vh-4rem)] border-r z-10 shadow-sm">
              <div className="flex flex-col h-full">
                {/* Sidebar header */}
                <div className="px-6 py-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
                  <p className="text-sm text-gray-500 mt-1">Complete all sections to continue</p>
                </div>

                {/* Steps list */}
                <div className="flex-1 overflow-y-auto py-2">
                  <div className="flex flex-col gap-2">
                    {categories.map((category, index) => (
                      <StepIndicator
                        key={category.id}
                        step={index + 1}
                        title={category.title}
                        description={category.description}
                        isActive={index === currentCategory}
                        isCompleted={index < currentCategory}
                        onClick={() => handleCategoryClick(index)}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between mb-0">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-medium text-blue-600">{Math.round((currentCategory / (categories.length - 1)) * 100)}%</span>
                  </div>
                  <Progress value={(currentCategory / (categories.length - 1)) * 100} className="h-2" />
                </div>
              </div>
            </div>

            {/* Mobile sidebar using Sheet */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetContent side="left" className="w-full max-w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* Sidebar header */}
                  <div className="px-6 py-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
                    <p className="text-sm text-gray-500 mt-1">Complete all sections to continue</p>
                  </div>

                  {/* Steps list */}
                  <div className="flex-1 overflow-y-auto py-2">
                    <div className="flex flex-col">
                      {categories.map((category, index) => (
                        <StepIndicator
                          key={category.id}
                          step={index + 1}
                          title={category.title}
                          description={category.description}
                          isActive={index === currentCategory}
                          isCompleted={index < currentCategory}
                          onClick={() => {
                            handleCategoryClick(index);
                            setIsSidebarOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between mb-0">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm font-medium text-blue-600">{Math.round((currentCategory / (categories.length - 1)) * 100)}%</span>
                    </div>
                    <Progress value={(currentCategory / (categories.length - 1)) * 100} className="h-2" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Right Content Area for Questions */}
            <div className="flex justify-center items-center w-full p-4 md:p-8 relative pb-24 md:pb-8 pt-24">
<<<<<<< HEAD
              <form onSubmit={handleSubmit} id="onboarding-form" className="w-full max-w-3xl flex flex-col items-center min-h-[calc(100vh-10rem)] pt-0 md:pt-20">
=======
              <div className={`w-full flex gap-8 ${desktopAiOpen ? 'max-w-6xl' : 'max-w-3xl justify-center'}`}>
                {/* Form Section */}
                <form onSubmit={handleSubmit} id="onboarding-form" className={`flex-1 flex flex-col items-center min-h-[calc(100vh-10rem)] pt-0 md:pt-20 ${desktopAiOpen ? 'max-w-3xl' : 'max-w-3xl'}`}>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              <Progress value={(currentCategory + 1) / categories.length * 100} className="mb-6" />

                <div className="w-full mb-8 text-left">
                  <h2 className="text-2xl font-bold text-gray-900">Step {currentCategory + 1}: {categories[currentCategory].title}</h2>
                  <p className="text-sm text-gray-600 mt-2">{categories[currentCategory].description}</p>
                </div>

<<<<<<< HEAD
                <div className="w-full space-y-4">
                  {currentQuestions.map((q) => {
                    const fieldName = q.name as keyof z.infer<typeof formSchema>;
                    const fieldValue = form.getValues(fieldName);
                    const hasContent = !!fieldValue;
                    const currentAiState = aiState[q.name] || { isLoading: false, generatedContent: null, customPrompt: "" };
                    const isAiSectionOpen = activeAiQuestion === q.name;

                    return (
                      <div key={q.name} className="relative bg-white p-5 pt-3 rounded-xl border"> {/* Added relative positioning */}
                        <div className="flex items-center justify-between mb-0">
                          <label
                            className="block text-sm text-gray-600"
=======
                <div className="w-full space-y-8">
                  {currentQuestions.map((q) => {
                    const fieldName = q.name as keyof z.infer<typeof formSchema>;
                    const fieldValue = form.watch(fieldName);
                    const hasContent = q.type === 'business-owners-repeater'
                      ? Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue.every((owner: any) => owner.fullName && owner.role)
                      : q.type === 'competitors-repeater'
                      ? Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue.every((competitor: any) => competitor.name)
                      : q.type === 'employees-repeater'
                      ? Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue.every((employee: any) => employee.name && employee.role && employee.responsibilities)
                      : q.type === 'sop-links-repeater'
                      ? Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue.every((link: any) => link.title && link.url)
                      : !!(fieldValue && typeof fieldValue === 'string' ? fieldValue.trim() : fieldValue);
                    const IconComponent = q.icon || HelpCircle;

                    return (
                      <div 
                        key={q.name} 
                        className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-gray-200 ${
                          currentFocusedQuestion === q.name 
                            ? ' !border-blue-400 shadow-lg shadow-blue-100/50 bg-blue-50/30' 
                            : 'border border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                          <label
                                  className="block text-sm md:text-lg font-medium text-gray-900 mb-1 leading-tight"
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                            htmlFor={q.name}
                          >
                            {q.label}
                          </label>
<<<<<<< HEAD
                          {(q.aiAssist ?? false) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => toggleAiAssist(q.name)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-600 p-0 hover:bg-transparent hover:text-blue-800 transition-colors"
                            >
                              <Sparkles className="h-4 w-4" />
                              AI Assist
                            </Button>
                          )}
                        </div>

                        {q.type === 'input' ? (
                          <>
=======
                                {q.description && (
                                  <p className="text-sm text-gray-500 mb-3">{q.description}</p>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>

                        {/* Form Field */}
                        <div className="space-y-3">
                        {q.type === 'business-owners-repeater' ? (
                            <BusinessOwnersRepeater
                              value={form.getValues(fieldName) as BusinessOwner[] || []}
                              onChange={(owners) => {
                                form.setValue(fieldName, owners, { shouldValidate: true });
                              }}
                              required={q.required}
                            />
                        ) : q.type === 'competitors-repeater' ? (
                            <CompetitorsRepeater
                              value={form.getValues(fieldName) as Competitor[] || []}
                              onChange={(competitors) => {
                                form.setValue(fieldName, competitors, { shouldValidate: true });
                              }}
                              required={q.required}
                            />
                        ) : q.type === 'employees-repeater' ? (
                            <EmployeesRepeater
                              value={form.getValues(fieldName) as Employee[] || []}
                              onChange={(employees) => {
                                form.setValue(fieldName, employees, { shouldValidate: true });
                              }}
                              required={q.required}
                            />
                        ) : q.type === 'date-picker' ? (
                            <DatePicker
                              value={typeof form.getValues(fieldName) === 'string' ? form.getValues(fieldName) as string : ""}
                              onChange={(date) => {
                                form.setValue(fieldName, date, { shouldValidate: true });
                              }}
                              required={q.required}
                              placeholder={q.placeholder}
                            />
                        ) : q.type === 'sop-links-repeater' ? (
                            <SOPLinksRepeater
                              value={form.getValues(fieldName) as SOPLink[] || []}
                              onChange={(links) => {
                                form.setValue(fieldName, links, { shouldValidate: true });
                              }}
                              required={q.required}
                            />
                        ) : q.type === 'input' ? (
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                            <Input
                              id={q.name}
                              type={q.inputType || 'text'}
                              placeholder={q.placeholder}
<<<<<<< HEAD
                              className="rounded-md w-full text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
                              required={q.required}
                              {...form.register(fieldName)}
                            />
                            {form.formState.errors[fieldName] && (
                              <p className="text-red-500 text-sm mt-1">{form.formState.errors[fieldName]?.message}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <Textarea
                              id={q.name}
                              placeholder={q.placeholder}
                              className="rounded-md w-full min-h-[100px] text-base 
 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm"
                              required={q.required}
                              {...form.register(fieldName)}
                            />
                             {form.formState.errors[fieldName] && (
                              <p className="text-red-500 text-sm mt-1">{form.formState.errors[fieldName]?.message}</p>
                            )}
                          </>
                        )}

                        {/* AI Assistance Section (Popup) */}
                        {isAiSectionOpen && (
                          <div className="absolute z-10 right-0 mt-2 w-80 p-3 bg-blue-50 rounded-md border border-blue-100 shadow-lg"> {/* Adjusted styling for popup */}
                            <div className="flex items-center gap-2 text-blue-800 mb-2"> {/* Adjusted margin */}
                              <Sparkles className="h-4 w-4" /> {/* Adjusted size */}
                              <span className="font-semibold text-sm">AI Assistance</span> {/* Adjusted font size */}
                            </div>
                            <div className="mb-2"> {/* Adjusted margin */}
                              <label htmlFor={`${q.name}-ai-prompt`} className="block text-xs text-gray-700 mb-1"> {/* Adjusted font size */}
                                Custom Instructions (Optional):
                              </label>
                              <Input
                                id={`${q.name}-ai-prompt`}
                                type="text"
                                placeholder="e.g., Make it sound more professional"
                                value={currentAiState.customPrompt}
                                onChange={(e) => handleCustomPromptChange(q.name, e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, q.name)} // Added key press handler
                                className="rounded-md w-full text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500" // Adjusted font size
                                disabled={currentAiState.isLoading}
                              />
                            </div>
                            <div className="flex gap-2 mb-2"> {/* Adjusted margin */}
                              {!hasContent && (
                                <Button
                                  type="button"
                                  size="sm" // Kept size sm for compactness
                                  onClick={() => handleGenerateContent(q.name)}
                                  disabled={currentAiState.isLoading}
                                  className="flex items-center gap-1 text-xs" // Adjusted font size
                                >
                                  {currentAiState.isLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" /> // Adjusted size
                                  ) : (
                                    <Wand2 className="h-3 w-3" /> // Adjusted size
                                  )}
                                  Generate
                                </Button>
                              )}
                              {hasContent && (
                                <Button
                                  type="button"
                                  size="sm" // Kept size sm for compactness
                                  variant="outline"
                                  onClick={() => handleImproveContent(q.name)}
                                  disabled={currentAiState.isLoading}
                                  className="flex items-center gap-1 text-xs" // Adjusted font size
                                >
                                   {currentAiState.isLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" /> // Adjusted size
                                  ) : (
                                    <RefreshCw className="h-3 w-3" /> // Adjusted size
                                  )}
                                  Improve
                                </Button>
                              )}
                            </div>

                            {currentAiState.isLoading && (
                              <div className="hidden flex items-center gap-2 text-gray-600 text-xs"> {/* Adjusted font size */}
                                <Loader2 className="h-3 w-3 animate-spin" /> // Adjusted size
                                <span>Generating...</span>
                              </div>
                            )}

                            {currentAiState.generatedContent && (
                              <div className="mt-2 p-2 bg-white rounded-md border border-gray-200 text-gray-800 text-xs max-h-64 overflow-scroll"> {/* Adjusted padding and font size */}
                                <p className="font-semibold mb-1">Generated Content Preview:</p> {/* Adjusted margin */}
                                <p>{currentAiState.generatedContent}</p>
                              </div>
                            )}
                            {/* Buttons moved outside the preview div */}
                            {currentAiState.generatedContent && (
                                <div className="flex gap-2 mt-2"> {/* Adjusted margin */}
                                  <Button
                                    type="button"
                                    size="sm" // Kept size sm for compactness
                                    onClick={() => handleAcceptContent(q.name)}
                                    className="text-xs" // Adjusted font size
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm" // Kept size sm for compactness
                                    variant="outline"
                                    onClick={() => hasContent ? handleImproveContent(q.name) : handleGenerateContent(q.name)} // Regenerate
                                    className="text-xs" // Adjusted font size
                                  >
                                    Regenerate
                                  </Button>
                                </div>
                              )}
                          </div>
                        )}
=======
                              className="w-full text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12 px-4 bg-gray-50"
                              required={q.required}
                              onFocus={() => setCurrentFocusedQuestion(q.name)}
                              {...form.register(fieldName)}
                            />
                        ) : (
                            <Textarea
                              id={q.name}
                              placeholder={q.placeholder}
                              className="w-full min-h-[220px] text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4 resize-none bg-gray-50"
                              required={q.required}
                              onFocus={() => setCurrentFocusedQuestion(q.name)}
                              {...form.register(fieldName)}
                            />
                          )}
                          

                          
                             {form.formState.errors[fieldName] && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <X className="h-4 w-4" />
                              {form.formState.errors[fieldName]?.message}
                            </p>
                          )}

                          {/* Mobile AI Dropdown - FAQ-style collapsible for AI-enabled questions */}
                          {q.aiAssist && hasContent && (
                            <div className="lg:hidden mt-3">
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                type="button"
                                onClick={() => {
                                  setCurrentFocusedQuestion(q.name);
                                  setMobileAiOpen(prev => ({
                                    ...prev,
                                    [q.name]: !prev[q.name]
                                  }));
                                }}
                                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                              >
                                  <div className="flex items-center gap-2">
                                    <AnimatedAIBlob className="w-4 h-4" isActive={mobileAiOpen[q.name]} />
                                    <span className="text-sm font-medium text-blue-700">
                                      Need Writing Help?
                                    </span>
                            </div>
                                  {mobileAiOpen[q.name] ? (
                                    <ChevronUp className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                  )}
                                </button>
                                
                                {mobileAiOpen[q.name] && (
                                  <div className="border-t border-gray-200 bg-white">
                                    <div className="p-3">
                                      <p className="text-xs text-gray-600 mb-3">
                                        Get AI help with improving your response
                                      </p>
                                      <MobileAIAssistant
                                        focusedQuestion={q.name}
                                        form={form}
                                        categories={categories}
                                        onClose={() => setMobileAiOpen(prev => ({
                                          ...prev,
                                          [q.name]: false
                                        }))}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                                </div>

                        {/* Progress indicator for this question */}
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          {q.required ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                              Required
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              Optional
                            </span>
                          )}
                          {hasContent && (
                            <span className="text-green-600 font-medium">✓ Completed</span>
                              )}
                          </div>


>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      </div>
                    );
                  })}
                </div>

<<<<<<< HEAD
=======


>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                {/* Desktop navigation buttons */}
                <div className="hidden md:flex w-full pt-6 justify-center">
                  <div className="w-full max-w-3xl flex justify-between gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentCategory === 0 || isLoading}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    {currentCategory < categories.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        {isLoading ? "Saving..." : "Complete Onboarding"}
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>

<<<<<<< HEAD
=======
                {/* Sticky AI Assistant - only render container when open */}
                {desktopAiOpen && (
                  <div className="hidden lg:block sticky top-20 self-start h-[calc(100vh-8rem)] w-96">
                    <FloatingAIAssistant
                      focusedQuestion={currentFocusedQuestion}
                      form={form}
                      categories={categories}
                      onAcceptContent={handleAiContentAccept}
                      isOpen={desktopAiOpen}
                      onToggle={() => setDesktopAiOpen(!desktopAiOpen)}
                    />
                  </div>
                )}
                
                {/* Floating AI Open Button - shows when AI is closed */}
                {!desktopAiOpen && (
                  <div className="hidden lg:block fixed top-24 right-8 z-20">
                    <Button
                      onClick={() => setDesktopAiOpen(true)}
                      className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center p-0"
                      title="Open AI Assistant"
                    >
                      <AnimatedAIBlob className="w-6 h-6" isActive={true} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile AI is now inline - no floating assistant needed */}

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              {/* Mobile bottom navigation bar */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentCategory === 0 || isLoading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <span className="text-sm font-medium text-gray-500">
                  Step {currentCategory + 1} of {categories.length}
                </span>
                {currentCategory < categories.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Saving..." : "Complete"}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}