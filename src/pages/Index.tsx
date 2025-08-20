import React, { useState } from 'react';
import GoogleMap from '@/components/GoogleMap';
import FilterPanel, { Filters } from '@/components/FilterPanel';
import RestaurantCard, { Restaurant } from '@/components/RestaurantCard';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    priceLevel: [],
    distance: '1000',
    category: 'restaurant'
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedRestaurants, setUsedRestaurants] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const searchNearbyRestaurants = async () => {
    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map first.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setCurrentRestaurant(null);
    setUsedRestaurants(new Set());

    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request: google.maps.places.PlaceSearchRequest = {
        location: selectedLocation,
        radius: parseInt(filters.distance),
        type: filters.category,
        openNow: true
      };

      // Add price level filter if specified
      if (filters.priceLevel.length > 0) {
        const levels = filters.priceLevel.map(Number).sort();
        request.minPriceLevel = levels[0];
        request.maxPriceLevel = levels[levels.length - 1];
      }

      service.nearbySearch(request, (results, status) => {
        console.log('Places API response:', { status, resultsCount: results?.length });
        setIsSearching(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          console.log('Found restaurants:', results.length);
          setRestaurants(results as Restaurant[]);
          const randomRestaurant = results[Math.floor(Math.random() * results.length)] as Restaurant;
          setCurrentRestaurant(randomRestaurant);
          setUsedRestaurants(new Set([randomRestaurant.place_id]));
        } else {
          console.log('No restaurants found. Status:', status);
          setRestaurants([]);
          setCurrentRestaurant(null);
          
          // Try without the openNow filter as fallback
          if (request.openNow) {
            console.log('Retrying without openNow filter...');
            const fallbackRequest = { ...request };
            delete fallbackRequest.openNow;
            
            service.nearbySearch(fallbackRequest, (fallbackResults, fallbackStatus) => {
              if (fallbackStatus === google.maps.places.PlacesServiceStatus.OK && fallbackResults && fallbackResults.length > 0) {
                console.log('Found restaurants without openNow filter:', fallbackResults.length);
                setRestaurants(fallbackResults as Restaurant[]);
                const randomRestaurant = fallbackResults[Math.floor(Math.random() * fallbackResults.length)] as Restaurant;
                setCurrentRestaurant(randomRestaurant);
                setUsedRestaurants(new Set([randomRestaurant.place_id]));
              } else {
                toast({
                  title: "No Results",
                  description: "No restaurants found matching your criteria. Try adjusting your filters or expanding the search radius.",
                  variant: "destructive"
                });
              }
            });
          } else {
            toast({
              title: "No Results", 
              description: "No restaurants found matching your criteria. Try adjusting your filters or expanding the search radius.",
              variant: "destructive"
            });
          }
        }
      });
    } catch (error) {
      setIsSearching(false);
      console.error('Error searching restaurants:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for restaurants. Please try again.",
        variant: "destructive"
      });
    }
  };

  const tryAnotherRestaurant = () => {
    const availableRestaurants = restaurants.filter(r => !usedRestaurants.has(r.place_id));
    
    if (availableRestaurants.length > 0) {
      const randomRestaurant = availableRestaurants[Math.floor(Math.random() * availableRestaurants.length)];
      setCurrentRestaurant(randomRestaurant);
      setUsedRestaurants(prev => new Set([...prev, randomRestaurant.place_id]));
    } else {
      // All restaurants have been shown, reset and pick from all
      setUsedRestaurants(new Set());
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      setCurrentRestaurant(randomRestaurant);
      setUsedRestaurants(new Set([randomRestaurant.place_id]));
    }
  };

  const hasMoreResults = restaurants.length > usedRestaurants.size;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            What to EAT!
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover your next delicious meal randomly! 🎲🍽️
          </p>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <GoogleMap 
            onLocationSelect={setSelectedLocation}
            selectedLocation={selectedLocation}
          />
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={searchNearbyRestaurants}
            disabled={isSearching || !selectedLocation}
          />
        </div>

        {/* Results Section */}
        <div>
          {!selectedLocation ? (
            <EmptyState type="no-location" />
          ) : currentRestaurant ? (
            <RestaurantCard
              restaurant={currentRestaurant}
              onTryAgain={tryAnotherRestaurant}
              hasMoreResults={hasMoreResults}
            />
          ) : !isSearching && restaurants.length === 0 && selectedLocation ? (
            <EmptyState type="no-results" />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Index;
