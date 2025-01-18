import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { RoomInventoryTab } from "@/components/rooms/RoomInventoryTab";
import { RoomHistoryTab } from "@/components/rooms/RoomHistoryTab";
import { RoomActivityTab } from "@/components/rooms/RoomActivityTab";
import { RoomStatusBadge } from "@/components/rooms/RoomStatusBadge";

const RoomOverview = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("inventory");

  // Fetch room data with proper join
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      console.log("Fetching room with ID:", roomId);
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          *,
          floor:floors(*)
        `)
        .eq("id", roomId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching room:", error);
        throw error;
      }

      return data;
    },
  });

  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ["items", room?.id],
    queryFn: async () => {
      if (!room?.id) return [];

      console.log("Fetching items for room:", room.id);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("room_id", room.id);

      if (error) {
        console.error("Error fetching items:", error);
        throw error;
      }
      return data;
    },
    enabled: !!room?.id,
  });

  const { data: itemHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["item-history", room?.id],
    queryFn: async () => {
      if (!room?.id) return [];

      console.log("Fetching item history for room:", room.id);
      const { data, error } = await supabase
        .from("item_history")
        .select(`
          *,
          items (
            name,
            room_id
          )
        `)
        .eq("items.room_id", room.id);

      if (error) {
        console.error("Error fetching item history:", error);
        throw error;
      }
      return data;
    },
    enabled: !!room?.id,
  });

  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["activity-logs", room?.id],
    queryFn: async () => {
      if (!room?.id) return [];

      console.log("Fetching activity logs for room:", room.id);
      const { data: roomItems, error: itemsError } = await supabase
        .from("items")
        .select("id")
        .eq("room_id", room.id);

      if (itemsError) {
        console.error("Error fetching room items:", itemsError);
        throw itemsError;
      }

      if (!roomItems?.length) return [];

      const itemIds = roomItems.map(item => item.id);

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          profiles!activity_logs_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("entity_type", "item")
        .in("entity_id", itemIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activity logs:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!room?.id,
  });

  if (isLoadingRoom) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
            <p className="text-gray-600">
              The room with ID {roomId} could not be found. Please check the room ID and try again.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            Room {room?.room_number} (Floor {room?.floor_number})
          </h1>
          <div className="flex items-center gap-4">
            {room.previous_status && (
              <div className="text-sm text-gray-500">
                Previous Status: <RoomStatusBadge status={room.previous_status as any} />
              </div>
            )}
            <div>
              Current Status: <RoomStatusBadge status={room.status as any} />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="history">Item History</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <RoomInventoryTab items={items || []} />
          </TabsContent>

          <TabsContent value="history">
            <RoomHistoryTab itemHistory={itemHistory || []} />
          </TabsContent>

          <TabsContent value="activity">
            <RoomActivityTab activityLogs={activityLogs || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RoomOverview;