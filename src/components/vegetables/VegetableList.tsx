
import React from "react";
import { Button } from "@/components/ui/button";
import { Vegetable } from "@/types/vegetable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VegetableListProps {
  vegetables: Vegetable[];
  onEdit: (vegetable: Vegetable) => void;
  onDelete: (vegetableId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const VegetableList: React.FC<VegetableListProps> = ({
  vegetables,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
}) => {
  // Filter vegetables based on search query
  const filteredVegetables = vegetables.filter((vegetable) =>
    vegetable.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vegetable List</CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vegetables..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredVegetables.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVegetables.map((vegetable) => (
                  <TableRow key={vegetable.id}>
                    <TableCell className="font-medium">{vegetable.name}</TableCell>
                    <TableCell>₹{vegetable.price.toFixed(2)}</TableCell>
                    <TableCell>{vegetable.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(vegetable)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(vegetable.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No vegetables match your search"
                : "No vegetables found. Add your first vegetable!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VegetableList;
