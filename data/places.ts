// data/places.ts

export type Place = {
    id: string;                                
    name: string;
    city: string;
    state: string;
    country: string;
    tags: string[];                                              
    avgCostDay: number;
    photos: string[];
    lat: number;
    lon: number;
  };
  
  export const PLACES: Place[] = [
    {
      id: "manali",
      name: "Manali",
      city: "Manali",
      state: "Himachal Pradesh",
      country: "India",
      tags: ["Mountains", "Roadtrips", "Offbeat"],
      avgCostDay: 2500,
      lat: 32.2432,
      lon: 77.1892,
      photos: [
        "https://images.pexels.com/photos/127629/pexels-photo-127629.jpeg",
        "https://images.pexels.com/photos/2902935/pexels-photo-2902935.jpeg",
      ],
    },
    {
      id: "goa",
      name: "Goa",
      city: "Calangute",
      state: "Goa",
      country: "India",
      tags: ["Beaches", "Nightlife", "Roadtrips"],
      avgCostDay: 3200,
      lat: 15.5439,
      lon: 73.7553,
      photos: [
        "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
        "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg",
      ],
    },
    {
      id: "jaipur",
      name: "Jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      tags: ["History & Culture", "City breaks"],
      avgCostDay: 2000,
      lat: 26.9124,
      lon: 75.7873,
      photos: [
        "https://images.pexels.com/photos/1321624/pexels-photo-1321624.jpeg",
        "https://images.pexels.com/photos/3568444/pexels-photo-3568444.jpeg",
      ],
    },
    {
      id: "coorg",
      name: "Coorg",
      city: "Madikeri",
      state: "Karnataka",
      country: "India",
      tags: ["Mountains", "Wildlife", "Offbeat"],
      avgCostDay: 2800,
      lat: 12.4244,
      lon: 75.7382,
      photos: [
        "https://images.pexels.com/photos/240320/pexels-photo-240320.jpeg",
        "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
      ],
    },
  ];
