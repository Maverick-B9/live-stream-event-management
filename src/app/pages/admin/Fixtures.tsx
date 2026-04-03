import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function Fixtures() {
  const { matches, franchises, sports, createMatch } = useEvent();
  const [isCreating, setIsCreating] = useState(false);
  const [newMatch, setNewMatch] = useState({
    sportId: '',
    franchiseAId: '',
    franchiseBId: '',
    dateTime: '',
    venue: '',
  });

  const handleCreateMatch = () => {
    if (!newMatch.sportId || !newMatch.franchiseAId || !newMatch.franchiseBId || !newMatch.dateTime || !newMatch.venue) {
      toast.error('All fields are required');
      return;
    }

    createMatch({
      ...newMatch,
      eventId: 'e1',
      status: 'upcoming',
    });

    setNewMatch({
      sportId: '',
      franchiseAId: '',
      franchiseBId: '',
      dateTime: '',
      venue: '',
    });
    setIsCreating(false);
    toast.success('Match created successfully');
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
          <h1 className="text-2xl font-bold">Fixture Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Matches</CardTitle>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Match
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Match</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Sport</Label>
                    <Select value={newMatch.sportId} onValueChange={(value) => setNewMatch({ ...newMatch, sportId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map(sport => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Franchise A</Label>
                    <Select value={newMatch.franchiseAId} onValueChange={(value) => setNewMatch({ ...newMatch, franchiseAId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchises.map(franchise => (
                          <SelectItem key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Franchise B</Label>
                    <Select value={newMatch.franchiseBId} onValueChange={(value) => setNewMatch({ ...newMatch, franchiseBId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchises.map(franchise => (
                          <SelectItem key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date & Time</Label>
                    <Input 
                      type="datetime-local"
                      value={newMatch.dateTime}
                      onChange={(e) => setNewMatch({ ...newMatch, dateTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input 
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                      placeholder="Stadium name"
                    />
                  </div>
                  <Button onClick={handleCreateMatch} className="w-full">
                    Create Match
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map(match => {
                  const sport = sports.find(s => s.id === match.sportId);
                  const franchiseA = franchises.find(f => f.id === match.franchiseAId);
                  const franchiseB = franchises.find(f => f.id === match.franchiseBId);
                  
                  return (
                    <TableRow key={match.id}>
                      <TableCell>{sport?.name}</TableCell>
                      <TableCell className="font-medium">
                        {franchiseA?.name} vs {franchiseB?.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(match.dateTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {match.venue}
                      </TableCell>
                      <TableCell>
                        <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
