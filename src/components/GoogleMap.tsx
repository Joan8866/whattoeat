import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  selectedLocation: { lat: number; lng: number; address?: string } | null;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ onLocationSelect, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initMap = async () => {
      try {
        // Fetch API key from Supabase edge function
        const response = await fetch('/supabase/functions/v1/get-google-maps-key');
        const data = await response.json();
        
        if (!response.ok || !data.apiKey) {
          throw new Error('Failed to get API key');
        }
        
        const apiKey = data.apiKey;
        console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing');

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
            zoom: 15,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'simplified' }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add click listener to map
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const location = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              onLocationSelect(location);
              updateMarker(location);
            }
          });

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          title: "Map Error",
          description: "Failed to load Google Maps. Please check your API key.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initMap();
  }, [onLocationSelect, toast]);

  const updateMarker = (location: { lat: number; lng: number }) => {
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        title: 'Selected Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'hsl(25, 100%, 55%)',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      mapInstanceRef.current.setCenter(location);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      updateMarker(selectedLocation);
    }
  }, [selectedLocation]);

  const searchLocation = () => {
    if (!searchInput.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const locationData = {
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        };
        onLocationSelect(locationData);
        updateMarker(locationData);
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationSelect(location);
          updateMarker(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Access Denied",
            description: "Please allow location access or search for an address manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please search for an address manually.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={searchLocation} variant="outline">
          <MapPin className="w-4 h-4" />
        </Button>
        <Button onClick={useCurrentLocation} variant="warm">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-80 rounded-lg shadow-card bg-muted"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMap;