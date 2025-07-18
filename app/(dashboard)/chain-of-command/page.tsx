"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2, Eye, Search, Filter, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTeamMemberIds } from "@/utils/supabase/teams";
import { Card } from "@/components/ui/card";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ChainOfCommandForm from "./components/chain-of-command-form";
import TeamMemberDetails from "./components/team-member-details";

type ChainOfCommandData = {
  id: string;
  user_id: string;
  name: string;
  manager: string;
  jobtitle: string;
  criticalaccountabilities: { value: string }[];
  playbooksowned: { value: string }[];
  department: string;
  created_at: string;
  updated_at: string;
};

export default function ChainOfCommandPage() {
  const [commandsData, setCommandsData] = useState<ChainOfCommandData[]>([]);
  const [filteredData, setFilteredData] = useState<ChainOfCommandData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "add" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<ChainOfCommandData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCommandsData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(commandsData);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredData(
        commandsData.filter((cmd) => 
          cmd.name.toLowerCase().includes(lowercasedSearch) ||
          cmd.jobtitle.toLowerCase().includes(lowercasedSearch) ||
          cmd.department.toLowerCase().includes(lowercasedSearch) ||
          cmd.manager.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, commandsData]);

  const fetchCommandsData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamMemberIds = await getTeamMemberIds(supabase, user.id);
      
      const { data, error } = await supabase
        .from("chain_of_command")
        .select("*")
        .in("user_id", teamMemberIds)
        .order("name", { ascending: true });

      if (error) throw error;
      
      setCommandsData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Error fetching chain of command data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (command: ChainOfCommandData) => {
    setCurrentCommand(command);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentCommand(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleEdit = (command: ChainOfCommandData) => {
    setCurrentCommand(command);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      
      const { error } = await supabase
        .from("chain_of_command")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      await fetchCommandsData();
    } catch (error) {
      console.error("Error deleting chain of command:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMode(null);
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case "add":
        return "Add New Team Member";
      case "edit":
        return "Edit Team Member";
      case "view":
        return "Team Member Details";
      default:
        return "";
    }
  };

  // Function to get a department badge color
  const getDepartmentColor = (department: string) => {
    switch (department.toUpperCase()) {
      case "ACCOUNTING/FINANCE":
        return "bg-emerald-100 text-emerald-800";
      case "OPERATIONS":
        return "bg-blue-100 text-blue-800";
      case "SUCCESS/SUPPORT":
        return "bg-purple-100 text-purple-800";
      case "TECHNOLOGY/DEVELOPMENT":
        return "bg-indigo-100 text-indigo-800";
      case "PRODUCT/PROGRAMS":
        return "bg-amber-100 text-amber-800";
      case "SALES":
        return "bg-red-100 text-red-800";
      case "MARKETING":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Chain of Command</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organizational structure and responsibilities
          </p>
        </div>
        <Button 
          onClick={handleAddNew}
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
        <Card className="overflow-hidden -md border-gray-200">
          {commandsData.length > 0 ? (
            <div>
              {/* Search and filter bar */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <ExpandableInput
                    placeholder="Search by name, title, department..."
                    className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    expandAfter={40}
                    lined={true}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Filter className="h-4 w-4 mr-1" />
                  {filteredData.length} of {commandsData.length} members
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50/50">
                      <TableHead className="w-[200px] py-3.5 text-sm font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="w-[200px] py-3.5 text-sm font-semibold text-gray-700">Job Title</TableHead>
                      <TableHead className="w-[150px] py-3.5 text-sm font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="w-[200px] py-3.5 text-sm font-semibold text-gray-700">Manager</TableHead>
                      <TableHead className="w-[180px] py-3.5 text-sm font-semibold text-gray-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((command) => (
                        <TableRow 
                          key={command.id} 
                          className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          onClick={() => handleView(command)}
                        >
                          <TableCell className="font-medium text-blue-700 py-4">{command.name || "—"}</TableCell>
                          <TableCell className="py-4">{command.jobtitle || "—"}</TableCell>
                          <TableCell className="py-4">
                            {command.department ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDepartmentColor(command.department)}`}>
                                {command.department}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="py-4">{command.manager || "—"}</TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(command);
                                }}
                                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(command);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(command.id);
                                }}
                                disabled={deleteLoading === command.id}
                                className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
                                title="Delete"
                              >
                                {deleteLoading === command.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
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
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No team members match your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50">
              <div className="bg-white rounded-full p-3 mb-4">
                <Users className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-500 mb-6 max-w-md text-center">
                Add team members to your organization's chain of command to manage roles and responsibilities efficiently.
              </p>
              <Button 
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Team Member
              </Button>
            </div>
          )}
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {dialogMode === "view" && currentCommand ? (
            <TeamMemberDetails data={currentCommand} />
          ) : (dialogMode === "edit" || dialogMode === "add") ? (
            <ChainOfCommandForm 
              data={currentCommand} 
              onUpdate={() => {
                fetchCommandsData();
                closeDialog();
              }} 
              commandId={currentCommand?.id}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
} 