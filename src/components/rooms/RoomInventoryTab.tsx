import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ItemFormDialog } from "./ItemFormDialog";
import { ItemTable } from "./inventory/ItemTable";
import { useInventoryActions } from "./inventory/useInventoryActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw } from "lucide-react";

interface RoomInventoryTabProps {
  items: any[];
  roomId: string;
  isLoading?: boolean;
}

export const RoomInventoryTab = ({ items, roomId, isLoading }: RoomInventoryTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { handleCreateItem } = useInventoryActions(roomId);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    console.log("Manual refresh triggered");
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["items", roomId] }),
        queryClient.invalidateQueries({ queryKey: ["activity-logs", roomId] })
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, roomId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Item</Button>
      </div>

      <ItemTable items={items} roomId={roomId} />

      <ItemFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (values) => {
          const success = await handleCreateItem(values);
          if (success && isMobile) {
            // Force refresh on mobile after successful creation
            await handleRefresh();
          }
        }}
        mode="create"
      />
    </div>
  );
};