import React from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { motion } from 'motion/react';

export function Franchises() {
  const { franchises } = useEvent();

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
          <h1 className="text-2xl font-bold">Franchise Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {franchises.map((franchise, index) => (
            <motion.div
              key={franchise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: franchise.color }}
                    >
                      {franchise.name[0]}
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle>{franchise.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Team Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: franchise.color }}
                      />
                      <Input 
                        value={franchise.color}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  {franchise.assignedCoordinatorId && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Coordinator</p>
                      <Badge variant="secondary">Assigned</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
