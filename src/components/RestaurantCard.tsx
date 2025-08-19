import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, DollarSign, ExternalLink, Shuffle } from 'lucide-react';

export type Restaurant = google.maps.places.PlaceResult;

interface RestaurantCardProps {
  restaurant: Restaurant;
  onTryAgain: () => void;
  hasMoreResults: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onTryAgain, 
  hasMoreResults 
}) => {
  const getPriceLevelDisplay = (level?: number) => {
    if (level === undefined) return null;
    return '$'.repeat(Math.max(1, level));
  };

  const getGoogleMapsUrl = () => {
    const lat = restaurant.geometry?.location?.lat();
    const lng = restaurant.geometry?.location?.lng();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name || '')}&query_place_id=${restaurant.place_id}`;
  };

  const getPhotoUrl = (photo?: google.maps.places.PlacePhoto) => {
    if (!photo) return null;
    return photo.getUrl({ maxWidth: 400 });
  };

  const photoUrl = restaurant.photos?.[0] ? getPhotoUrl(restaurant.photos[0]) : null;

  return (
    <Card className="bg-gradient-card shadow-warm overflow-hidden">
      {photoUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={photoUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl text-foreground leading-tight">
            {restaurant.name || 'Unknown Restaurant'}
          </CardTitle>
          {restaurant.opening_hours?.open_now && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Open Now
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{restaurant.vicinity || 'Address not available'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {restaurant.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
            
            {restaurant.price_level !== undefined && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-medium text-green-600">
                  {getPriceLevelDisplay(restaurant.price_level)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => window.open(getGoogleMapsUrl(), '_blank')}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Maps
          </Button>
          
          {hasMoreResults && (
            <Button
              onClick={onTryAgain}
              variant="warm"
              className="flex-1"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;