'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, Edit, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UserAddedMessageProps {
  userName: string
  onClose: () => void
  onEditUser: () => void
}

export default function UserAddedMessage({ userName, onClose, onEditUser }: UserAddedMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 5000) // Auto hide after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 border-green-200 bg-green-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">
                User Added Successfully!
              </h4>
              <p className="text-sm text-green-700 mb-3">
                {userName} has been added to your team with basic permissions.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onEditUser}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Manage Permissions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onClose, 300)
                  }}
                  className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 