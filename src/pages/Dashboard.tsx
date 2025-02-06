import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Wrench, AlertTriangle, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FloorStats {
  totalItems: number;
  needsMaintenance: number;
  needsReplacement: number;
}

interface FloorData {
  id: string;
  name: string;
  floor_number: number;
  stats: FloorStats;
  roomCount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch floors and their statistics
  const { data: floors, isLoading: isLoadingFloors } = useQuery({
    queryKey: ['floors-with-stats'],
    queryFn: async () => {
      console.log('Fetching floors and their statistics...');
      
      // First, fetch all floors
      const { data: floorsData, error: floorsError } = await supabase
        .from('floors')
        .select('*')
        .order('floor_number');

      if (floorsError) {
        console.error('Error fetching floors:', floorsError);
        toast.error('Failed to load floors');
        throw floorsError;
      }

      // Then, for each floor, fetch rooms and items
      const floorsWithStats = await Promise.all(floorsData.map(async (floor) => {
        // Get rooms for this floor
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('id')
          .eq('floor_id', floor.id);

        if (roomsError) {
          console.error('Error fetching rooms for floor:', floor.id, roomsError);
          throw roomsError;
        }

        // Get all items in these rooms
        const roomIds = rooms?.map(room => room.id) || [];
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .in('room_id', roomIds);

        if (itemsError) {
          console.error('Error fetching items for rooms:', roomIds, itemsError);
          throw itemsError;
        }

        const stats: FloorStats = {
          totalItems: items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
          needsMaintenance: items?.reduce((sum, item) => sum + (item.maintenance_quantity || 0), 0) || 0,
          needsReplacement: items?.reduce((sum, item) => sum + (item.replacement_quantity || 0), 0) || 0,
        };

        return {
          ...floor,
          stats,
          roomCount: rooms?.length || 0
        };
      }));

      console.log('Floors with stats:', floorsWithStats);
      return floorsWithStats;
    },
  });

  // Fetch overall metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      console.log('Fetching overall metrics...');
      const { data: items, error } = await supabase
        .from('items')
        .select('quantity, maintenance_quantity, replacement_quantity');
      
      if (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Failed to load metrics');
        throw error;
      }

      const { data: roomCount, error: roomError } = await supabase
        .from('rooms')
        .select('id', { count: 'exact' });

      if (roomError) {
        console.error('Error fetching room count:', roomError);
        throw roomError;
      }

      return {
        totalItems: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        needsMaintenance: items.reduce((sum, item) => sum + (item.maintenance_quantity || 0), 0),
        needsReplacement: items.reduce((sum, item) => sum + (item.replacement_quantity || 0), 0),
        totalRooms: roomCount.length
      };
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 md:px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              <h3 className="text-sm md:text-lg font-semibold">Total Items</h3>
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-xl md:text-3xl font-bold mt-2">
                {metrics?.totalItems || 0}
              </p>
            )}
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 md:h-5 w-4 md:w-5 text-blue-500" />
              <h3 className="text-sm md:text-lg font-semibold">Total Rooms</h3>
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-xl md:text-3xl font-bold mt-2 text-blue-500">
                {metrics?.totalRooms || 0}
              </p>
            )}
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 md:h-5 w-4 md:w-5 text-yellow-500" />
              <h3 className="text-sm md:text-lg font-semibold">Need Maintenance</h3>
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-xl md:text-3xl font-bold mt-2 text-yellow-500">
                {metrics?.needsMaintenance || 0}
              </p>
            )}
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
              <h3 className="text-sm md:text-lg font-semibold">Need Replacement</h3>
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-xl md:text-3xl font-bold mt-2 text-red-500">
                {metrics?.needsReplacement || 0}
              </p>
            )}
          </Card>
        </div>

        {/* Floor Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Floor Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingFloors ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-4 md:p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </Card>
              ))
            ) : floors?.length === 0 ? (
              <Card className="p-4 md:p-6 col-span-full">
                <p className="text-center text-gray-500">No floors found. Please add floors to get started.</p>
              </Card>
            ) : (
              floors?.map((floor: FloorData) => (
                <Card 
                  key={floor.id} 
                  className="p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/rooms/${floor.id}`)}
                >
                  <h3 className="text-lg font-semibold mb-4">{floor.name}</h3>
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Rooms:</span>
                      <span className="font-medium">{floor.roomCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{floor.stats.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Need Maintenance:</span>
                      <span className="font-medium text-yellow-500">
                        {floor.stats.needsMaintenance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Need Replacement:</span>
                      <span className="font-medium text-red-500">
                        {floor.stats.needsReplacement}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}