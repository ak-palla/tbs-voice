"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Gift, PartyPopper, Sparkles, Award, TrendingUp, CalendarCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type Benefit = {
  id: string;
  benefit_name: string;
  notes: string | null;
  is_claimed: boolean;
  claimed_date: string | null;
};

export default function AdditionalBenefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingBenefit, setClaimingBenefit] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First get all benefits
      const { data: allBenefits, error: benefitsError } = await supabase
        .from('chq_benefits')
        .select('*')
        .order('created_at', { ascending: false });

      if (benefitsError) throw benefitsError;

      // Then get user's claims
      const { data: userClaims, error: claimsError } = await supabase
        .from('user_benefit_claims')
        .select('*')
        .eq('user_id', user.id);

      if (claimsError) throw claimsError;

      // Combine the data
      const benefitsWithClaims = allBenefits.map(benefit => {
        const claim = userClaims?.find(claim => claim.benefit_id === benefit.id);
        return {
          ...benefit,
          is_claimed: claim?.is_claimed || false,
          claimed_date: claim?.claimed_date || null
        };
      });

      setBenefits(benefitsWithClaims);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast.error('Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBenefit = async (benefitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      setClaimingBenefit(benefitId);

      // Check if claim already exists
      const { data: existingClaim } = await supabase
        .from('user_benefit_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('benefit_id', benefitId)
        .single();

      if (existingClaim) {
        // Update existing claim
        const { error } = await supabase
          .from('user_benefit_claims')
          .update({
            is_claimed: true,
            claimed_date: new Date().toISOString(),
          })
          .eq('id', existingClaim.id);

        if (error) throw error;
      } else {
        // Create new claim
        const { error } = await supabase
          .from('user_benefit_claims')
          .insert([{
            user_id: user.id,
            benefit_id: benefitId,
            is_claimed: true,
            claimed_date: new Date().toISOString(),
          }]);

        if (error) throw error;
      }

      setBenefits(benefits.map(benefit => 
        benefit.id === benefitId 
          ? { ...benefit, is_claimed: true, claimed_date: new Date().toISOString() }
          : benefit
      ));
      toast.success('Benefit claimed successfully');
    } catch (error) {
      console.error('Error claiming benefit:', error);
      toast.error('Failed to claim benefit');
    } finally {
      setClaimingBenefit(null);
    }
  };

  // Function to determine which icon to show based on benefit name
  const getBenefitIcon = (benefitName: string) => {
    const name = benefitName.toLowerCase();
    if (name.includes('bonus')) return Award;
    if (name.includes('discount') || name.includes('offer')) return TrendingUp;
    if (name.includes('free')) return Gift;
    if (name.includes('premium') || name.includes('special')) return Sparkles;
    return PartyPopper;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (benefits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No additional benefits available.</p>
      </div>
    );
  }

  // Separate claimed and unclaimed benefits
  const claimedBenefits = benefits.filter(benefit => benefit.is_claimed);
  const unclaimedBenefits = benefits.filter(benefit => !benefit.is_claimed);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Additional Benefits</h2>
      </div>
      
      {unclaimedBenefits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-muted-foreground">Available Benefits</h3>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {unclaimedBenefits.map((benefit) => {
              const BenefitIcon = getBenefitIcon(benefit.benefit_name);
              return (
                <div 
                  key={benefit.id}
                  className="transform transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <Card className="p-5 h-full hover:-md transition- duration-300 overflow-hidden group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 bg-blue-50 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                        <BenefitIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{benefit.benefit_name}</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                            Available
                          </Badge>
                        </div>
                        
                        {benefit.notes && (
                          <p className="text-sm text-muted-foreground">{benefit.notes}</p>
                        )}
                        
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleClaimBenefit(benefit.id)}
                          disabled={!!claimingBenefit}
                        >
                          {claimingBenefit === benefit.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Claim Benefit
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {claimedBenefits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-muted-foreground">Claimed Benefits</h3>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {claimedBenefits.map((benefit) => {
              const BenefitIcon = getBenefitIcon(benefit.benefit_name);
              return (
                <div 
                  key={benefit.id}
                  className="transition-opacity duration-300"
                >
                  <Card className="p-5 h-full border-green-100 bg-green-50/30 overflow-hidden group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 bg-green-50 rounded-full opacity-40" />
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-green-50 text-green-600">
                        <BenefitIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center justify-between flex-wrap">
                          <h3 className="font-medium">{benefit.benefit_name}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            Claimed
                          </Badge>
                        </div>
                        
                        {benefit.notes && (
                          <p className="text-sm text-muted-foreground">{benefit.notes}</p>
                        )}
                        
                        {benefit.claimed_date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Claimed on: {new Date(benefit.claimed_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 