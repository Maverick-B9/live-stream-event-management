import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { ArrowLeft, Upload } from 'lucide-react';
import { EventLogo } from '../../components/shared/EventLogo';
import { toast } from 'sonner';

export function Branding() {
  const { branding, updateBranding } = useEvent();
  const [localBranding, setLocalBranding] = useState(branding);

  const handleSave = () => {
    updateBranding(localBranding);
    toast.success('Branding settings saved');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-white hover:bg-white/10">
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Branding & Animations</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <EventLogo size="xl" />
              <div className="flex-1">
                <Label>Logo URL (or upload)</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={localBranding.eventLogoUrl}
                    onChange={(e) => setLocalBranding({ ...localBranding, eventLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used in loading screens, buffering overlays, and section headers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Event Name</Label>
              <Input 
                value={localBranding.eventName}
                onChange={(e) => setLocalBranding({ ...localBranding, eventName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Primary Color (Deep Navy)</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    type="color"
                    value={localBranding.primaryColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    value={localBranding.primaryColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, primaryColor: e.target.value })}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color (Electric Gold/Orange)</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    type="color"
                    value={localBranding.secondaryColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    value={localBranding.secondaryColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, secondaryColor: e.target.value })}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label>Accent Color (White)</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    type="color"
                    value={localBranding.accentColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, accentColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    value={localBranding.accentColor}
                    onChange={(e) => setLocalBranding({ ...localBranding, accentColor: e.target.value })}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Animation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Animations</Label>
                <p className="text-sm text-gray-600">
                  Controls all platform animations (loading, score flash, live badge pulse, etc.)
                </p>
              </div>
              <Switch 
                checked={localBranding.animationsEnabled}
                onCheckedChange={(checked) => setLocalBranding({ ...localBranding, animationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg">
          Save Branding Settings
        </Button>
      </div>
    </div>
  );
}
