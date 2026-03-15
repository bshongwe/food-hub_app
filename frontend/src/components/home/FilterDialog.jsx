import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function FilterDialog({ open, onOpenChange, filters, onFiltersChange }) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      minRating: 0,
      maxDeliveryTime: 120,
      maxDeliveryFee: 100,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Restaurants</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label>Minimum Rating: {localFilters.minRating.toFixed(1)}</Label>
            <Slider
              value={[localFilters.minRating]}
              onValueChange={([value]) => setLocalFilters({...localFilters, minRating: value})}
              max={5}
              step={0.5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Maximum Delivery Fee: ${localFilters.maxDeliveryFee}</Label>
            <Slider
              value={[localFilters.maxDeliveryFee]}
              onValueChange={([value]) => setLocalFilters({...localFilters, maxDeliveryFee: value})}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-orange-500 hover:bg-orange-600">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
