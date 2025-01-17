import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const RoomOverview = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("inventory");

  // Fetch room data
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch items for the room
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ["items", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("room_id", roomId);

      if (error) throw error;
      return data;
    },
  });

  // Fetch item history
  const { data: itemHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["item-history", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_history")
        .select(`
          *,
          items (name)
        `)
        .eq("items.room_id", roomId);

      if (error) throw error;
      return data;
    },
  });

  // Fetch activity logs
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["activity-logs", roomId],
    queryFn: async () => {
      const { data: items } = await supabase
        .from("items")
        .select("id")
        .eq("room_id", roomId);

      if (!items) return [];

      const itemIds = items.map(item => item.id);

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          user:user_id (
            profile:profiles (
              username
            )
          )
        `)
        .eq("entity_type", "item")
        .in("entity_id", itemIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activity logs:", error);
        throw error;
      }

      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="text-green-500" />;
      case "needs_maintenance":
        return <Wrench className="text-yellow-500" />;
      case "needs_replacement":
        return <AlertCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  if (isLoadingRoom || isLoadingItems) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Room {room?.room_number} (Floor {room?.floor_number})
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="history">Item History</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-end">
              <Button>Add New Item</Button>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge
                            variant={
                              item.status === "good"
                                ? "default"
                                : item.status === "needs_maintenance"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Previous Status</TableHead>
                    <TableHead>New Status</TableHead>
                    <TableHead>Previous Quantity</TableHead>
                    <TableHead>New Quantity</TableHead>
                    <TableHead>Changed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemHistory?.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.items?.name}</TableCell>
                      <TableCell>{history.previous_status}</TableCell>
                      <TableCell>{history.new_status}</TableCell>
                      <TableCell>{history.previous_quantity}</TableCell>
                      <TableCell>{history.new_quantity}</TableCell>
                      <TableCell>
                        {new Date(history.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.user?.profile?.username || 'Unknown User'}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <pre className="text-sm">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RoomOverview;