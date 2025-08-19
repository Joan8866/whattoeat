import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Utensils, Coffee, Wine, Zap, DollarSign, MapPin } from 'lucide-react';

export interface Filters {
  priceLevel: string;
  distance: string;
  category: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  disabled: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  disabled 
}) => {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'bar': return <Wine className="w-4 h-4" />;
      case 'meal_takeaway': return <Zap className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const getPriceLevelDisplay = (level: string) => {
    switch (level) {
      case '0': return '$';
      case '1': return '$';
      case '2': return '$$';
      case '3': return '$$$';
      case '4': return '$$$$';
      default: return 'Any';
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Find Your Next Meal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price Range</label>
            <Select value={filters.priceLevel} onValueChange={(value) => updateFilter('priceLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="0,1">$ - Budget Friendly</SelectItem>
                <SelectItem value="2">$$ - Moderate</SelectItem>
                <SelectItem value="3">$$$ - Expensive</SelectItem>
                <SelectItem value="4">$$$$ - Very Expensive</SelectItem>
              </SelectContent>
            </Select>
            {filters.priceLevel !== 'any' && (
              <Badge variant="secondary" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                {getPriceLevelDisplay(filters.priceLevel)}
              </Badge>
            )}
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Distance</label>
            <Select value={filters.distance} onValueChange={(value) => updateFilter('distance', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Within 1km" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">Within 500m</SelectItem>
                <SelectItem value="1000">Within 1km</SelectItem>
                <SelectItem value="2000">Within 2km</SelectItem>
                <SelectItem value="5000">Within 5km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Restaurant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Restaurant
                  </div>
                </SelectItem>
                <SelectItem value="cafe">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    Cafe
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <Wine className="w-4 h-4" />
                    Bar
                  </div>
                </SelectItem>
                <SelectItem value="meal_takeaway">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Fast Food
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              {getCategoryIcon(filters.category)}
              <span className="ml-1 capitalize">{filters.category}</span>
            </Badge>
          </div>
        </div>

        <Button 
          onClick={onSearch}
          disabled={disabled}
          variant="hero"
          className="w-full text-lg py-6"
        >
          {disabled ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Finding restaurants...
            </div>
          ) : (
            "🍴 Let's Eat!"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;