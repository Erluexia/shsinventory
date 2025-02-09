
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { RoomInventoryTab } from "@/components/rooms/RoomInventoryTab";
import { RoomActivityTab } from "@/components/rooms/RoomActivityTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ActivityLog } from "@/types/activity-logs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RoomOverview = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("inventory");
  const navigate = useNavigate();

  const { data: room, isLoading: isLoadingRoom, error: roomError } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      console.log("Fetching room with number:", roomId);
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          *,
          floors!rooms_floor_id_fkey(*)
        `)
        .eq("room_number", roomId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching room:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Room not found");
      }

      return data;
    },
  });

  const { data: items, isLoading: isLoadingItems, error: itemsError } = useQuery({
    queryKey: ["items", room?.id],
    queryFn: async () => {
      if (!room?.id) return [];

      console.log("Fetching items for room:", room.id);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("room_id", room.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        throw error;
      }
      return data;
    },
    enabled: !!room?.id,
  });

  const { data: activityLogs, isLoading: isLoadingLogs, error: logsError, refetch: refetchLogs } = useQuery({
    queryKey: ["activity-logs", room?.id],
    queryFn: async () => {
      if (!room?.id) return [];

      console.log("Fetching activity logs for room:", room.id);
      
      // First, get all items that were ever in this room (including deleted ones)
      const { data: roomItems, error: itemsError } = await supabase
        .from("items")
        .select("id")
        .eq("room_id", room.id);

      if (itemsError) {
        console.error("Error fetching room items:", itemsError);
        throw itemsError;
      }

      // Get all activity logs with profiles
      const { data: logs, error: logsError } = await supabase
        .from("activity_logs")
        .select(`
          id,
          entity_type,
          entity_id,
          action,
          details,
          user_id,
          created_at,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq("entity_type", "item")
        .order("created_at", { ascending: false });

      if (logsError) {
        console.error("Error fetching activity logs:", logsError);
        throw logsError;
      }

      // Create a Set of item IDs for efficient lookup
      const roomItemIds = new Set(roomItems?.map(item => item.id) || []);

      // Filter logs to include both current items and deleted items
      const filteredLogs = (logs as ActivityLog[] | null)?.filter(log => {
        // Include logs for current items
        if (roomItemIds.has(log.entity_id)) return true;
        
        // For deleted items, check if the log indicates this item was in this room
        if (log.action === "deleted" && log.details?.room_id === room.id) return true;
        
        return false;
      }) || [];

      return filteredLogs;
    },
    enabled: !!room?.id,
  });

  if (isLoadingRoom) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (roomError) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load room information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Room Not Found</AlertTitle>
            <AlertDescription>
              The room {roomId} could not be found. Please check the room number and try again.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Room {room.room_number}
            </h1>
            <p className="text-muted-foreground">
              Floor {room.floors?.floor_number}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="border-b px-4">
              <TabsList className="justify-start -mb-px">
                <TabsTrigger value="inventory" className="relative">
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="activity" className="relative">
                  Activity Log
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="inventory" className="mt-0">
                <RoomInventoryTab 
                  items={items || []} 
                  roomId={room.id} 
                  isLoading={isLoadingItems}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <RoomActivityTab 
                  activityLogs={activityLogs || []} 
                  isLoading={isLoadingLogs}
                  onRefresh={() => refetchLogs()}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomOverview;
