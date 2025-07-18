"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Plus, Trash2, MoreHorizontal, User, Calendar, Target, Check, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamMemberIds } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Type definitions
type Owner = {
  id: string;
  full_name: string;
  profile_picture_url?: string;
};

type Department = {
  id: string;
  name: string;
};

type Playbook = {
  id: string;
  playbookname: string;
};

type KeyInitiative = {
  id: string;
  name: string;
  status: "Backlog" | "In Progress" | "On Track" | "Behind" | "Completed";
  owner_id: string | null;
  stakeholders: string[];
  due_date: string | null;
  results: string | null;
  associated_playbook_id: string | null;
  team_id: string;
  created_at: string;
  updated_at: string;
  
  // Relational data
  owner: Owner | null;
  departments: Department[];
  playbook: Playbook | null;
};

type KeyInitiativeFormData = {
  name: string;
  status: "Backlog" | "In Progress" | "On Track" | "Behind" | "Completed";
  owner_id: string | null;
  stakeholders: string[];
  due_date: string | null;
  results: string | null;
  associated_playbook_id: string | null;
  department_ids: string[];
};

type EditingCell = {
  initiativeId: string;
  field: keyof KeyInitiative;
  value: any;
};

export default function KeyInitiativesPage() {
  const [initiatives, setInitiatives] = useState<KeyInitiative[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  
  // Inline editing states
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{[key: string]: any}>({});
  
  // New initiative inline creation
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newInitiativeData, setNewInitiativeData] = useState<KeyInitiativeFormData>({
    name: "",
    status: "Backlog",
    owner_id: null,
    stakeholders: [],
    due_date: null,
    results: null,
    associated_playbook_id: null,
    department_ids: [],
  });

  const supabase = createClient();
  const newNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitiatives();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    // This effect is to manage focus on the new initiative name input
    if (isCreatingNew && newNameInputRef.current) {
      newNameInputRef.current.focus();
    }
  }, [isCreatingNew]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const teamMemberIds = await getTeamMemberIds(supabase, user.id);
      
      // Get current user's team_id
      const { data: userInfo } = await supabase
        .from("business_info")
        .select("team_id")
        .eq("user_id", user.id)
        .single();
      
      if (userInfo) {
        setTeamId(userInfo.team_id);
      }

      // Fetch key initiatives with related data
      const { data: initiativesData, error } = await supabase
        .from("key_initiatives")
        .select(`
          *,
          owner:business_info(id, full_name, profile_picture_url),
          playbook:playbooks(id, playbookname),
          key_initiative_departments(
            departments(id, name)
          )
        `)
        .eq("team_id", userInfo?.team_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedInitiatives = initiativesData?.map(initiative => ({
        ...initiative,
        departments: initiative.key_initiative_departments?.map((kid: any) => kid.departments) || [],
        key_initiative_departments: undefined, // Remove this from the final object
      })) || [];

      setInitiatives(processedInitiatives);
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      toast.error("Failed to fetch initiatives");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const teamMemberIds = await getTeamMemberIds(supabase, user.id);

      // Fetch team members (owners)
      const { data: ownersData, error: ownersError } = await supabase
        .from("business_info")
        .select("id, full_name, profile_picture_url")
        .in("user_id", teamMemberIds);

      if (ownersError) throw ownersError;
      setOwners(ownersData || []);

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("departments")
        .select("id, name");

      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData || []);

      // Fetch playbooks
      const { data: playbooksData, error: playbooksError } = await supabase
        .from("playbooks")
        .select("id, playbookname")
        .in("user_id", teamMemberIds);

      if (playbooksError) throw playbooksError;
      setPlaybooks(playbooksData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleAddNew = () => {
    setIsCreatingNew(true);
    setNewInitiativeData({
      name: "",
      status: "Backlog",
      owner_id: null,
      stakeholders: [],
      due_date: null,
      results: null,
      associated_playbook_id: null,
      department_ids: [],
    });
  };

  const cancelNewInitiative = () => {
    setIsCreatingNew(false);
  };

  const saveNewInitiative = async () => {
    try {
      if (!newInitiativeData.name.trim()) {
        toast.error("Initiative name is required");
        return;
      }

      if (!teamId) {
        toast.error("Team ID not found");
        return;
      }

      setSavingCell("new-initiative");

      const initiativeData = {
        ...newInitiativeData,
        team_id: teamId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      delete (initiativeData as any).department_ids;

      const { data: newInitiative, error } = await supabase
        .from("key_initiatives")
        .insert(initiativeData)
        .select("id")
        .single();

      if (error) throw error;

      await handleDepartmentAssociations(newInitiative.id, newInitiativeData.department_ids);

      toast.success("Initiative created successfully");
      setIsCreatingNew(false);
      await fetchInitiatives();
    } catch (error) {
      console.error("Error saving initiative:", error);
      toast.error("Failed to save initiative");
    } finally {
      setSavingCell(null);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this initiative? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleteLoading(id);
      
      const { error } = await supabase
        .from("key_initiatives")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Initiative deleted successfully");
      await fetchInitiatives();
    } catch (error) {
      console.error("Error deleting initiative:", error);
      toast.error("Failed to delete initiative");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDepartmentAssociations = async (initiativeId: string, departmentIds: string[]) => {
    // First, remove existing associations
    const { error: deleteError } = await supabase
      .from("key_initiative_departments")
      .delete()
      .eq("key_initiative_id", initiativeId);

    if (deleteError) throw deleteError;

    // Add new associations
    if (departmentIds.length > 0) {
      const associations = departmentIds.map(departmentId => ({
        key_initiative_id: initiativeId,
        department_id: departmentId,
      }));

      const { error: insertError } = await supabase
        .from("key_initiative_departments")
        .insert(associations);

      if (insertError) throw insertError;
    }
  };

  // Inline editing functions
  const startEditing = (initiativeId: string, field: keyof KeyInitiative, currentValue: any) => {
    setEditingCell({ initiativeId, field, value: currentValue });
    setTempValues(prev => ({ 
      ...prev,
      [`${initiativeId}-${field}`]: currentValue || ""
    }));
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  const saveInlineEdit = async (initiativeId: string, field: keyof KeyInitiative, newValue: any) => {
    try {
      setSavingCell(`${initiativeId}-${field}`);
      
      const updateData: any = {
        [field]: newValue,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("key_initiatives")
        .update(updateData)
        .eq("id", initiativeId);

      if (error) throw error;

      // Update local state
      setInitiatives(prev => prev.map(initiative => 
        initiative.id === initiativeId 
          ? { ...initiative, [field]: newValue }
          : initiative
      ));

      cancelEditing();
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Error updating initiative:", error);
      toast.error("Failed to update");
    } finally {
      setSavingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, initiativeId: string, field: keyof KeyInitiative) => {
    if (e.key === 'Enter') {
      const tempKey = `${initiativeId}-${field}`;
      const currentValue = initiatives.find(i => i.id === initiativeId)?.[field] as string;
      const newValue = tempValues[tempKey] !== undefined ? tempValues[tempKey] : currentValue || "";
      saveInlineEdit(initiativeId, field, newValue);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleStakeholdersUpdate = async (initiativeId: string, stakeholdersString: string) => {
    const stakeholdersArray = stakeholdersString
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    await saveInlineEdit(initiativeId, 'stakeholders', stakeholdersArray);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Backlog": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "On Track": return "bg-green-100 text-green-800";
      case "Behind": return "bg-red-100 text-red-800";
      case "Completed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (departmentName: string) => {
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", 
      "bg-red-600", "bg-yellow-600", "bg-indigo-600", "bg-pink-600"
    ];
    
    const hash = departmentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${colors[hash % colors.length]} text-white`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  // Inline editing components
  const EditableCell = ({ initiative, field, children }: { 
    initiative: KeyInitiative; 
    field: keyof KeyInitiative; 
    children: React.ReactNode;
  }) => {
    const isEditing = editingCell?.initiativeId === initiative.id && editingCell?.field === field;
    const isSaving = savingCell === `${initiative.id}-${field}`;
    const currentValue = initiative[field] as string;
    const tempKey = `${initiative.id}-${field}`;

    if (isEditing) {
        if (field === 'name' || field === 'stakeholders' || field === 'results') {
            const isTextArea = field === 'results';
            const InputComponent = isTextArea ? Textarea : Input;
            return (
                <div className="flex items-center gap-2">
                    <InputComponent
                        value={tempValues[tempKey] !== undefined ? tempValues[tempKey] : (field === 'stakeholders' ? (currentValue as unknown as any[]).join(', ') : currentValue || "")}
                        onChange={(e: any) => setTempValues(prev => ({...prev, [tempKey]: e.target.value}))}
                        onKeyDown={(e: any) => {
                            if (e.key === 'Enter' && !isTextArea) {
                                handleKeyDown(e, initiative.id, field);
                            } else if (e.key === 'Escape') {
                                cancelEditing();
                            }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            if (editingCell?.initiativeId === initiative.id && editingCell?.field === field) {
                              let finalValue: any = tempValues[tempKey];
                              if (field === 'stakeholders') {
                                finalValue = tempValues[tempKey].split(',').map((s:string) => s.trim()).filter(Boolean);
                              }
                              saveInlineEdit(initiative.id, field, finalValue);
                            }
                          }, 150);
                        }}
                        className={isTextArea ? "min-h-20 text-sm" : "h-8 text-sm"}
                        placeholder={`Enter ${field}...`}
                        autoFocus
                    />
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
            );
        }
        return <>{children}</>;
    }

    return (
      <div 
        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-8 w-full h-full"
        onClick={() => startEditing(initiative.id, field, currentValue)}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Key Initiatives</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your organisation's strategic initiatives and their progress. Click on any cell to edit.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreatingNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Initiative
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : (
        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/50">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Status</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Owner</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Stakeholders</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Due Date</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Team(s)</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Results</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Playbook</TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {initiatives.map((initiative) => (
                  <TableRow key={initiative.id} className="border-b border-gray-100 hover:bg-gray-50/30">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      <EditableCell initiative={initiative} field="name">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-gray-400" />
                          <span>{initiative.name}</span>
                        </div>
                      </EditableCell>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                        <Popover onOpenChange={(open) => !open && cancelEditing()}>
                            <PopoverTrigger asChild>
                                <div className="cursor-pointer">
                                  <Badge className={`${getStatusColor(initiative.status)} hover:opacity-80`}>
                                    {initiative.status}
                                  </Badge>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                              <div className="space-y-1">
                                {["Backlog", "In Progress", "On Track", "Behind", "Completed"].map((status) => (
                                  <div key={status} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => saveInlineEdit(initiative.id, 'status', status)}>
                                    <Badge className={getStatusColor(status)}>{status}</Badge>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                      <Popover onOpenChange={(open) => !open && cancelEditing()}>
                        <PopoverTrigger asChild>
                           <div className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center gap-2">
                            {initiative.owner ? (
                              <>
                                <Avatar className="h-7 w-7"><AvatarImage src={initiative.owner.profile_picture_url || ''} /><AvatarFallback>{initiative.owner.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback></Avatar>
                                <span className="text-blue-600">{initiative.owner.full_name}</span>
                              </>
                            ) : ( <span className="text-gray-400">Assign owner</span> )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                           <div className="space-y-1">
                              <div className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => {saveInlineEdit(initiative.id, 'owner_id', null); fetchInitiatives();}}>No Owner</div>
                              {owners.map((owner) => (
                                <div key={owner.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm flex items-center gap-2" onClick={() => {saveInlineEdit(initiative.id, 'owner_id', owner.id); fetchInitiatives();}}>
                                  <Avatar className="h-6 w-6"><AvatarImage src={owner.profile_picture_url || ''} /><AvatarFallback>{owner.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback></Avatar>
                                  <span>{owner.full_name}</span>
                                </div>
                              ))}
                           </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-600 border-l">
                      <EditableCell initiative={initiative} field="stakeholders">
                        {initiative.stakeholders?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {initiative.stakeholders.map((stakeholder, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{stakeholder}</Badge>
                            ))}
                          </div>
                        ) : ( <span className="text-gray-400">Add stakeholders</span> )}
                      </EditableCell>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-l">
                      <Popover onOpenChange={(open) => !open && cancelEditing()}>
                        <PopoverTrigger asChild>
                           <div className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-8 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(initiative.due_date)}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Input type="date"
                            defaultValue={initiative.due_date?.split('T')[0]}
                            onBlur={(e) => saveInlineEdit(initiative.id, 'due_date', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm border-l">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-8">
                            {initiative.departments?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {initiative.departments.map((department) => (
                                  <Badge key={department.id} className={getDepartmentColor(department.name)}>{department.name}</Badge>
                                ))}
                              </div>
                            ) : (<span className="text-gray-400">Assign teams</span>)}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3">
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Select Teams</div>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {departments.map((department) => (
                                <div key={department.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`dept-edit-${initiative.id}-${department.id}`}
                                    checked={initiative.departments?.some(d => d.id === department.id)}
                                    onCheckedChange={async (checked) => {
                                      const currentDeptIds = initiative.departments?.map(d => d.id) || [];
                                      const newDeptIds = checked
                                        ? [...currentDeptIds, department.id]
                                        : currentDeptIds.filter(id => id !== department.id);
                                      await handleDepartmentAssociations(initiative.id, newDeptIds);
                                      fetchInitiatives();
                                    }}
                                  />
                                  <Label htmlFor={`dept-edit-${initiative.id}-${department.id}`} className="text-sm font-normal leading-none cursor-pointer flex-1">{department.name}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-600 border-l max-w-xs">
                      <EditableCell initiative={initiative} field="results">
                        {initiative.results ? (
                          <div className="truncate" title={initiative.results}>{initiative.results}</div>
                        ) : (<span className="text-gray-400">Add results</span>)}
                      </EditableCell>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                       <Popover onOpenChange={(open) => !open && cancelEditing()}>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center gap-2">
                            {initiative.playbook ? (
                              <span className="text-blue-600 truncate max-w-[150px]">{initiative.playbook.playbookname}</span>
                            ) : ( <span className="text-gray-400">Assign playbook</span> )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                           <div className="space-y-1 max-h-48 overflow-y-auto">
                              <div className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => saveInlineEdit(initiative.id, 'associated_playbook_id', null)}>No Playbook</div>
                              {playbooks.map((playbook) => (
                                <div key={playbook.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => saveInlineEdit(initiative.id, 'associated_playbook_id', playbook.id)}>
                                  {playbook.playbookname}
                                </div>
                              ))}
                           </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right border-l">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(initiative.id)}
                            className="text-red-600 focus:text-red-600"
                            disabled={deleteLoading === initiative.id}
                          >
                            {deleteLoading === initiative.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* New Initiative Row */}
                {isCreatingNew && (
                  <TableRow key="new-initiative-row" className="border-b border-gray-100 bg-blue-50/30">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-gray-400" />
                        <Input
                          ref={newNameInputRef}
                          value={newInitiativeData.name}
                          onChange={(e) => setNewInitiativeData(d => ({ ...d, name: e.target.value }))}
                          placeholder="Enter initiative name..."
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNewInitiative();
                            if (e.key === 'Escape') cancelNewInitiative();
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer">
                            <Badge className={getStatusColor(newInitiativeData.status)}>
                              {newInitiativeData.status}
                            </Badge>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                          <div className="space-y-1">
                            {["Backlog", "In Progress", "On Track", "Behind", "Completed"].map((status) => (
                              <div
                                key={status}
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm"
                                onClick={() => setNewInitiativeData(d => ({ ...d, status: status as any }))}
                              >
                                <Badge className={getStatusColor(status)}>
                                  {status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                      <Popover>
                        <PopoverTrigger asChild>
                           <div className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center gap-2 min-h-8">
                            {newInitiativeData.owner_id ? (
                              <>
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={owners.find(o => o.id === newInitiativeData.owner_id)?.profile_picture_url || ''} />
                                  <AvatarFallback>{owners.find(o => o.id === newInitiativeData.owner_id)?.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                                </Avatar>
                                <span className="text-blue-600">{owners.find(o => o.id === newInitiativeData.owner_id)?.full_name}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Assign owner</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="space-y-1">
                             <div className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => setNewInitiativeData(d => ({...d, owner_id: null}))}>No Owner</div>
                            {owners.map((owner) => (
                              <div key={owner.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm flex items-center gap-2" onClick={() => setNewInitiativeData(d => ({ ...d, owner_id: owner.id }))}>
                                <Avatar className="h-6 w-6"><AvatarImage src={owner.profile_picture_url || ''} /><AvatarFallback>{owner.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback></Avatar>
                                <span>{owner.full_name}</span>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-600 border-l">
                       <Input
                          value={newInitiativeData.stakeholders.join(", ")}
                          onChange={(e) => setNewInitiativeData(d => ({ ...d, stakeholders: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                          placeholder="Stakeholders..."
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNewInitiative();
                            if (e.key === 'Escape') cancelNewInitiative();
                          }}
                        />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-l">
                      <Input
                        type="date"
                        value={newInitiativeData.due_date || ""}
                        onChange={(e) => setNewInitiativeData(d => ({...d, due_date: e.target.value || null}))}
                        className="h-8 text-sm w-40"
                         onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNewInitiative();
                            if (e.key === 'Escape') cancelNewInitiative();
                          }}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm border-l">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-8">
                            {newInitiativeData.department_ids.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {newInitiativeData.department_ids.map(id => departments.find(d => d.id === id)).filter(Boolean).map((dept: any) => (
                                  <Badge key={dept.id} className={getDepartmentColor(dept.name)}>{dept.name}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Assign teams</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3">
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Select Teams</div>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {departments.map((department) => (
                                <div key={department.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`dept-new-${department.id}`}
                                    checked={newInitiativeData.department_ids.includes(department.id)}
                                    onCheckedChange={(checked) => {
                                      const newDeptIds = checked
                                        ? [...newInitiativeData.department_ids, department.id]
                                        : newInitiativeData.department_ids.filter(id => id !== department.id);
                                      setNewInitiativeData(d => ({ ...d, department_ids: newDeptIds }));
                                    }}
                                  />
                                  <Label htmlFor={`dept-new-${department.id}`} className="text-sm font-normal leading-none cursor-pointer flex-1">{department.name}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-600 border-l max-w-xs">
                      <Textarea
                        value={newInitiativeData.results || ""}
                        onChange={e => setNewInitiativeData(d => ({ ...d, results: e.target.value }))}
                        placeholder="Enter results..."
                        className="min-h-20 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) saveNewInitiative();
                          if (e.key === 'Escape') cancelNewInitiative();
                        }}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center gap-2 min-h-8">
                            {newInitiativeData.associated_playbook_id ? (
                               <span className="text-blue-600 truncate max-w-[150px]">{playbooks.find(p => p.id === newInitiativeData.associated_playbook_id)?.playbookname}</span>
                            ) : (
                              <span className="text-gray-400">Assign playbook</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                           <div className="space-y-1 max-h-48 overflow-y-auto">
                              <div className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => setNewInitiativeData(d => ({ ...d, associated_playbook_id: null}))}>No Playbook</div>
                              {playbooks.map((playbook) => (
                                <div key={playbook.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm" onClick={() => setNewInitiativeData(d => ({ ...d, associated_playbook_id: playbook.id}))}>
                                  {playbook.playbookname}
                                </div>
                              ))}
                           </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right border-l">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveNewInitiative}
                          disabled={!newInitiativeData.name.trim() || savingCell === "new-initiative"}
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          {savingCell === "new-initiative" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelNewInitiative}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                        >
                           <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

    </div>
  );
}
