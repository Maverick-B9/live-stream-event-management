import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Play, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function VideoControl() {
  const { 
    matches, 
    streamRequests, 
    reviewStreamRequest, 
    updateMatch,
    videoPlayer,
    updateVideoPlayer,
    franchises,
    sports,
  } = useEvent();
  
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const pendingRequests = streamRequests.filter(r => r.status === 'pending');

  const handleApprove = (requestId: string) => {
    reviewStreamRequest(requestId, 'approved');
    toast.success('Stream request approved');
  };

  const handleReject = (requestId: string) => {
    reviewStreamRequest(requestId, 'rejected', adminNote);
    setAdminNote('');
    toast.success('Stream request rejected');
  };

  const handleOverrideStream = (matchId: string) => {
    if (!newUrl) return;
    
    updateMatch(matchId, { streamUrl: newUrl });
    updateVideoPlayer({
      currentStreamUrl: newUrl,
      status: 'loading',
      activeMatchId: matchId,
    });
    
    setEditingMatchId(null);
    setNewUrl('');
    toast.success('Stream URL updated and pushed to display');
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
          <h1 className="text-2xl font-bold">Video Stream Control</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Currently Playing */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Now Playing on Public Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stream URL:</span>
                <Badge variant="outline" className="font-mono text-xs max-w-md truncate">
                  {videoPlayer.currentStreamUrl || 'No stream'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge>{videoPlayer.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Stream Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Stream Requests ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map(request => {
                const match = matches.find(m => m.id === request.matchId);
                const franchiseA = match ? franchises.find(f => f.id === match.franchiseAId) : null;
                const franchiseB = match ? franchises.find(f => f.id === match.franchiseBId) : null;
                
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{request.coordinatorName}</p>
                        {match && franchiseA && franchiseB && (
                          <p className="text-sm text-gray-600">
                            {franchiseA.name} vs {franchiseB.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Requested URL</Label>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                        {request.requestedUrl}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs">Admin Note (optional)</Label>
                      <Textarea 
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add a note for the coordinator..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Push Live
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* All Event Streams */}
        <Card>
          <CardHeader>
            <CardTitle>All Event Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map(match => {
                const franchiseA = franchises.find(f => f.id === match.franchiseAId);
                const franchiseB = franchises.find(f => f.id === match.franchiseBId);
                const sport = sports.find(s => s.id === match.sportId);
                const isEditing = editingMatchId === match.id;

                return (
                  <div key={match.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {franchiseA?.name} vs {franchiseB?.name}
                        </p>
                        <p className="text-sm text-gray-600">{sport?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {videoPlayer.activeMatchId === match.id && (
                          <Badge variant="default" className="bg-green-500">
                            <Play className="w-3 h-3 mr-1" />
                            Now Playing
                          </Badge>
                        )}
                        <Badge variant="outline">{match.status}</Badge>
                      </div>
                    </div>

                    {!isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={match.streamUrl || 'No stream URL set'}
                          readOnly
                          className="flex-1 font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMatchId(match.id);
                            setNewUrl(match.streamUrl || '');
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input 
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="Enter new stream URL..."
                          className="font-mono text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOverrideStream(match.id)}
                            disabled={!newUrl}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save & Push Live
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMatchId(null);
                              setNewUrl('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
