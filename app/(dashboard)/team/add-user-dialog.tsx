'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, User, Mail, Phone, Lock } from 'lucide-react'
import { inviteUser } from '../invite/actions'
import UserAddedMessage from './user-added-message'

const basicUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  full_name: z.string().min(1, { message: 'Full name is required.' }),
  phone_number: z.string().min(1, { message: 'Phone number is required.' }),
})

type BasicUserFormValues = z.infer<typeof basicUserSchema>

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserAdded: () => void
  onEditUser: (userId: string) => void
}

export default function AddUserDialog({ open, onOpenChange, onUserAdded, onEditUser }: AddUserDialogProps) {
  const form = useForm<BasicUserFormValues>({
    resolver: zodResolver(basicUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone_number: '',
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [addedUserName, setAddedUserName] = useState('')
  const [addedUserId, setAddedUserId] = useState('')

  async function onSubmit(values: BasicUserFormValues) {
    setIsSubmitting(true)
    try {
      // Add default permissions for new users
      const result = await inviteUser({
        ...values,
        job_title: '',
        manager_id: null,
        department_id: null,
        critical_accountabilities: [],
        playbook_ids: [],
        permissions: ['dashboard', 'chat'], // Default basic permissions
      })

      if (result.success) {
        if (result.userId && result.userName) {
          // New user created - show success message
          setAddedUserId(result.userId)
          setAddedUserName(result.userName)
          setShowSuccessMessage(true)
          form.reset()
          onOpenChange(false)
          onUserAdded()
        } else {
          // User updated
          toast.success('User updated successfully!')
          form.reset()
          onOpenChange(false)
          onUserAdded()
        }
      } else {
        toast.error(result.error || 'Failed to add user')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Enter basic information for the new team member. You can manage permissions and other details later by editing the user.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormLabel className="text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
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
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    {showSuccessMessage && (
      <UserAddedMessage
        userName={addedUserName}
        onClose={() => setShowSuccessMessage(false)}
        onEditUser={() => {
          setShowSuccessMessage(false)
          onEditUser(addedUserId)
        }}
      />
      )}
    </>
  )
} 