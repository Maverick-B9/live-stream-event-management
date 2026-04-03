import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  LogOut, 
  Play, 
  Video, 
  MessageSquare, 
  Edit, 
  Save, 
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const { 
    matches, 
    franchises, 
    sports, 
    updateMatch,
    streamRequests,
    submitStreamRequest,
    eventHeadlines,
    addEventHeadline,
    removeHeadline,
    branding,
  } = useEvent();
  const navigate = useNavigate();

  const [editingStreamUrl, setEditingStreamUrl] = useState(false);
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [saveAnimation, setSaveAnimation] = useState(false);

  if (!user || user.role !== 'coordinator') {
    navigate('/coordinator/login');
    return null;
  }

  // Get coordinator's assigned matches
  const assignedMatches = matches.filter(m => 
    user.assignedFranchises?.includes(m.franchiseAId) || 
    user.assignedFranchises?.includes(m.franchiseBId) ||
    m.coordinatorId === user.id
  );

  const activeMatch = assignedMatches.find(m => m.status === 'live') || assignedMatches[0];

  const handleScoreUpdate = (field: string, value: any, team: 'A' | 'B') => {
    if (!activeMatch) return;
    
    const scoreKey = team === 'A' ? 'scoreA' : 'scoreB';
    const currentScore = activeMatch[scoreKey] || {};
    
    updateMatch(activeMatch.id, {
      [scoreKey]: { ...currentScore, [field]: value },
    });

    setSaveAnimation(true);
    setTimeout(() => setSaveAnimation(false), 1000);
    toast.success('Score updated');
  };

  const handleStatusChange = (status: any) => {
    if (!activeMatch) return;
    updateMatch(activeMatch.id, { status });
    toast.success(`Match status changed to ${status}`);
  };

  const handleStreamRequest = () => {
    if (!activeMatch || !newStreamUrl) return;

    submitStreamRequest({
      coordinatorId: user.id,
      coordinatorName: user.name,
      eventId: activeMatch.eventId,
      matchId: activeMatch.id,
      requestedUrl: newStreamUrl,
    });

    setEditingStreamUrl(false);
    setNewStreamUrl('');
    toast.success('Stream switch request submitted');
  };

  const handleAddHeadline = () => {
    if (!newHeadline.trim()) return;

    addEventHeadline({
      text: newHeadline,
      priority: eventHeadlines.length + 1,
      type: 'event',
      eventId: activeMatch?.eventId || '',
      createdBy: user.id,
    });

    setNewHeadline('');
    toast.success('Headline added');
  };

  const activeSport = activeMatch ? sports.find(s => s.id === activeMatch.sportId) : null;
  const franchiseA = activeMatch ? franchises.find(f => f.id === activeMatch.franchiseAId) : null;
  const franchiseB = activeMatch ? franchises.find(f => f.id === activeMatch.franchiseBId) : null;

  const myStreamRequests = streamRequests.filter(r => r.coordinatorId === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b"
        style={{ borderBottomColor: branding.secondaryColor, borderBottomWidth: 3 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Coordinator Portal</h1>
            <Badge variant="outline">{user.name}</Badge>
          </div>
          <Button variant="outline" onClick={() => { logout(); navigate('/coordinator/login'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Match Selector */}
        {assignedMatches.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Active Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto">
                {assignedMatches.map(match => {
                  const fA = franchises.find(f => f.id === match.franchiseAId);
                  const fB = franchises.find(f => f.id === match.franchiseBId);
                  return (
                    <Button
                      key={match.id}
                      variant={match.id === activeMatch?.id ? 'default' : 'outline'}
                      onClick={() => {}}
                      className="whitespace-nowrap"
                    >
                      {fA?.name} vs {fB?.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeMatch && activeSport && franchiseA && franchiseB ? (
          <Tabs defaultValue="score" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
              <TabsTrigger value="score">
                <Play className="w-4 h-4 mr-2" />
                Score Management
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="w-4 h-4 mr-2" />
                Video Stream
              </TabsTrigger>
              <TabsTrigger value="headlines">
                <MessageSquare className="w-4 h-4 mr-2" />
                Headlines
              </TabsTrigger>
            </TabsList>

            {/* Score Management */}
            <TabsContent value="score" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{franchiseA.name} vs {franchiseB.name}</span>
                    <Badge 
                      className="ml-auto"
                      variant={activeMatch.status === 'live' ? 'destructive' : 'secondary'}
                    >
                      {activeMatch.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Team A Score */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: franchiseA.color }}
                      />
                      {franchiseA.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activeSport.scoringSchema.map(field => (
                        <div key={field.id}>
                          <Label>{field.label}</Label>
                          <Input 
                            type={field.type}
                            value={activeMatch.scoreA?.[field.id] || ''}
                            onChange={(e) => handleScoreUpdate(
                              field.id, 
                              field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
                              'A'
                            )}
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team B Score */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: franchiseB.color }}
                      />
                      {franchiseB.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activeSport.scoringSchema.map(field => (
                        <div key={field.id}>
                          <Label>{field.label}</Label>
                          <Input 
                            type={field.type}
                            value={activeMatch.scoreB?.[field.id] || ''}
                            onChange={(e) => handleScoreUpdate(
                              field.id, 
                              field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
                              'B'
                            )}
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match Status */}
                  <div>
                    <Label>Match Status</Label>
                    <Select value={activeMatch.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="halftime">Halftime/Break</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Save Animation */}
                  <AnimatePresence>
                    {saveAnimation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-green-600"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Saved!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Stream */}
            <TabsContent value="video" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Stream Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Stream URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        value={activeMatch.streamUrl || 'No stream set'}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setEditingStreamUrl(!editingStreamUrl)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingStreamUrl && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div>
                        <Label>New Stream URL</Label>
                        <Input 
                          value={newStreamUrl}
                          onChange={(e) => setNewStreamUrl(e.target.value)}
                          placeholder="https://example.com/stream.m3u8"
                        />
                      </div>
                      <Button 
                        onClick={handleStreamRequest}
                        disabled={!newStreamUrl}
                        style={{ backgroundColor: branding.secondaryColor, color: '#000' }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Request Stream Switch
                      </Button>
                    </motion.div>
                  )}

                  {/* Stream Requests Status */}
                  {myStreamRequests.length > 0 && (
                    <div className="space-y-2">
                      <Label>Recent Requests</Label>
                      {myStreamRequests.slice(-3).reverse().map(request => (
                        <div 
                          key={request.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-mono truncate">{request.requestedUrl}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                            className="ml-2"
                          >
                            {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {request.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Headlines */}
            <TabsContent value="headlines" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event-Level Ticker Headlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={newHeadline}
                      onChange={(e) => setNewHeadline(e.target.value)}
                      placeholder="Enter headline text..."
                      maxLength={120}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHeadline()}
                    />
                    <Button onClick={handleAddHeadline} disabled={!newHeadline.trim()}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">{newHeadline.length}/120 characters</p>

                  <div className="space-y-2">
                    <Label>Active Headlines</Label>
                    {eventHeadlines.filter(h => h.createdBy === user.id).map(headline => (
                      <div 
                        key={headline.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <p className="flex-1">{headline.text}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeadline(headline.id, 'event')}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {eventHeadlines.filter(h => h.createdBy === user.id).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No headlines added yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No matches assigned to you</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
