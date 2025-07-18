'use client'

<<<<<<< HEAD
import { useEffect } from 'react'
=======
import { useEffect, useState } from 'react'
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
<<<<<<< HEAD
import { toast } from 'sonner'
import { inviteUser } from './actions'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
=======
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { inviteUser } from './actions'
import { Loader2, Plus, Trash2, Briefcase, Users, Building, ClipboardList, BookOpen, User, Mail, Phone, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from "@/components/ui/checkbox";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }).optional(),
  full_name: z.string().min(1, { message: 'Full name is required.' }),
  phone_number: z.string().min(1, { message: 'Phone number is required.' }),
<<<<<<< HEAD
  permissions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one permission.',
  }),
=======
  job_title: z.string().optional(),
  manager_id: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
  critical_accountabilities: z.array(z.object({ value: z.string() })).optional(),
  playbook_ids: z.array(z.string()).optional(),
  permissions: z.array(z.string()),
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
})

type FormValues = z.infer<typeof formSchema>

<<<<<<< HEAD
const permissionOptions = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'chat', label: 'Chat' },
  { id: 'sop', label: 'SOP' },
  { id: 'chq-timeline', label: 'CHQ Timeline' },
  { id: 'chain-of-command', label: 'Chain of Command' },
  { id: 'triage-planner', label: 'Triage Planner' },
  { id: 'battle-plan', label: 'Business Battle Plan' },
  { id: 'growth-machine-planner', label: 'Growth Machine Planner' },
  { id: 'growth-machine', label: 'Growth Machine' },
  { id: 'fulfillment-machine-planner', label: 'Fulfillment Machine Planner' },
  { id: 'fulfillment-machine', label: 'Fulfillment Machine' },
  { id: 'innovation-machine', label: 'Create Innovations' },
  { id: 'playbook-planner', label: 'Playbook & Machine Planner' },
  { id: 'company-scorecard', label: 'Company Scorecard' },
  { id: 'meeting-rhythm-planner', label: 'Meeting Rhythm Planner' },
  { id: 'quarterly-sprint-canvas', label: 'Quarterly Sprint Canvas' },
  { id: 'hwgt-plan', label: 'HWGT Plan' },
=======
type SelectOption = {
  id: string;
  name: string;
}

const DEPARTMENTS = [
  "ACCOUNTING/FINANCE",
  "OPERATIONS",
  "SUCCESS/SUPPORT",
  "TECHNOLOGY/DEVELOPMENT",
  "PRODUCT/PROGRAMMES",
  "SALES",
  "MARKETING"
];

const permissionOptions = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'chat', label: 'Chat' },
  { id: 'sop', label: 'Battle Plan' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'company-overview', label: 'Company Overview' },
  { id: 'business-plan', label: 'Business Plan' },
  { id: 'growth-machine', label: 'Growth Machine' },
  { id: 'fulfilment-machine', label: 'Fulfilment Machine' },
  { id: 'innovation-machine', label: 'Create Innovations' },
  { id: 'playbook-planner', label: 'Playbook & Machine Planner' },
  { id: 'meeting-rhythm-planner', label: 'Meeting Rhythm Planner' },
  { id: 'quarterly-sprint-canvas', label: 'Quarterly Sprint Canvas' },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
]

