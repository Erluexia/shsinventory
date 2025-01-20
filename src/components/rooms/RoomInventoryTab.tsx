import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItemFormDialog } from "./ItemFormDialog";
import { ItemTable } from "./inventory/ItemTable";
import { useInventoryActions } from "./inventory/useInventoryActions";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomInventoryTabProps {
  items: any[];
  roomId: string;
  isLoading?: boolean;
}

export const RoomInventoryTab = ({ items, roomId, isLoading }: RoomInventoryTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { handleCreateItem } = useInventoryActions(roomId);

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
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Item</Button>
      </div>

      <ItemTable items={items} roomId={roomId} />

      <ItemFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (values) => {
          await handleCreateItem(values);
        }}
        mode="create"
      />
    </div>
  );
};