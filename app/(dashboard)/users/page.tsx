"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Mail, Phone, Building, UserPlus, Loader2, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteUser } from './actions'

interface User {
  id: string
  user_id: string
  email: string
  full_name: string
  business_name: string
  phone_number: string
  role: string
  permissions: {
    pages: string[]
  }
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadUsers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      const { data: currentUserInfo } = await supabase
        .from('business_info')
        .select('role, team_id')
        .eq('user_id', user.id)
        .single()

      if (!currentUserInfo || (currentUserInfo.role !== 'admin' && currentUserInfo.role !== 'super_admin')) {
        setError('You do not have permission to view this page.')
        setLoading(false)
        return
      }

      const { data: teamUsers, error: teamError } = await supabase
        .from('business_info')
        .select('*')
        .eq('team_id', currentUserInfo.team_id)
        .order('created_at', { ascending: false })

      if (teamError) throw teamError
      setUsers(teamUsers || [])
      setFilteredUsers(teamUsers || [])
    } catch (err: any) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadUsers()
  }, [router, supabase])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.full_name.toLowerCase().includes(lowercasedSearch) ||
            user.email.toLowerCase().includes(lowercasedSearch) ||
            user.role.toLowerCase().includes(lowercasedSearch)
        )
      )
    }
  }, [searchTerm, users])

  const handleDeleteUser = async (userToDelete: User) => {
    if (!confirm(`Are you sure you want to delete ${userToDelete.full_name}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(userToDelete.id);
    const result = await deleteUser(userToDelete.user_id)
    setIsDeleting(null);

    if (result.success) {
      toast.success('User deleted successfully.');
      // The `revalidatePath` in the server action will trigger a refetch.
      // For an immediate update, we can manually refetch the user list.
      await loadUsers();
    } else {
      toast.error(`Failed to delete user: ${result.error}`)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your team members and their account access.
          </p>
        </div>
        <Link href="/invite">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden shadow-sm border-gray-200">
         <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or role..."
                className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-md focus-visible:ring-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="h-4 w-4 mr-1" />
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200 hover:bg-gray-50/50">
                  <TableHead className="w-[250px] py-3.5 text-sm font-semibold text-gray-700">User</TableHead>
                  <TableHead className="py-3.5 text-sm font-semibold text-gray-700">Business</TableHead>
                  <TableHead className="py-3.5 text-sm font-semibold text-gray-700">Role</TableHead>
                  <TableHead className="py-3.5 text-sm font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="w-[100px] py-3.5 text-sm font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.full_name
                                ? user.full_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                : user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{user.business_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            user.role === 'admin' ? 'default' : 'secondary'
                          }
                          className={user.role === 'admin' ? 'bg-blue-600' : ''}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1 text-gray-600">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{user.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {isDeleting === user.id ? (
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                               <DropdownMenuItem className="cursor-pointer"
                                onClick={() => router.push(`/invite?edit=${user.id}`)}
                              >
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-red-50 cursor-pointer"
                                onClick={() => handleDeleteUser(user)}
                                disabled={isDeleting !== null}
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
      </Card>
    </div>
  )
} 