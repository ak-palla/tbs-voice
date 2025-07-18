"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useRef } from "react";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { Loader2, Plus, Pencil, Trash2, Search, Filter, BarChart, Eye, Calendar, Target, User, FileText, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamMemberIds } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { Input, ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
=======
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DepartmentDropdown, 
  TeamMemberDropdown, 
  MetricTypeDropdown, 
  DepartmentFilterDropdown,
  getFormatHint,
  getMetricTypeIcon 
} from "@/components/ui/dropdown-helpers";

type Department = {
  id: string;
  name: string;
};

type TeamMember = {
  id: string;
  full_name: string;
  profile_picture_url?: string;
};
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

type ScorecardData = {
  id: string;
  user_id: string;
  name: string;
<<<<<<< HEAD
  department: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
  remainder: string;
  monthlyactual: string;
  monthlytarget: string;
  status: "Green" | "Light Green" | "Yellow" | "Light Red" | "Red";
  metricowner: string;
=======
  department_id: string | null;
  department?: Department;
  week1: number | null;
  week2: number | null;
  week3: number | null;
  week4: number | null;
  remainder: number | null;
  monthlyactual: number | null;
  monthlytarget: number | null;
  status: "Green" | "Light Green" | "Yellow" | "Light Red" | "Red";
  metricowner_id: string | null;
  metricowner?: TeamMember;
  metric_type: "Numeric Count" | "Currency / Revenue" | "Percentages";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  metricsource: string;
  notes: string;
  created_at: string;
  updated_at: string;
<<<<<<< HEAD
};

const DEPARTMENTS = [
  "EVERGREEN METRICS",
  "NORTH STAR METRICS",
  "MARKETING",
  "SALES",
  "PRODUCT/PROGRAMS",
  "TECHNOLOGY/DEVELOPMENT",
  "SUCCESS/SUPPORT",
  "OPERATIONS",
  "ACCOUNTING/FINANCE"
];

const STATUS_OPTIONS = ["Green", "Light Green", "Yellow", "Light Red", "Red"];
=======
  // Keep old fields for backward compatibility during migration
  department_old?: string;
  metricowner_old?: string;
};

const STATUS_OPTIONS = ["Green", "Light Green", "Yellow", "Light Red", "Red"];

const METRIC_TYPES = [
  "Numeric Count",
  "Currency / Revenue", 
  "Percentages",
];

// Function to calculate status based on performance
const calculateStatus = (actual: number | null, target: number | null): ScorecardData["status"] => {
  if (actual === null || target === null || target === 0) return "Red";
  const percentage = (actual / target) * 100;
  if (percentage >= 100) return "Green";
  if (percentage >= 80) return "Light Green";
  if (percentage >= 60) return "Yellow";
  if (percentage >= 40) return "Light Red";
  return "Red";
};

// Function to format values based on metric type
const formatValue = (value: number | null, metricType: string): string => {
  if (value === null) return "—";
  
  switch (metricType) {
    case "Currency / Revenue":
      return `£${value.toLocaleString()}`;
    case "Percentages":
      return `${value}%`;

    case "Numeric Count":
    default:
      return value.toLocaleString();
  }
};

// Function to format weekly breakdown display
const formatWeeklyBreakdown = (scorecard: ScorecardData): string => {
  const weeks = [
    scorecard.week1,
    scorecard.week2,
    scorecard.week3,
    scorecard.week4
  ];
  
  if (weeks.every((v) => v === null) && scorecard.remainder === null) {
    return "—";
  }
  
  const formattedWeeks = weeks.map((week) => 
    week !== null ? formatValue(week, scorecard.metric_type) : "—"
  );
  
  let result = formattedWeeks.join(" / ");
  
  if (scorecard.remainder !== null) {
    result += ` (Rem: ${formatValue(scorecard.remainder, scorecard.metric_type)})`;
  }
  
  return result;
};

