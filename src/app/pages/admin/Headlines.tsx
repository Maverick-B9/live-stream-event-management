import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { motion, Reorder } from 'motion/react';

export function Headlines() {
  const { 
    globalHeadlines, 
    eventHeadlines,
    addGlobalHeadline, 
    addEventHeadline,
    removeHeadline,
  } = useEvent();

  const [newGlobalHeadline, setNewGlobalHeadline] = useState('');
  const [newEventHeadline, setNewEventHeadline] = useState('');
  const [tickerSpeed, setTickerSpeed] = useState([50]);

  const handleAddGlobal = () => {
    if (!newGlobalHeadline.trim()) return;
    
    addGlobalHeadline({
      text: newGlobalHeadline,
      priority: globalHeadlines.length + 1,
      type: 'global',
      createdBy: 'admin',
    });
    
    setNewGlobalHeadline('');
    toast.success('Global headline added');
  };

  const handleAddEvent = () => {
    if (!newEventHeadline.trim()) return;
    
    addEventHeadline({
      text: newEventHeadline,
      priority: eventHeadlines.length + 1,
      type: 'event',
      eventId: 'e1',
      createdBy: 'admin',
    });
    
    setNewEventHeadline('');
    toast.success('Event headline added');
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
          <h1 className="text-2xl font-bold">Headline Manager</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Ticker Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ticker Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Scroll Speed: {tickerSpeed[0]} px/s</Label>
                <Slider 
                  value={tickerSpeed}
                  onValueChange={setTickerSpeed}
                  min={20}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Ticker */}
        <Card>
          <CardHeader>
            <CardTitle>Global Ticker (Top Row)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newGlobalHeadline}
                onChange={(e) => setNewGlobalHeadline(e.target.value)}
                placeholder="Enter global headline..."
                maxLength={150}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGlobal()}
              />
              <Button onClick={handleAddGlobal} disabled={!newGlobalHeadline.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">{newGlobalHeadline.length}/150 characters</p>

            <div className="space-y-2">
              {globalHeadlines.map((headline, index) => (
                <motion.div
                  key={headline.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline">{index + 1}</Badge>
                  <p className="flex-1">{headline.text}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removeHeadline(headline.id, 'global');
                      toast.success('Headline removed');
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
              
              {globalHeadlines.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No global headlines yet. Add one above.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event-Level Ticker */}
        <Card>
          <CardHeader>
            <CardTitle>Event-Level Ticker (Bottom Row)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newEventHeadline}
                onChange={(e) => setNewEventHeadline(e.target.value)}
                placeholder="Enter event-specific headline..."
                maxLength={150}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
              />
              <Button onClick={handleAddEvent} disabled={!newEventHeadline.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">{newEventHeadline.length}/150 characters</p>

            <div className="space-y-2">
              {eventHeadlines.map((headline, index) => (
                <motion.div
                  key={headline.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline">{index + 1}</Badge>
                  <p className="flex-1">{headline.text}</p>
                  <Badge variant="secondary" className="text-xs">
                    by {headline.createdBy}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removeHeadline(headline.id, 'event');
                      toast.success('Headline removed');
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
              
              {eventHeadlines.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No event headlines yet. Add one above or wait for coordinators.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
