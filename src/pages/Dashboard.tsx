import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle, LayoutDashboard, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [openFloor, setOpenFloor] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch metrics data
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('items')
        .select('id, status, quantity');
      
      if (error) throw error;

      return {
        totalItems: items.length,
        maintenanceItems: items.filter(item => item.status === 'needs_maintenance').length,
        lowStockItems: items.filter(item => item.quantity < 5).length,
      };
    },
  });

  // Simulated floors data - you can fetch this from your backend if needed
  const floors = [
    {
      name: "First Floor",
      id: "1",
      rooms: Array.from({ length: 9 }, (_, i) => `10${i + 1}`),
    },
    {
      name: "Second Floor",
      id: "2",
      rooms: Array.from({ length: 9 }, (_, i) => `20${i + 1}`),
    },
    {
      name: "Third Floor",
      id: "3",
      rooms: Array.from({ length: 9 }, (_, i) => `30${i + 1}`),
    },
    {
      name: "Fourth Floor",
      id: "4",
      rooms: Array.from({ length: 9 }, (_, i) => `40${i + 1}`),
    },
    {
      name: "Fifth Floor",
      id: "5",
      rooms: Array.from({ length: 9 }, (_, i) => `50${i + 1}`),
    },
    {
      name: "Sixth Floor",
      id: "6",
      rooms: Array.from({ length: 9 }, (_, i) => `60${i + 1}`),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Total Items</h3>
            </div>
            <p className="text-3xl font-bold mt-2">
              {isLoadingMetrics ? "..." : metrics?.totalItems}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Maintenance Required</h3>
            </div>
            <p className="text-3xl font-bold mt-2">
              {isLoadingMetrics ? "..." : metrics?.maintenanceItems}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Low Stock Alert</h3>
            </div>
            <p className="text-3xl font-bold mt-2">
              {isLoadingMetrics ? "..." : metrics?.lowStockItems}
            </p>
          </Card>
        </div>

        {/* Floor Navigation */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Floor Navigation</h2>
          {floors.map((floor) => (
            <Collapsible
              key={floor.id}
              open={openFloor === floor.id}
              onOpenChange={() =>
                setOpenFloor(openFloor === floor.id ? null : floor.id)
              }
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                >
                  <span>{floor.name}</span>
                  {openFloor === floor.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {floor.rooms.map((room) => (
                    <Button
                      key={room}
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/rooms/${room}`)}
                    >
                      Room {room}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}