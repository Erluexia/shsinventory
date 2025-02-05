import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { RoomInventoryTab } from "@/components/rooms/RoomInventoryTab";
import { RoomActivityTab } from "@/components/rooms/RoomActivityTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RoomOverview = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("inventory");

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
      const { data: allItems } = await supabase
        .from("items")
        .select("id")
        .eq("room_id", room.id);

      // Get activity logs for all items, including deleted ones
      const { data: logs, error: logsError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_type", "item")
        .order("created_at", { ascending: false });

      if (logsError) {
        console.error("Error fetching activity logs:", logsError);
        throw logsError;
      }

      // Filter logs to only include those related to this room's items
      const roomItemIds = new Set((allItems || []).map(item => item.id));
      const filteredLogs = logs?.filter(log => roomItemIds.has(log.entity_id)) || [];

      // Fetch user profiles separately
      const userIds = [...new Set(filteredLogs.map(log => log.user_id))].filter(Boolean);
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        // Merge profiles with logs
        return filteredLogs.map(log => ({
          ...log,
          profiles: profiles?.find(profile => profile.id === log.user_id)
        }));
      }

      return filteredLogs;
    },
    enabled: !!room?.id,
  });

  if (isLoadingRoom) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (roomError) {
    return (
      <DashboardLayout>
        <div className="p-4">
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
        <div className="p-4">
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
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            Room {room.room_number} (Floor {room.floors?.floor_number})
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <RoomInventoryTab 
              items={items || []} 
              roomId={room.id} 
              isLoading={isLoadingItems}
            />
          </TabsContent>

          <TabsContent value="activity">
            <RoomActivityTab 
              activityLogs={activityLogs || []} 
              isLoading={isLoadingLogs}
              onRefresh={() => refetchLogs()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RoomOverview;