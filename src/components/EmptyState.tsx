import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-location' | 'no-results';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  if (type === 'no-location') {
    return (
      <Card className="bg-gradient-card shadow-card text-center">
        <CardContent className="py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select Your Location</h3>
          <p className="text-muted-foreground mb-6">
            Drop a pin on the map or search for an address to find nearby restaurants.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card text-center">
      <CardContent className="py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Restaurants Found</h3>
        <p className="text-muted-foreground mb-6">
          No open restaurants match your criteria. Try adjusting your filters or expanding your search area.
        </p>
        {onAction && (
          <Button onClick={onAction} variant="warm">
            Adjust Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;