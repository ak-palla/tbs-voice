"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import {
  Building,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Globe,
  Settings,
  Search,
  X,
} from 'lucide-react';

interface Account {
  name: string;
  displayName: string;
  createTime: string;
  regionCode: string;
}

interface Property {
  name: string;
  displayName: string;
  createTime: string;
  timeZone: string;
  currencyCode: string;
}

interface AccountPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertySelected: () => void;
}

export default function AccountPropertyModal({ isOpen, onClose, onPropertySelected }: AccountPropertyModalProps) {
  const [rawData, setRawData] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [step, setStep] = useState<'account' | 'property'>('account');

  const supabase = createClient();

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics-raw');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      setRawData(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async (accountName: string) => {
    try {
      setLoadingProperties(true);
      const response = await fetch(`/api/analytics-properties?account=${encodeURIComponent(accountName)}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Properties API Error:', data);
        alert(`Error fetching properties: ${data.error}`);
        setProperties([]);
        return;
      }
      
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const selectAccount = async (account: Account) => {
    setSelectedAccount(account);
    setSelectedProperty(null);
    setProperties([]);
    setStep('property');
    await fetchProperties(account.name);
  };

  const selectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const saveSelection = async () => {
    if (!selectedAccount || !selectedProperty) return;
    
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Extract property ID from the property name
      const propertyId = selectedProperty.name.split('/').pop();

      const { error } = await supabase
        .from('google_analytics_tokens')
        .update({
          property_id: propertyId,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving selection:', error);
        return;
      }

      onPropertySelected();
      onClose();
    } catch (error) {
      console.error('Error saving selection:', error);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (step === 'property') {
      setStep('account');
      setSelectedProperty(null);
      setProperties([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccountsData();
      setStep('account');
      setSelectedAccount(null);
      setSelectedProperty(null);
      setAccountSearch('');
      setPropertySearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const accounts = rawData?.rawData?.accounts?.accounts || [];
  
  // Filter accounts based on search
  const filteredAccounts = accounts.filter((account: Account) =>
    account.displayName.toLowerCase().includes(accountSearch.toLowerCase()) ||
    account.name.toLowerCase().includes(accountSearch.toLowerCase())
  );

  // Filter properties based on search
  const filteredProperties = properties.filter((property: Property) =>
    property.displayName.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {step === 'account' ? 'Select Your Analytics Account' : 'Select Property'}
          </DialogTitle>
          <DialogDescription>
            {step === 'account' 
              ? 'Choose which Google Analytics account to connect' 
              : `Select a property from "${selectedAccount?.displayName}"`
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading your accounts...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Account Selection */}
            {step === 'account' && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Accounts List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account: Account) => (
                      <div
                        key={account.name}
                        className="p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => selectAccount(account)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{account.displayName}</h3>
                            <p className="text-sm text-gray-500">
                              ID: {account.name.split('/').pop()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                {account.regionCode}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Created: {new Date(account.createTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {accountSearch ? 'No accounts match your search.' : 'No accounts found.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Property Selection */}
            {step === 'property' && (
              <div className="space-y-4">
                {/* Back button and search */}
                <div className="flex items-center gap-3">
                  <Button onClick={goBack} variant="outline" size="sm">
                    ← Back to Accounts
                  </Button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search properties..."
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Selected Account Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Selected Account:</span>
                    <span className="text-blue-700">{selectedAccount?.displayName}</span>
                  </div>
                </div>

                {/* Properties List */}
                {loadingProperties ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600">Loading properties...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property: Property) => (
                        <div
                          key={property.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedProperty?.name === property.name
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                          onClick={() => selectProperty(property)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{property.displayName}</h3>
                              <p className="text-sm text-gray-500">
                                Property ID: {property.name.split('/').pop()}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {property.timeZone}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {property.currencyCode}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Created: {new Date(property.createTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {selectedProperty?.name === property.name && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        {propertySearch ? 'No properties match your search.' : 'No properties found for this account.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between border-t pt-4">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              
              {selectedProperty && (
                <Button
                  onClick={saveSelection}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Connect This Property'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 