"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Users, MoreHorizontal, Trash2, Pencil, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamMemberIds } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteTeamMember } from "./actions";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AddUserDialog from './add-user-dialog';

// --- New Type Definitions for Relational Data ---

type Department = {
  id: string;
  name: string;
} | null;

type Playbook = {
  id: string;
  playbookname: string;
} | null;

type PlaybookAssignment = {
  assignment_type: 'Owner' | 'Related';
  playbooks: Playbook;
};

type TeamMember = {
  id: string;
  full_name: string;
  job_title: string;
  critical_accountabilities: { value: string }[];
  team_id: string;
  role: string;
  user_id: string;
  profile_picture_url?: string; // <-- add this
  
  // Relational fields
  manager_id: string | null;
  department_id: string | null;
  
  // Processed, nested data
  department: Department;
  manager: TeamMember | null;
  direct_reports: TeamMember[];
  playbooks_owned: Playbook[];
  playbooks_related: Playbook[];
};

export default function ChainOfCommandPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchTeamDirectoryData();
  }, []);

  const fetchTeamDirectoryData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      setLoggedInUserId(user.id);

      const teamMemberIds = await getTeamMemberIds(supabase, user.id);

      // Fetch all business_info records for the team, with related departments and playbook assignments
      const { data: usersData, error } = await supabase
        .from("business_info")
        .select(`
          id,
          full_name,
          job_title,
          critical_accountabilities,
          team_id,
          role,
          user_id,
          profile_picture_url,
          manager_id,
          department_id,
          department:departments(id, name),
          playbook_assignments(
            assignment_type,
            playbooks(id, playbookname)
          )
        `)
        .in("user_id", teamMemberIds);

      if (error) throw error;
      if (!usersData) return;
      
      // Process the fetched data to build the hierarchy
      const usersMap = new Map<string, TeamMember>();
      
      // Initialize each user in the map
      usersData.forEach((u: any) => {
        usersMap.set(u.id, {
          ...u,
          manager: null,
          direct_reports: [],
          playbooks_owned: u.playbook_assignments
            .filter((pa: any) => pa.assignment_type === 'Owner' && pa.playbooks)
            .map((pa: any) => pa.playbooks),
          playbooks_related: u.playbook_assignments
            .filter((pa: any) => pa.assignment_type === 'Related' && pa.playbooks)
            .map((pa: any) => pa.playbooks),
        });
      });

      // Link managers and direct reports
      usersMap.forEach(member => {
        if (member.manager_id) {
          const manager = usersMap.get(member.manager_id);
          if (manager) {
            member.manager = manager;
            manager.direct_reports.push(member);
          }
        }
      });

      setTeamMembers(Array.from(usersMap.values()));

    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (departmentName: string | undefined) => {
    if (!departmentName) return "bg-gray-200 text-gray-800";
  
    const colors = [
      "bg-blue-600", "bg-green-600", "bg-purple-600", 
      "bg-red-600", "bg-yellow-600", "bg-indigo-600", "bg-pink-600"
    ];
    
    // Simple hash function to get a consistent color for a department name
    const hash = departmentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to delete ${member.full_name}? This action cannot be undone.`)) {
      return;
    }
    
    const result = await deleteTeamMember(member.id);

    if (result.success) {
      toast.success("Team member deleted successfully.");
      fetchTeamDirectoryData(); // Refresh the data
    } else {
      toast.error(`Failed to delete team member: ${result.error}`);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            An overview of your organisation's structure, roles, and responsibilities.
          </p>
        </div>
        <Button 
          onClick={() => setAddUserDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
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
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Job Title</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Team</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%] border-l">CABs</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Playbooks Owned</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Direct Reports</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Manager</TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-l">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody className="bg-white">
                  {teamMembers.map((member) => (
                    <TableRow key={member.id} className="border-b border-gray-100 hover:bg-gray-50/30">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profile_picture_url || ''} alt={member.full_name} />
                            <AvatarFallback>{member.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                          </Avatar>
                          <span>{member.full_name}</span>
                        </div>
                      </TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-l">{member.job_title || '—'}</TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                        {member.department?.name && <Badge className={`${getDepartmentColor(member.department.name)} hover:bg-opacity-80 text-white`}>{member.department.name}</Badge>}
                       </TableCell>
                       <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-600 border-l">
                         <ul className="list-disc list-inside space-y-1">
                          {member.critical_accountabilities?.map((cab, i) => (
                            <li key={i}>{cab.value}</li>
                          ))}
                         </ul>
                      </TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                         <div className="flex flex-col gap-1.5">
                          {member.playbooks_owned?.map((p) => (
                            <Link href={`/playbook-planner?playbook=${p?.id}`} key={p?.id} className="text-blue-600 hover:underline flex items-center gap-2 group">
                              <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                              <span className="truncate max-w-[150px]">{p?.playbookname}</span>
                            </Link>
                          ))}
                         </div>
                      </TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                         <div className="flex flex-col gap-1.5">
                          {member.direct_reports?.map((dr) => (
                            <Link href={`#${dr.id}`} key={dr.id} className="text-blue-600 hover:underline flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={dr.profile_picture_url || ''} alt={dr.full_name} />
                                <AvatarFallback>{dr.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                              </Avatar>
                              {dr.full_name}
                            </Link>
                            ))}
                          </div>
                       </TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm border-l">
                        {member.manager && (
                          <Link href={`#${member.manager.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={member.manager.profile_picture_url || ''} alt={member.manager.full_name} />
                              <AvatarFallback>{member.manager.full_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            {member.manager.full_name}
                          </Link>
                        )}
                      </TableCell>
                       <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right border-l">

                        <div className="flex items-center gap-2 justify-center"> 
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800">
                              <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/invite?edit=${member.id}`} className="flex items-center cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                              onClick={() => handleDelete(member)} 
                              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                              disabled={member.role === 'admin' || member.user_id === loggedInUserId}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
      </Card>
      )}
      
      <AddUserDialog 
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onUserAdded={fetchTeamDirectoryData}
        onEditUser={(userId) => {
          window.location.href = `/invite?edit=${userId}`
        }}
      />
    </div>
  );
} 