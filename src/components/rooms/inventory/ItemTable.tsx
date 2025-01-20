import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useInventoryActions } from "./useInventoryActions";
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
import { useState } from "react";
import { ItemFormDialog } from "../ItemFormDialog";

interface ItemTableProps {
  items: any[];
  roomId: string;
}

export const ItemTable = ({ items, roomId }: ItemTableProps) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { handleEditItem, handleDeleteItem } = useInventoryActions(roomId);

  const getItemQuantities = (items: any[]) => {
    const quantities = new Map();
    
    items.forEach(item => {
      if (!quantities.has(item.name)) {
        quantities.set(item.name, {
          total: 0,
          needs_maintenance: item.maintenance_quantity || 0,
          needs_replacement: item.replacement_quantity || 0,
          id: item.id,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
      }
      
      const current = quantities.get(item.name);
      current.total += item.quantity;
    });
    
    return quantities;
  };

  const itemQuantities = getItemQuantities(items);
  const uniqueItems = Array.from(itemQuantities.entries());

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Needs Maintenance</TableHead>
              <TableHead>Needs Replacement</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueItems.map(([name, quantities]) => (
              <TableRow key={name}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{quantities.total}</TableCell>
                <TableCell>
                  {quantities.needs_maintenance > 0 ? `${quantities.needs_maintenance} items` : 'None'}
                </TableCell>
                <TableCell>
                  {quantities.needs_replacement > 0 ? `${quantities.needs_replacement} items` : 'None'}
                </TableCell>
                <TableCell>
                  {quantities.updated_at 
                    ? format(new Date(quantities.updated_at), 'MMM d, yyyy HH:mm')
                    : format(new Date(quantities.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      const item = items.find(i => i.id === quantities.id);
                      setSelectedItem(item);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedItem(items.find(i => i.id === quantities.id));
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ItemFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={async (values) => {
          if (selectedItem) {
            await handleEditItem(selectedItem.id, values);
          }
        }}
        mode="edit"
        defaultValues={selectedItem ? {
          name: selectedItem.name,
          quantity: selectedItem.quantity,
          maintenance_quantity: selectedItem.maintenance_quantity,
          replacement_quantity: selectedItem.replacement_quantity,
        } : undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedItem) {
                  await handleDeleteItem(selectedItem.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};