"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ExpandableInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DynamicInputListProps {
  items: { value: string }[];
  onChange: (items: { value: string }[]) => void;
  placeholder?: string;
}

export function DynamicInputList({ items, onChange, placeholder }: DynamicInputListProps) {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim()) {
      onChange([...items, { value: newItem.trim() }]);
      setNewItem("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Check for enter key in the input field and add item
    const value = e.target.value;
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onChange([...items, { value: value.trim() }]);
        setNewItem("");
      }
      return;
    }
    
    setNewItem(value);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onChange(updatedItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <ExpandableInput
          value={newItem}
          onChange={handleChange}
          placeholder={placeholder || "Add new item"}
          className="flex-1"
          expandAfter={40}
          lined={true}
        />
        <Button 
          type="button" 
          onClick={handleAddItem} 
          variant="outline" 
          className="whitespace-nowrap"
          disabled={!newItem.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 mt-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center bg-gray-50 rounded-md overflow-hidden">
              <div className="flex-1 px-3 py-2 text-sm">
                {item.value}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-full px-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-none"
                onClick={() => handleRemoveItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 