// Function to format actual/target display
const formatActualTarget = (scorecard: ScorecardData): string => {
  if (scorecard.monthlyactual === null && scorecard.monthlytarget === null) {
    return "—";
  }
  
  const actual = scorecard.monthlyactual !== null 
    ? formatValue(scorecard.monthlyactual, scorecard.metric_type) 
    : "—";
  const target = scorecard.monthlytarget !== null 
    ? formatValue(scorecard.monthlytarget, scorecard.metric_type) 
    : "—";
  
  return `${actual} / ${target}`;
};

// Function to get placeholder based on metric type
const getPlaceholder = (metricType: string, field: string): string => {
  const baseText = field === "target" ? "target" : "value";
  
  switch (metricType) {
    case "Currency / Revenue":
      return `Enter ${baseText} (e.g. 5000)`;
    case "Percentages":
      return `Enter ${baseText} (e.g. 85)`;
    case "Numeric Count":
    default:
      return `Enter ${baseText} (e.g. 100)`;
  }
};


>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

export default function CompanyScorecardPage() {
  const [scorecardsData, setScorecardsData] = useState<ScorecardData[]>([]);
  const [filteredData, setFilteredData] = useState<ScorecardData[]>([]);
<<<<<<< HEAD
=======
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentScorecard, setCurrentScorecard] = useState<ScorecardData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
<<<<<<< HEAD
  const [formData, setFormData] = useState<Omit<ScorecardData, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: "",
    department: "",
    week1: "",
    week2: "",
    week3: "",
    week4: "",
    remainder: "",
    monthlyactual: "",
    monthlytarget: "",
    status: "Green",
    metricowner: "",
    metricsource: "",
    notes: ""
  });
