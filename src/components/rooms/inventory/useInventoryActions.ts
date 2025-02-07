
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useInventoryActions = (roomId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createActivityLog = async (itemId: string, action: string, details: any) => {
    console.log("Creating activity log:", { itemId, action, details });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("activity_logs")
        .insert({
          entity_type: "item",
          entity_id: itemId,
          action,
          details: { ...details, room_id: roomId },
          user_id: user.id
        });

      if (error) {
        console.error("Error creating activity log:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in createActivityLog:", error);
      throw error;
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
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create items",
          variant: "destructive",
        });
        return false;
      }

      // Create new item record
      const { data: newItem, error: createError } = await supabase
        .from("items")
        .insert({
          name: values.name,
          quantity: values.quantity,
          room_id: roomId,
          created_by: session.session.user.id,
          maintenance_quantity: values.maintenance_quantity || 0,
          replacement_quantity: values.replacement_quantity || 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating item:", createError);
        toast({
          title: "Error",
          description: createError.message || "Failed to create item",
          variant: "destructive",
        });
        return false;
      }

      if (!newItem) {
        console.error("No item was created");
        toast({
          title: "Error",
          description: "Failed to create item - no data returned",
          variant: "destructive",
        });
        return false;
      }

      console.log("Successfully created item:", newItem);

      await createActivityLog(newItem.id, "created", {
        name: values.name,
        quantity: values.quantity,
        maintenance_quantity: values.maintenance_quantity || 0,
        replacement_quantity: values.replacement_quantity || 0,
        room_id: roomId
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
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to edit items",
          variant: "destructive",
        });
        return false;
      }

      // First verify the item exists and belongs to the room
      const { data: existingItem, error: fetchError } = await supabase
        .from("items")
        .select()
        .eq("id", itemId)
        .eq("room_id", roomId)
        .single();

      if (fetchError || !existingItem) {
        console.error("Error fetching item:", fetchError);
        toast({
          title: "Error",
          description: "Item not found or access denied",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("items")
        .update({
          name: values.name,
          quantity: values.quantity,
          maintenance_quantity: values.maintenance_quantity || 0,
          replacement_quantity: values.replacement_quantity || 0,
        })
        .eq("id", itemId)
        .eq("room_id", roomId);

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
        maintenance_quantity: values.maintenance_quantity || 0,
        replacement_quantity: values.replacement_quantity || 0,
        room_id: roomId
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
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete items",
          variant: "destructive",
        });
        return false;
      }

      // Get item details before deletion for activity log
      const { data: itemData, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .eq("room_id", roomId)
        .single();

      if (fetchError) {
        console.error("Error fetching item details:", fetchError);
        toast({
          title: "Error",
          description: "Failed to fetch item details",
          variant: "destructive",
        });
        return false;
      }

      // Create activity log before deleting the item
      await createActivityLog(itemId, "deleted", {
        name: itemData.name,
        quantity: itemData.quantity,
        maintenance_quantity: itemData.maintenance_quantity,
        replacement_quantity: itemData.replacement_quantity,
        room_id: roomId
      });

      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId)
        .eq("room_id", roomId);

      if (deleteError) {
        console.error("Error deleting item:", deleteError);
        toast({
          title: "Error",
          description: deleteError.message || "Failed to delete item",
          variant: "destructive",
        });
        return false;
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