export default function InviteClientContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editUserId = searchParams.get('edit')
  const supabase = createClient()
  const isEditing = !!editUserId

  const form = useForm<FormValues>({
<<<<<<< HEAD
    resolver: zodResolver(formSchema),
=======
    resolver: zodResolver(formSchema) as any,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone_number: '',
<<<<<<< HEAD
      permissions: [],
    },
  })

  useEffect(() => {
    if (isEditing) {
      const loadUserData = async () => {
        const { data: userData, error } = await supabase
          .from('business_info')
          .select('*')
=======
      job_title: '',
      manager_id: '',
      department_id: '',
      critical_accountabilities: [],
      playbook_ids: [],
      permissions: permissionOptions.map(option => option.id),
    },
  })

  const [newAccountability, setNewAccountability] = useState("");
  const [newPlaybook, setNewPlaybook] = useState("");

  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<SelectOption[]>([]);
  const [playbooks, setPlaybooks] = useState<SelectOption[]>([]);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminBusinessInfo } = await supabase
        .from('business_info')
        .select('team_id')
        .eq('user_id', user.id)
        .single();
      
      const teamId = adminBusinessInfo?.team_id || user.id;

      // Fetch Departments, Team Members, and Playbooks first
      const [departmentsRes, teamMembersRes, playbooksRes] = await Promise.all([
        supabase.from('departments').select('id, name').or(`team_id.eq.${teamId},team_id.eq.00000000-0000-0000-0000-000000000000`),
        supabase.from('business_info').select('id, full_name').eq('team_id', teamId),
        supabase.from('playbooks').select('id, playbookname').eq('user_id', user.id) // This might need to be scoped to team_id as well
      ]);
      
      if (departmentsRes.error) console.error('Error fetching departments:', departmentsRes.error);
      else setDepartments(departmentsRes.data || []);

      if (teamMembersRes.error) console.error('Error fetching team members:', teamMembersRes.error);
      else setTeamMembers(teamMembersRes.data.map(tm => ({ id: tm.id, name: tm.full_name })) || []);

      if (playbooksRes.error) console.error('Error fetching playbooks:', playbooksRes.error);
      else setPlaybooks(playbooksRes.data.map(p => ({ id: p.id, name: p.playbookname })) || []);

      // Now, if editing, fetch the specific user's data and reset the form
      if (isEditing) {
        const { data: userData, error } = await supabase
          .from('business_info')
          .select(`
            *,
            playbook_assignments(playbook_id)
          `)
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          .eq('id', editUserId)
          .maybeSingle()

        if (error || !userData) {
          toast.error('Failed to load user data.')
<<<<<<< HEAD
          router.push('/users')
=======
          router.push('/chain-of-command')
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          return
        }
        
        form.reset({
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
<<<<<<< HEAD
          permissions: userData.permissions?.pages || [],
        })
      }
      loadUserData()
    }
  }, [isEditing, editUserId, form, supabase, router])

  async function onSubmit(values: FormValues) {
    const result = await inviteUser(values, editUserId || undefined)
    if (result.success) {
      toast.success(isEditing ? 'User updated successfully' : 'User invited successfully')
      router.push('/users')
=======
          job_title: userData.job_title || '',
          manager_id: userData.manager_id,
          department_id: userData.department_id,
          critical_accountabilities: userData.critical_accountabilities || [],
          playbook_ids: userData.playbook_assignments?.map((pa: any) => pa.playbook_id) || [],
          permissions: userData.permissions?.pages || [],
        });

        setIsEditingAdmin(userData.role === 'admin');
        if (userData.role === 'admin') {
          setOriginalPermissions(userData.permissions?.pages || []);
        }
      }
    };

    loadAllData();
  }, [isEditing, editUserId, supabase, form, router]);

  const handleAddAccountability = () => {
    if (!newAccountability.trim()) return;
    const currentValues = form.getValues('critical_accountabilities') || [];
    form.setValue('critical_accountabilities', [...currentValues, { value: newAccountability.trim() }]);
    setNewAccountability("");
  };

  const handleRemoveAccountability = (index: number) => {
    const currentValues = form.getValues('critical_accountabilities') || [];
    const updated = [...currentValues];
    updated.splice(index, 1);
    form.setValue('critical_accountabilities', updated);
  };

  const handleAddPlaybook = () => {
    if (!newPlaybook.trim()) return;
    const currentValues = form.getValues('playbook_ids') || [];
    form.setValue('playbook_ids', [...currentValues, newPlaybook.trim()]);
    setNewPlaybook("");
  };

  const handleRemovePlaybook = (index: number) => {
    const currentValues = form.getValues('playbook_ids') || [];
    const updated = [...currentValues];
    updated.splice(index, 1);
    form.setValue('playbook_ids', updated);
  };

  async function onSubmit(values: FormValues) {
    let finalValues = { ...values };

    if (isEditingAdmin) {
      finalValues.permissions = originalPermissions;
    }
    
    if (!isEditing && (!finalValues.permissions || finalValues.permissions.length === 0)) {
      toast.error("Please select at least one page permission for the new user.");
      return;
    }
    
    const result = await inviteUser(finalValues, editUserId || undefined)
    if (result.success) {
      toast.success(isEditing ? 'User updated successfully' : 'User invited successfully')
      router.push('/chain-of-command')
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-gray-900">
          {isEditing ? 'Edit User' : 'Invite User'}
        </h1>
        <p className="mt-2 text-gray-500 text-lg">
          {isEditing
            ? "Update the user's details and page permissions."
            : 'Invite a new user to your team and set their permissions.'}
        </p>
      </div>
      
      <Form {...form}>
<<<<<<< HEAD
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
          <div className="bg-white rounded-xl border border-gray-100 w-1/4">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-medium text-gray-900">User Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide the basic information for the new user.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field}
                        className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        {...field}
                        readOnly={isEditing}
                        className={`border-gray-200 focus:border-gray-400 focus:ring-gray-400 ${isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(123) 456-7890" 
                        {...field}
                        className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Temporary Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
=======
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="flex flex-col lg:flex-row gap-6">
          {/* User Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full lg:w-1/2">
            <div className="p-6 border-b">
              <h2 className="text-xl font-medium">User Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide the basic and organisational information for the new user.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                          {...field}
                          className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
<<<<<<< HEAD
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 w-3/4">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-medium text-gray-900">Page Permissions</h2>
=======
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe@example.com"
                          {...field}
                          readOnly={isEditing}
                          className={`border-gray-200 focus:border-gray-400 focus:ring-gray-400 ${isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(123) 456-7890" 
                          {...field}
                          className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          Temporary Password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            {...field}
                            className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Organisational Information */}
              <Separator className="my-6" />
              <h3 className="text-lg font-medium mb-4">Organisational Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Sales Manager" 
                          {...field}
                          className="border-gray-200 focus:border-gray-400 focus:ring-gray-400" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        Manager
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                        >
                          <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                            <SelectValue placeholder="Select a manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">No Manager</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        Department
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                        >
                          <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="null">No Department</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Playbooks & Accountabilities (Full Width) */}
              <div className="mt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="playbook_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        Playbooks Owned
                      </FormLabel>
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {playbooks.map((playbook) => (
                          <FormField
                            key={playbook.id}
                            control={form.control}
                            name="playbook_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={playbook.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(playbook.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), playbook.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== playbook.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {playbook.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="critical_accountabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                        Critical Accountabilities
                      </FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-3 space-y-2">
                          {field.value && field.value.length > 0 ? (
                            <div className="space-y-2">
                              {field.value.map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                                    {item.value}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 ml-2"
                                    onClick={() => handleRemoveAccountability(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm italic">No accountabilities added yet</div>
                          )}
                          <div className="flex mt-2">
                            <Input
                              value={newAccountability}
                              onChange={(e) => setNewAccountability(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAccountability();
                                }
                              }}
                              placeholder="Add accountability..."
                              className="flex-1 border-gray-200"
                            />
                            <Button
                              type="button"
                              className="ml-2 bg-blue-600 hover:bg-blue-700"
                              onClick={handleAddAccountability}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Page Permissions Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full lg:w-1/2">
            <div className="p-6 border-b">
              <h2 className="text-xl font-medium">Page Permissions</h2>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
              <p className="mt-1 text-sm text-gray-500">
                Select which pages the user will be able to access.
              </p>
            </div>
            <div className="p-6">
<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
=======
              <fieldset disabled={isEditingAdmin} className="space-y-4 grid grid-cols-2 gap-4">
                {isEditingAdmin && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md">
                    Page permissions for admin users cannot be changed.
                  </div>
                )}
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                {permissionOptions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                          <div>
                            <FormLabel className="text-sm font-medium text-gray-800 cursor-pointer">
                              {permission.label}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission.id])
                                  : field.onChange(field.value?.filter((value) => value !== permission.id))
                              }}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                ))}
<<<<<<< HEAD
              </div>
              <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/users')}
              disabled={form.formState.isSubmitting}
              className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Update User' : 'Send Invitation'}
            </Button>
          </div>
            </div>
            
          </div>
          
       
        </form>
=======
              </fieldset>
              
            </div>
          </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/chain-of-command')}
                  disabled={form.formState.isSubmitting}
                  className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update User' : 'Send Invitation'}
                </Button>
              </div>
        </form>
        
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      </Form>
    </div>
  )
} 