import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useInventoryActions = (roomId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateItem = async (values: any) => {
    try {
      console.log("Creating item with values:", values);
      
      // Validate input
      if (!values.name?.trim()) {
        toast({
          title: "Error",
          description: "Item name is required",
          variant: "destructive",
        });
        return false;
      }

      if (values.quantity < 1) {
        toast({
          title: "Error",
          description: "Quantity must be at least 1",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("items")
        .insert([{ 
          ...values, 
          room_id: roomId,
          maintenance_quantity: values.maintenance_quantity || 0,
          replacement_quantity: values.replacement_quantity || 0
        }]);

      if (error) {
        console.error("Error creating item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create item",
          variant: "destructive",
        });
        return false;
      }

      await queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs", roomId] });
      
      toast({
        title: "Success",
        description: "Item created successfully",
      });
      return true;
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEditItem = async (itemId: string, values: any) => {
    try {
      console.log("Editing item with values:", values);
      
      // Validate input
      if (!values.name?.trim()) {
        toast({
          title: "Error",
          description: "Item name is required",
          variant: "destructive",
        });
        return false;
      }

      if (values.quantity < 1) {
        toast({
          title: "Error",
          description: "Quantity must be at least 1",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("items")
        .update({
          ...values,
          maintenance_quantity: values.maintenance_quantity || 0,
          replacement_quantity: values.replacement_quantity || 0
        })
        .eq("id", itemId);

      if (error) {
        console.error("Error updating item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update item",
          variant: "destructive",
        });
        return false;
      }

      await queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs", roomId] });
      
      toast({ 
        title: "Success",
        description: "Item updated successfully" 
      });
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      console.log("Deleting item:", itemId);
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete item",
          variant: "destructive",
        });
        return false;
      }

      await queryClient.invalidateQueries({ queryKey: ["items", roomId] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs", roomId] });
      
      toast({ 
        title: "Success",
        description: "Item deleted successfully" 
      });
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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