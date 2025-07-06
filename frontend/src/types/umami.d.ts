// This tells TypeScript that the global Window interface has an optional 'umami' property.
interface Window {
    umami?: {
      track: (event: string, data?: Record<string, any>) => void;
      // You can add definitions for other Umami functions here if you use them
    };
  }