=======
  const [formData, setFormData] = useState<Omit<ScorecardData, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'department' | 'metricowner' | 'status'>>({
    name: "",
    department_id: null,
    week1: null,
    week2: null,
    week3: null,
    week4: null,
    remainder: null,
    monthlyactual: null,
    monthlytarget: null,
    metricowner_id: null,
    metric_type: "Numeric Count",
    metricsource: "",
    notes: ""
  });
  // Track if monthlyactual was edited manually
  const monthlyActualManuallyEdited = useRef(false);

  // Auto-calculate monthlyactual from week fields unless manually edited
  useEffect(() => {
    if (!monthlyActualManuallyEdited.current) {
      const sum = [formData.week1, formData.week2, formData.week3, formData.week4, formData.remainder]
        .map((v) => v || 0)
        .reduce((a, b) => a + b, 0);
      setFormData((prev) => ({ ...prev, monthlyactual: sum }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.week1, formData.week2, formData.week3, formData.week4, formData.remainder]);

  // Additional useEffect to handle calculation when dialog opens (for editing)
  useEffect(() => {
    if (dialogOpen && !monthlyActualManuallyEdited.current) {
      const sum = [formData.week1, formData.week2, formData.week3, formData.week4, formData.remainder]
        .map((v) => v || 0)
        .reduce((a, b) => a + b, 0);
      if (formData.monthlyactual !== sum) {
        setFormData((prev) => ({ ...prev, monthlyactual: sum }));
      }
    }
  }, [dialogOpen, formData.week1, formData.week2, formData.week3, formData.week4, formData.remainder, formData.monthlyactual]);

  // When user edits monthlyactual, set the manual edit flag
  const handleMonthlyActualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    monthlyActualManuallyEdited.current = true;
    setFormData({ ...formData, monthlyactual: e.target.value ? Number(e.target.value) : null });
  };

  // If user edits any week field, reset the manual edit flag so auto-calc resumes
  const handleWeekChange = (field: keyof typeof formData, value: string) => {
    monthlyActualManuallyEdited.current = false;
    setFormData({ ...formData, [field]: value ? Number(value) : null });
  };
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  
  const supabase = createClient();

  useEffect(() => {
    fetchScorecardsData();
<<<<<<< HEAD
=======
    fetchDropdownData();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "" && activeDepartment === "all") {
      setFilteredData(scorecardsData);
    } else {
      let filtered = scorecardsData;
      
      // Filter by department if not "all"
      if (activeDepartment !== "all") {
        filtered = filtered.filter(scorecard => 
<<<<<<< HEAD
          scorecard.department === activeDepartment
=======
          scorecard.department_id === activeDepartment
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        );
      }
      
      // Filter by search term if provided
      if (searchTerm.trim() !== "") {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(scorecard => 
          scorecard.name.toLowerCase().includes(lowercasedSearch) ||
<<<<<<< HEAD
          scorecard.metricowner.toLowerCase().includes(lowercasedSearch) ||
=======
          scorecard.metricowner?.full_name.toLowerCase().includes(lowercasedSearch) ||
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          scorecard.metricsource.toLowerCase().includes(lowercasedSearch)
        );
      }
      
      setFilteredData(filtered);
    }
  }, [searchTerm, activeDepartment, scorecardsData]);

  const fetchScorecardsData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");
      
      const teamMemberIds = await getTeamMemberIds(supabase, user.id);
      
      const { data, error } = await supabase
        .from("company_scorecards")
<<<<<<< HEAD
        .select("*")
        .in("user_id", teamMemberIds)
        .order("department", { ascending: true })
        .order("name", { ascending: true });
=======
        .select(`
          *,
          department:departments(id, name),
          metricowner:business_info(id, full_name, profile_picture_url)
        `)
        .in("user_id", teamMemberIds)
        .order("created_at", { ascending: false });
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

      if (error) throw error;
      
      setScorecardsData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Error fetching scorecard data:", error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleAddNew = () => {
    setCurrentScorecard(null);
    setFormData({
      name: "",
      department: "",
      week1: "",
      week2: "",
      week3: "",
      week4: "",
      remainder: "",
      monthlyactual: "",
      monthlytarget: "",
      status: "Green",
      metricowner: "",
=======
  const fetchDropdownData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const teamMemberIds = await getTeamMemberIds(supabase, user.id);

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("departments")
        .select("id, name")
        .order("name", { ascending: true });

      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData || []);

      // Fetch team members
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from("business_info")
        .select("id, full_name, profile_picture_url")
        .in("user_id", teamMemberIds)
        .order("full_name", { ascending: true });

      if (teamMembersError) throw teamMembersError;
      setTeamMembers(teamMembersData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleAddNew = () => {
    setCurrentScorecard(null);
    // Reset the manual edit flag when adding new
    monthlyActualManuallyEdited.current = false;
    setFormData({
      name: "",
      department_id: null,
      week1: null,
      week2: null,
      week3: null,
      week4: null,
      remainder: null,
      monthlyactual: null,
      monthlytarget: null,
      metricowner_id: null,
      metric_type: "Numeric Count",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      metricsource: "",
      notes: ""
    });
    setDialogOpen(true);
  };

  const handleEdit = (scorecard: ScorecardData) => {
    setCurrentScorecard(scorecard);
<<<<<<< HEAD
    setFormData({
      name: scorecard.name,
      department: scorecard.department,
      week1: scorecard.week1 || "",
      week2: scorecard.week2 || "",
      week3: scorecard.week3 || "",
      week4: scorecard.week4 || "",
      remainder: scorecard.remainder || "",
      monthlyactual: scorecard.monthlyactual || "",
      monthlytarget: scorecard.monthlytarget || "",
      status: scorecard.status,
      metricowner: scorecard.metricowner || "",
=======
    // Reset the manual edit flag when editing
    monthlyActualManuallyEdited.current = false;
    setFormData({
      name: scorecard.name,
      department_id: scorecard.department_id,
      week1: scorecard.week1 !== null ? Number(scorecard.week1) : null,
      week2: scorecard.week2 !== null ? Number(scorecard.week2) : null,
      week3: scorecard.week3 !== null ? Number(scorecard.week3) : null,
      week4: scorecard.week4 !== null ? Number(scorecard.week4) : null,
      remainder: scorecard.remainder !== null ? Number(scorecard.remainder) : null,
      monthlyactual: scorecard.monthlyactual !== null ? Number(scorecard.monthlyactual) : null,
      monthlytarget: scorecard.monthlytarget !== null ? Number(scorecard.monthlytarget) : null,
      metricowner_id: scorecard.metricowner_id,
      metric_type: scorecard.metric_type || "Numeric Count",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      metricsource: scorecard.metricsource || "",
      notes: scorecard.notes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      
      const { error } = await supabase
        .from("company_scorecards")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      await fetchScorecardsData();
    } catch (error) {
      console.error("Error deleting scorecard:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaveScorecard = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

<<<<<<< HEAD
=======
      // Calculate status automatically
      const calculatedStatus = calculateStatus(formData.monthlyactual, formData.monthlytarget);

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      if (currentScorecard) {
        // Update existing scorecard
        const { error } = await supabase
          .from("company_scorecards")
          .update({
            name: formData.name,
<<<<<<< HEAD
            department: formData.department,
=======
            department_id: formData.department_id,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            week1: formData.week1,
            week2: formData.week2,
            week3: formData.week3,
            week4: formData.week4,
            remainder: formData.remainder,
            monthlyactual: formData.monthlyactual,
            monthlytarget: formData.monthlytarget,
<<<<<<< HEAD
            status: formData.status,
            metricowner: formData.metricowner,
=======
            status: calculatedStatus,
            metricowner_id: formData.metricowner_id,
            metric_type: formData.metric_type,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            metricsource: formData.metricsource,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentScorecard.id);
          
        if (error) throw error;
      } else {
        // Create new scorecard
        const { error } = await supabase
          .from("company_scorecards")
          .insert({
            user_id: user.id,
            name: formData.name,
<<<<<<< HEAD
            department: formData.department,
=======
            department_id: formData.department_id,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            week1: formData.week1,
            week2: formData.week2,
            week3: formData.week3,
            week4: formData.week4,
            remainder: formData.remainder,
            monthlyactual: formData.monthlyactual,
            monthlytarget: formData.monthlytarget,
<<<<<<< HEAD
            status: formData.status,
            metricowner: formData.metricowner,
=======
            status: calculatedStatus,
            metricowner_id: formData.metricowner_id,
            metric_type: formData.metric_type,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            metricsource: formData.metricsource,
            notes: formData.notes
          });
          
        if (error) throw error;
      }
      
      await fetchScorecardsData();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving scorecard:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Green":
        return "bg-green-100 text-green-800";
      case "Light Green":
        return "bg-emerald-100 text-emerald-800";
      case "Yellow":
        return "bg-yellow-100 text-yellow-800";
      case "Light Red":
        return "bg-orange-100 text-orange-800";
      case "Red":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toUpperCase()) {
      case "EVERGREEN METRICS":
        return "bg-green-100 text-green-800";
      case "NORTH STAR METRICS":
        return "bg-blue-100 text-blue-800";
      case "ACCOUNTING/FINANCE":
        return "bg-emerald-100 text-emerald-800";
      case "OPERATIONS":
        return "bg-indigo-100 text-indigo-800";
      case "SUCCESS/SUPPORT":
        return "bg-purple-100 text-purple-800";
      case "TECHNOLOGY/DEVELOPMENT":
        return "bg-cyan-100 text-cyan-800";
<<<<<<< HEAD
      case "PRODUCT/PROGRAMS":
=======
      case "PRODUCT/PROGRAMMES":
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        return "bg-amber-100 text-amber-800";
      case "SALES":
        return "bg-red-100 text-red-800";
      case "MARKETING":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = (scorecard: ScorecardData) => {
    setCurrentScorecard(scorecard);
    setViewDialogOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Company Scorecard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your company metrics and performance indicators
          </p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <Card className="overflow-hidden -md border-gray-200">
          {scorecardsData.length > 0 ? (
            <div>
              {/* Search and filter bar */}
              <div className="p-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <ExpandableInput
                    placeholder="Search by name, owner, source..."
                    className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    expandAfter={40}
                    lined={true}
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
<<<<<<< HEAD
                  <Select 
                    value={activeDepartment} 
                    onValueChange={setActiveDepartment}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
=======
                  <DepartmentFilterDropdown
                    value={activeDepartment}
                    onChange={setActiveDepartment}
                    departments={departments}
                    placeholder="All Departments"
                    className="w-full sm:w-[200px]"
                  />
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                    <Filter className="h-4 w-4 mr-1" />
                    {filteredData.length} of {scorecardsData.length} metrics
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50/50">
<<<<<<< HEAD
                      <TableHead className="w-[200px] py-3.5 text-sm font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="w-[150px] py-3.5 text-sm font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="w-[120px] py-3.5 text-sm font-semibold text-gray-700">Monthly Actual</TableHead>
                      <TableHead className="w-[120px] py-3.5 text-sm font-semibold text-gray-700">Monthly Target</TableHead>
                      <TableHead className="w-[100px] py-3.5 text-sm font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="w-[150px] py-3.5 text-sm font-semibold text-gray-700">Owner</TableHead>
                      <TableHead className="w-[150px] py-3.5 text-sm font-semibold text-gray-700 text-right">Actions</TableHead>
=======
                      <TableHead className="w-[180px] py-3.5 text-sm font-semibold text-gray-700 px-6">Name</TableHead>
                      <TableHead className="w-[120px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l">Department</TableHead>
                      <TableHead className="w-[220px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l">Weekly Breakdown</TableHead>
                      <TableHead className="w-[140px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l">Actual / Target</TableHead>
                      <TableHead className="w-[90px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l">Status</TableHead>
                      <TableHead className="w-[120px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l">Owner</TableHead>
                      <TableHead className="w-[120px] py-3.5 text-sm font-semibold text-gray-700 px-6 border-l text-right">Actions</TableHead>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((scorecard) => (
                        <TableRow 
                          key={scorecard.id} 
                          className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                        >
<<<<<<< HEAD
                          <TableCell className="font-medium text-blue-700 py-4">{scorecard.name || "—"}</TableCell>
                          <TableCell className="py-4">
                            {scorecard.department ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDepartmentColor(scorecard.department)}`}>
                                {scorecard.department}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="py-4">{scorecard.monthlyactual || "—"}</TableCell>
                          <TableCell className="py-4">{scorecard.monthlytarget || "—"}</TableCell>
                          <TableCell className="py-4">
=======
                          <TableCell className="font-medium text-blue-700 py-4 px-6">{scorecard.name || "—"}</TableCell>
                          <TableCell className="py-4 px-6 border-l">
                            {scorecard.department ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDepartmentColor(scorecard.department.name)}`}>
                                {scorecard.department.name}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="py-4 text-center px-6 border-l">
                            {formatWeeklyBreakdown(scorecard)}
                          </TableCell>
                          <TableCell className="py-4 text-center font-medium px-6 border-l">
                            {formatActualTarget(scorecard)}
                          </TableCell>
                          <TableCell className="py-4 px-6 border-l">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                            {scorecard.status ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(scorecard.status)}`}>
                                {scorecard.status}
                              </span>
                            ) : "—"}
                          </TableCell>
<<<<<<< HEAD
                          <TableCell className="py-4">{scorecard.metricowner || "—"}</TableCell>
                          <TableCell className="py-4 text-right">
=======
                          <TableCell className="py-4 px-6 border-l">
                            {scorecard.metricowner ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={scorecard.metricowner.profile_picture_url || ''} alt={scorecard.metricowner.full_name} />
                                  <AvatarFallback>{scorecard.metricowner.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{scorecard.metricowner.full_name}</span>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="py-4 text-right px-6 border-l">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(scorecard)}
                                className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(scorecard)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                title="Edit metric"
                              >
                                <Pencil className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(scorecard.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
                                disabled={deleteLoading === scorecard.id}
                                title="Delete metric"
                              >
                                {deleteLoading === scorecard.id ? (
                                  <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                          No metrics found. Try adjusting your filters or add a new metric.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-blue-50 rounded-full p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No metrics found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Get started by creating your first company metric to track performance.
              </p>
              <Button 
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Metric
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Metric Details</DialogTitle>
          </DialogHeader>
          
          {currentScorecard && (
            <div className="space-y-6 py-4">
              {/* Header with name and badges */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentScorecard.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
<<<<<<< HEAD
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDepartmentColor(currentScorecard.department)}`}>
                      {currentScorecard.department}
                    </span>
=======
                    {currentScorecard.department && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDepartmentColor(currentScorecard.department.name)}`}>
                        {currentScorecard.department.name}
                      </span>
                    )}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(currentScorecard.status)}`}>
                      {currentScorecard.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Weekly data section */}
                <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="text-md font-semibold text-gray-900">Weekly Tracking</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 1</div>
<<<<<<< HEAD
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week1 || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 2</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week2 || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 3</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week3 || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 4</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week4 || "—"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-500">Remainder</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.remainder || "—"}</div>
=======
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week1 !== null ? formatValue(currentScorecard.week1, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 2</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week2 !== null ? formatValue(currentScorecard.week2, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 3</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week3 !== null ? formatValue(currentScorecard.week3, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Week 4</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.week4 !== null ? formatValue(currentScorecard.week4, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-500">Remainder</div>
                      <div className="text-md mt-1 font-semibold">{currentScorecard.remainder !== null ? formatValue(currentScorecard.remainder, currentScorecard.metric_type) : "—"}</div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </div>
                  </div>
                </div>
                
                {/* Performance metrics section */}
                <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-md font-semibold text-gray-900">Performance</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Monthly Actual</div>
<<<<<<< HEAD
                      <div className="text-lg mt-1 font-semibold">{currentScorecard.monthlyactual || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Monthly Target</div>
                      <div className="text-lg mt-1 font-semibold">{currentScorecard.monthlytarget || "—"}</div>
                    </div>
                    
                    {/* Progress visualization - simple percentage if both values are numbers */}
                    {currentScorecard.monthlyactual && currentScorecard.monthlytarget && 
                     !isNaN(Number(currentScorecard.monthlyactual)) && !isNaN(Number(currentScorecard.monthlytarget)) && (
=======
                      <div className="text-lg mt-1 font-semibold">{currentScorecard.monthlyactual !== null ? formatValue(currentScorecard.monthlyactual, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Monthly Target</div>
                      <div className="text-lg mt-1 font-semibold">{currentScorecard.monthlytarget !== null ? formatValue(currentScorecard.monthlytarget, currentScorecard.metric_type) : "—"}</div>
                    </div>
                    
                    {/* Progress visualization - simple percentage if both values are numbers */}
                    {currentScorecard.monthlyactual !== null && currentScorecard.monthlytarget !== null && (
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-500">Progress</span>
                          <span className="text-xs font-medium text-gray-700">
                            {Math.min(100, Math.round((Number(currentScorecard.monthlyactual) / Number(currentScorecard.monthlytarget)) * 100))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.round((Number(currentScorecard.monthlyactual) / Number(currentScorecard.monthlytarget)) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Metadata section */}
                <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-md font-semibold text-gray-900">Ownership</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Metric Owner</div>
<<<<<<< HEAD
                      <div className="text-md mt-1">{currentScorecard.metricowner || "—"}</div>
=======
                      <div className="text-md mt-1">
                        {currentScorecard.metricowner ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={currentScorecard.metricowner.profile_picture_url || ''} alt={currentScorecard.metricowner.full_name} />
                              <AvatarFallback>{currentScorecard.metricowner.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <span>{currentScorecard.metricowner.full_name}</span>
                          </div>
                        ) : "—"}
                      </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Metric Source</div>
                      <div className="text-md mt-1">{currentScorecard.metricsource || "—"}</div>
                    </div>
<<<<<<< HEAD
=======
                    <div>
                      <div className="text-sm font-medium text-gray-500">Metric Type</div>
                      <div className="text-md mt-1">{currentScorecard.metric_type || "—"}</div>
                    </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </div>
                
                {/* Notes section */}
                {currentScorecard.notes && (
                  <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-md font-semibold text-gray-900">Notes</h3>
                    </div>
                    
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentScorecard.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Footer with metadata */}
              <div className="border-t pt-4 flex flex-col sm:flex-row justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>Created: {new Date(currentScorecard.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 sm:mt-0">
                  Last updated: {new Date(currentScorecard.updated_at).toLocaleDateString()}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(currentScorecard);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Metric
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentScorecard ? "Edit Metric" : "Add New Metric"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 w-full mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="col-span-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter metric name"
                  className="mt-1"
                />
              </div>

              {/* Department Field */}
              <div>
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
<<<<<<< HEAD
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Field */}
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as ScorecardData["status"] })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weekly Data Fields */}
              <div>
                <Label htmlFor="week1" className="text-sm font-medium">Week 1</Label>
                <ExpandableInput
                  id="week1"
                  value={formData.week1}
                  onChange={(e) => setFormData({ ...formData, week1: e.target.value })}
                  placeholder="Week 1 value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              <div>
                <Label htmlFor="week2" className="text-sm font-medium">Week 2</Label>
                <ExpandableInput
                  id="week2"
                  value={formData.week2}
                  onChange={(e) => setFormData({ ...formData, week2: e.target.value })}
                  placeholder="Week 2 value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              <div>
                <Label htmlFor="week3" className="text-sm font-medium">Week 3</Label>
                <ExpandableInput
                  id="week3"
                  value={formData.week3}
                  onChange={(e) => setFormData({ ...formData, week3: e.target.value })}
                  placeholder="Week 3 value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              <div>
                <Label htmlFor="week4" className="text-sm font-medium">Week 4</Label>
                <ExpandableInput
                  id="week4"
                  value={formData.week4}
                  onChange={(e) => setFormData({ ...formData, week4: e.target.value })}
                  placeholder="Week 4 value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              <div>
                <Label htmlFor="remainder" className="text-sm font-medium">Remainder</Label>
                <ExpandableInput
                  id="remainder"
                  value={formData.remainder}
                  onChange={(e) => setFormData({ ...formData, remainder: e.target.value })}
                  placeholder="Remainder value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              {/* Monthly Data Fields */}
              <div>
                <Label htmlFor="monthlyactual" className="text-sm font-medium">Monthly Actual</Label>
                <ExpandableInput
                  id="monthlyactual"
                  value={formData.monthlyactual}
                  onChange={(e) => setFormData({ ...formData, monthlyactual: e.target.value })}
                  placeholder="Monthly actual value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              <div>
                <Label htmlFor="monthlytarget" className="text-sm font-medium">Monthly Target</Label>
                <ExpandableInput
                  id="monthlytarget"
                  value={formData.monthlytarget}
                  onChange={(e) => setFormData({ ...formData, monthlytarget: e.target.value })}
                  placeholder="Monthly target value"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
=======
                <DepartmentDropdown
                  value={formData.department_id || ""}
                  onChange={(value) => setFormData({ ...formData, department_id: value === "" ? null : value })}
                  departments={departments}
                  placeholder="Select department"
                  className="w-full mt-1"
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                />
              </div>

              {/* Metric Owner Field */}
              <div>
                <Label htmlFor="metricowner" className="text-sm font-medium">Metric Owner</Label>
<<<<<<< HEAD
                <ExpandableInput
                  id="metricowner"
                  value={formData.metricowner}
                  onChange={(e) => setFormData({ ...formData, metricowner: e.target.value })}
                  placeholder="Who owns this metric"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              {/* Metric Source Field */}
              <div>
=======
                <TeamMemberDropdown
                  value={formData.metricowner_id || ""}
                  onChange={(value) => setFormData({ ...formData, metricowner_id: value === "" ? null : value })}
                  teamMembers={teamMembers}
                  placeholder="Select owner"
                  className="w-full mt-1"
                />
              </div>

              {/* Weekly Breakdown Grouped Fields in Form */}
              <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
                <div className="flex gap-2 mt-1">
                  <div className="w-1/4">
                  <label htmlFor="week1" className="text-sm font-medium">Week 1</label>
                  <Input
                    id="week1"
                    type="number"
                    value={formData.week1 || ""}
                    onChange={(e) => handleWeekChange("week1", e.target.value)}
                    placeholder={getPlaceholder(formData.metric_type, "week")}
                    
                  />
                  </div>
                  <div className="w-1/4">
                  <label htmlFor="week2" className="text-sm font-medium">Week 2</label>
                  <Input
                    id="week2"
                    type="number"
                    value={formData.week2 || ""}
                    onChange={(e) => handleWeekChange("week2", e.target.value)}
                    placeholder={getPlaceholder(formData.metric_type, "week")}
                    
                  />
                  </div>
                  <div className="w-1/4">
                  <label htmlFor="week3" className="text-sm font-medium">Week 3</label>
                  <Input
                    id="week3"
                    type="number"
                    value={formData.week3 || ""}
                    onChange={(e) => handleWeekChange("week3", e.target.value)}
                    placeholder={getPlaceholder(formData.metric_type, "week")}
                    
                  />
                  </div>
                  <div className="w-1/4">
                  <label htmlFor="week4" className="text-sm font-medium">Week 4</label>
                  <Input
                    id="week4"
                    type="number"
                    value={formData.week4 || ""}
                    onChange={(e) => handleWeekChange("week4", e.target.value)}
                    placeholder={getPlaceholder(formData.metric_type, "week")}
                    
                  />
                  </div>
                  <div className="w-1/4">
                  <label htmlFor="remainder" className="text-sm font-medium">Remainder</label>
                  <Input
                    id="remainder"
                    type="number"
                    value={formData.remainder || ""}
                    onChange={(e) => handleWeekChange("remainder", e.target.value)}
                    placeholder={getPlaceholder(formData.metric_type, "remainder")}
                    
                  />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{getFormatHint(formData.metric_type)}</p>
              </div>

                    <div className="flex flex-row gap-4 w-full justify-between col-span-2">

              {/* Metric Type Field */}
              <div className="w-full">
                <Label htmlFor="metric_type" className="text-sm font-medium">Metric Type</Label>
                <MetricTypeDropdown
                  value={formData.metric_type}
                  onChange={(value) => setFormData({ ...formData, metric_type: value as ScorecardData["metric_type"] })}
                  metricTypes={METRIC_TYPES}
                  placeholder="Select metric type"
                  className="w-full mt-1"
                  showHints={true}
                />
                <p className="text-xs text-gray-500 mt-1">{getFormatHint(formData.metric_type)}</p>
              </div>

              {/* Monthly Data Fields */}
              <div className="w-full">
                <Label htmlFor="monthlyactual" className="text-sm font-medium">Monthly Actual</Label>
                <Input
                  id="monthlyactual"
                  type="number"
                  value={formData.monthlyactual || ""}
                  onChange={handleMonthlyActualChange}
                  placeholder={getPlaceholder(formData.metric_type, "actual")}
                  className="mt-1"
                />
              </div>

              <div className="w-full">
                <Label htmlFor="monthlytarget" className="text-sm font-medium">Monthly Target</Label>
                <Input
                  id="monthlytarget"
                  type="number"
                  value={formData.monthlytarget || ""}
                  onChange={(e) => setFormData({ ...formData, monthlytarget: e.target.value ? Number(e.target.value) : null })}
                  placeholder={getPlaceholder(formData.metric_type, "target")}
                  className="mt-1"
                />
              </div>

              </div>

              {/* Status Preview */}
              {formData.monthlyactual !== null && formData.monthlytarget !== null && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Status (Auto-calculated)</Label>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(calculateStatus(formData.monthlyactual, formData.monthlytarget))}`}>
                      {calculateStatus(formData.monthlyactual, formData.monthlytarget)}
                    </span>
                    {formData.monthlytarget > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({Math.round((formData.monthlyactual / formData.monthlytarget) * 100)}% of target)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metric Source Field */}
              <div className="col-span-2">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                <Label htmlFor="metricsource" className="text-sm font-medium">Metric Source</Label>
                <ExpandableInput
                  id="metricsource"
                  value={formData.metricsource}
                  onChange={(e) => setFormData({ ...formData, metricsource: e.target.value })}
                  placeholder="Source of the metric data"
                  className="mt-1"
                  expandAfter={30}
                  lined={true}
                />
              </div>

              {/* Notes Field */}
              <div className="col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="mt-1"
                  rows={4}
                  autoExpand={true}
                  lined={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveScorecard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentScorecard ? 'Update' : 'Save'} Metric
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 