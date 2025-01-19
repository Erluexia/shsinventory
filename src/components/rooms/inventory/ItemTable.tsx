import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ItemTableProps {
  items: any[];
}

export const ItemTable = ({ items }: ItemTableProps) => {
  // Calculate quantities for each item
  const getItemQuantities = (items: any[]) => {
    const quantities = new Map();
    
    items.forEach(item => {
      if (!quantities.has(item.name)) {
        quantities.set(item.name, {
          total: 0,
          needs_maintenance: 0,
          needs_replacement: 0,
          id: item.id
        });
      }
      
      const current = quantities.get(item.name);
      current.total += item.quantity;
      
      if (item.status === 'needs_maintenance') {
        current.needs_maintenance += item.quantity;
      } else if (item.status === 'needs_replacement') {
        current.needs_replacement += item.quantity;
      }
    });
    
    return quantities;
  };

  const itemQuantities = getItemQuantities(items);
  const uniqueItems = Array.from(itemQuantities.entries());

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Needs Maintenance (Quantity)</TableHead>
            <TableHead>Needs Replacement (Quantity)</TableHead>
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
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};