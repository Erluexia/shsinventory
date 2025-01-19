import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItemFormDialog } from "./ItemFormDialog";
import { ItemTable } from "./inventory/ItemTable";
import { useInventoryActions } from "./inventory/useInventoryActions";

export const RoomInventoryTab = ({ items, roomId }: { items: any[]; roomId: string }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { handleCreateItem } = useInventoryActions(roomId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Item</Button>
      </div>

      <ItemTable items={items} />

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