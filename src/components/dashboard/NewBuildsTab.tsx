import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, HardHat, CalendarDays, Home } from 'lucide-react';

export default function NewBuildsTab({ companyId: initialCompanyId }: { companyId?: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | undefined>(initialCompanyId);

  useEffect(() => {
    if (!companyId) {
      // Fetch default company if none provided
      supabase.from('companies').select('id').limit(1).then(({ data }) => {
        if (data && data.length > 0) {
          setCompanyId(data[0].id);
        }
      });
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchLeads();
    }
  }, [companyId]);

  const fetchLeads = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('new_build_permits')
      .select('*')
      .eq('company_id', companyId)
      .order('permit_date', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  };

  const calculateTimeline = (permitDate: string, estimatedCompletion: string) => {
    const today = new Date();
    const completion = new Date(estimatedCompletion);
    
    // If today is past the estimated completion, cross-check API logic happens here
    if (today > completion) return { status: 'Move-in Window', color: 'bg-green-100 text-green-800' };
    
    // Otherwise calculate rough phase
    const start = new Date(permitDate);
    const totalDays = (completion.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const daysPassed = (today.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const progress = daysPassed / totalDays;

    if (progress < 0.2) return { status: 'Foundation / Framing', color: 'bg-yellow-100 text-yellow-800' };
    if (progress < 0.7) return { status: 'Rough-Ins / Drywall', color: 'bg-blue-100 text-blue-800' };
    return { status: 'Finishes / Pre-Close', color: 'bg-purple-100 text-purple-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Construction Leads</h2>
          <p className="text-muted-foreground">
            Pre-construction dirt lots and builder permits. Track timelines to intercept new homeowners before they move in.
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading new builds...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-gray-500">No new construction permits found in your territory yet.</p>
        ) : (
          leads.map((lead) => {
            const phase = calculateTimeline(lead.permit_date, lead.estimated_completion_date);
            return (
              <Card key={lead.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        {lead.property_address}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.city}, {lead.state}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <HardHat className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Builder:</span>
                    <span className="text-gray-900">{lead.contractor_name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Permit Issued</div>
                      <div className="font-medium">{new Date(lead.permit_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Est. Completion</div>
                      <div className="font-medium">{new Date(lead.estimated_completion_date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs font-medium text-gray-500 uppercase">Construction Phase</span>
                    <Badge variant="secondary" className={phase.color}>
                      {phase.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
