import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle, LayoutDashboard, Tool } from "lucide-react";

export default function Dashboard() {
  const [openFloor, setOpenFloor] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    maintenanceItems: 0,
    lowStockItems: 0,
  });

  // Simulated floors and rooms data
  const floors = [
    {
      name: "First Floor",
      id: "first",
      rooms: ["101", "102", "103", "104", "105", "106", "107", "108", "109"],
    },
    {
      name: "Second Floor",
      id: "second",
      rooms: ["201", "202", "203", "204", "205", "206", "207", "208", "209"],
    },
    // Add more floors as needed
  ];

  useEffect(() => {
    // TODO: Fetch real metrics from your backend
    setMetrics({
      totalItems: 150,
      maintenanceItems: 5,
      lowStockItems: 3,
    });
  }, []);

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
            <p className="text-3xl font-bold mt-2">{metrics.totalItems}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Tool className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Maintenance Required</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{metrics.maintenanceItems}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Low Stock Alert</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{metrics.lowStockItems}</p>
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
                      onClick={() => {
                        // TODO: Handle room selection
                        console.log(`Selected room ${room}`);
                      }}
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