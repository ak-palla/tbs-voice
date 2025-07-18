"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  ChevronDown,
  RefreshCw,
  Unplug,
  Link,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ConnectionPopupProps {
  isConnected: boolean;
  connectedProperty?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onChangeProperty: () => void;
  onRefresh: () => void;
  dataSource?: string;
}

export default function ConnectionPopup({ 
  isConnected, 
  connectedProperty, 
  onConnect, 
  onDisconnect, 
  onChangeProperty, 
  onRefresh,
  dataSource 
}: ConnectionPopupProps) {
  const [showConnectConfirm, setShowConnectConfirm] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleConnectClick = () => {
    if (dataSource === 'superadmin') {
      setShowConnectConfirm(true);
    } else {
      onConnect();
    }
  };

  const handleDisconnectClick = () => {
    if (dataSource === 'user') {
      setShowDisconnectConfirm(true);
    } else {
      onDisconnect();
    }
  };

  const confirmConnect = () => {
    setShowConnectConfirm(false);
    onConnect();
  };

  const confirmDisconnect = () => {
    setShowDisconnectConfirm(false);
    onDisconnect();
  };

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {isConnected ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              Connected
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Connect
            </>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          {isConnected ? (
            <>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Google Analytics Connected</h4>
                {dataSource === 'superadmin' && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    You are using an admin-provided Google Analytics account. You can override this by connecting your own account if needed.
                  </div>
                )}
                {connectedProperty && (
                  <p className="text-xs text-gray-600">
                    Property: {connectedProperty}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={onRefresh}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </Button>
                
                {dataSource === 'superadmin' ? (
                  <Button
                    onClick={handleConnectClick}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <Link className="h-4 w-4" />
                    Use My Own Account
                  </Button>
                ) : (
                  <Button
                    onClick={onChangeProperty}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Change Property
                  </Button>
                )}
                
                {dataSource === 'user' && (
                  <Button
                    onClick={handleDisconnectClick}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Unplug className="h-4 w-4" />
                    Disconnect
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Connect Google Analytics</h4>
                <p className="text-xs text-gray-600 mb-4">
                  Connect your Google Analytics account to view your website data.
                </p>
              </div>
              
              <Button
                onClick={handleConnectClick}
                className="w-full gap-2"
                size="sm"
              >
                <Link className="h-4 w-4" />
                Connect Account
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>

    {/* Connect Confirmation Dialog */}
    <AlertDialog open={showConnectConfirm} onOpenChange={setShowConnectConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Connect Your Own Account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are currently using an admin-provided Google Analytics account. If you connect your own account, you will:
          </AlertDialogDescription>
          <div className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Switch from admin-provided analytics to your own</li>
              <li>Need to select your own Google Analytics property</li>
              <li>Only see data from your own account</li>
              <li>Be able to disconnect anytime to return to admin-provided access</li>
            </ul>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmConnect}>
            Connect My Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Disconnect Confirmation Dialog */}
    <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Disconnect Your Account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            If you disconnect your Google Analytics account:
          </AlertDialogDescription>
          <div className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>You will lose access to your personal analytics data</li>
              <li>If you have admin-provided access, you'll automatically switch back to that</li>
              <li>If no admin access is available, you'll need to reconnect to view analytics</li>
              <li>You can reconnect your account anytime</li>
            </ul>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDisconnect} className="bg-red-600 hover:bg-red-700">
            Disconnect Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
} 