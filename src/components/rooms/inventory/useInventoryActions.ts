import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useInventoryActions = (roomId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createActivityLog = async (itemId: string, action: string, details: any) => {
    console.log("Creating activity log:", { itemId, action, details });
    
    try {
      const { error } = await supabase
        .from("activity_logs")
        .insert([{
          entity_type: "item",
          entity_id: itemId,
          action,
          details,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) {
        console.error("Error creating activity log:", error);
      }
    } catch (error) {
      console.error("Error in createActivityLog:", error);
    }
  };

  const refreshData = async () => {
    console.log("Refreshing data for room:", roomId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["items", roomId] }),
      queryClient.invalidateQueries({ queryKey: ["activity-logs", roomId] })
    ]);
  };

  const handleCreateItem = async (values: any) => {
    try {
      console.log("Creating item with values:", values);
      
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create items",
          variant: "destructive",
        });
        return false;
      }

      const { data: newItem, error } = await supabase
        .from("items")
        .insert([{ 
          ...values, 
          room_id: roomId,
          created_by: user.id, // Set the created_by field
          maintenance_quantity: values.maintenance_quantity || 0,
          replacement_quantity: values.replacement_quantity || 0
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create item",
          variant: "destructive",
        });
        return false;
      }

      await createActivityLog(newItem.id, "created", {
        name: values.name,
        quantity: values.quantity,
        maintenance_quantity: values.maintenance_quantity,
        replacement_quantity: values.replacement_quantity
      });

      await refreshData();
      
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
          replacement_quantity: values.replacement_quantity || 0,
          updated_at: new Date().toISOString()
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

      await createActivityLog(itemId, "updated", {
        name: values.name,
        quantity: values.quantity,
        maintenance_quantity: values.maintenance_quantity,
        replacement_quantity: values.replacement_quantity
      });

      await refreshData();
      
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
      
      // Get item details before deletion for activity log
      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

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

      if (itemData) {
        await createActivityLog(itemId, "deleted", {
          name: itemData.name,
          quantity: itemData.quantity,
          maintenance_quantity: itemData.maintenance_quantity,
          replacement_quantity: itemData.replacement_quantity
        });
      }

      await refreshData();
      
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