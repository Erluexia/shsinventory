import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItemFormDialog } from "./ItemFormDialog";
import { ItemTable } from "./inventory/ItemTable";
import { DeleteConfirmDialog } from "./inventory/DeleteConfirmDialog";
import { useInventoryActions } from "./inventory/useInventoryActions";

export const RoomInventoryTab = ({ items, roomId }: { items: any[]; roomId: string }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { handleCreateItem, handleEditItem, handleDeleteItem } = useInventoryActions(roomId);

  const onEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const onDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    await handleDeleteItem(selectedItem.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Item</Button>
      </div>

      <ItemTable 
        items={items} 
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ItemFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (values) => {
          await handleCreateItem(values);
        }}
        mode="create"
      />

      <ItemFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={async (values) => {
          await handleEditItem(selectedItem?.id, values);
        }}
        initialValues={selectedItem}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};