import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { ItemFormDialog } from "./ItemFormDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

export const RoomInventoryTab = ({ items, roomId }: { items: any[]; roomId: string }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateItem = async (values: any) => {
    try {
      const { error } = await supabase
        .from("items")
        .insert([{ ...values, room_id: roomId }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      toast({ title: "Item created successfully" });
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (values: any) => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from("items")
        .update(values)
        .eq("id", selectedItem.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      toast({ title: "Item updated successfully" });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      toast({ title: "Item deleted successfully" });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Item</Button>
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
                      {item.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ItemFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateItem}
        mode="create"
      />

      <ItemFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditItem}
        initialValues={selectedItem}
        mode="edit"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              and remove it from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};