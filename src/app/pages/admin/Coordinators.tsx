import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, UserPlus, Circle } from 'lucide-react';
import { toast } from 'sonner';

export function Coordinators() {
  const { coordinators, franchises, addCoordinator, updateCoordinator } = useEvent();
  const [isAddingCoordinator, setIsAddingCoordinator] = useState(false);
  const [newCoordinator, setNewCoordinator] = useState({
    name: '',
    email: '',
    assignedFranchises: [] as string[],
  });

  const handleAddCoordinator = () => {
    if (!newCoordinator.name || !newCoordinator.email) {
      toast.error('Name and email are required');
      return;
    }

    addCoordinator({
      ...newCoordinator,
      role: 'coordinator',
      online: false,
    });

    setNewCoordinator({ name: '', email: '', assignedFranchises: [] });
    setIsAddingCoordinator(false);
    toast.success('Coordinator added successfully');
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
          <h1 className="text-2xl font-bold">Coordinator Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Coordinators</CardTitle>
            <Dialog open={isAddingCoordinator} onOpenChange={setIsAddingCoordinator}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Coordinator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Coordinator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      value={newCoordinator.name}
                      onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newCoordinator.email}
                      onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <Button onClick={handleAddCoordinator} className="w-full">
                    Add Coordinator
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Franchises</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coordinators.map(coordinator => (
                  <TableRow key={coordinator.id}>
                    <TableCell>
                      <Circle 
                        className={`w-3 h-3 ${coordinator.online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{coordinator.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{coordinator.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {coordinator.assignedFranchises?.map(fId => {
                          const franchise = franchises.find(f => f.id === fId);
                          return franchise ? (
                            <Badge key={fId} variant="secondary">
                              {franchise.name}
                            </Badge>
                          ) : null;
                        })}
                        {(!coordinator.assignedFranchises || coordinator.assignedFranchises.length === 0) && (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
