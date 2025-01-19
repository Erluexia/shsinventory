import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useInventoryActions = (roomId: string) => {
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
      return true;
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEditItem = async (itemId: string, values: any) => {
    try {
      const { error } = await supabase
        .from("items")
        .update(values)
        .eq("id", itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      toast({ title: "Item updated successfully" });
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      toast({ title: "Item deleted successfully" });
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleCreateItem,
    handleEditItem,
    handleDeleteItem,
  };
};