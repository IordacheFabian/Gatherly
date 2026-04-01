import activityHiking from "@/assets/activity-hiking.jpg";
import activityYoga from "@/assets/activity-yoga.jpg";
import activityBasketball from "@/assets/activity-basketball.jpg";
import activityCooking from "@/assets/activity-cooking.jpg";
import activityMusic from "@/assets/activity-music.jpg";
import activityCycling from "@/assets/activity-cycling.jpg";

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  participants: number;
  maxParticipants: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isJoined: boolean;
  isOwner: boolean;
  status: "upcoming" | "ongoing" | "completed";
}

export const categories = [
  "All",
  "Sports",
  "Wellness",
  "Music",
  "Food & Drink",
  "Outdoor",
  "Arts",
  "Social",
  "Tech",
];

export const activities: Activity[] = [
  {
    id: "1",
    title: "Mountain Sunrise Hike",
    description: "Join us for a breathtaking sunrise hike through the mountain trails. Perfect for all skill levels with stunning panoramic views at the summit.",
    category: "Outdoor",
    date: "2026-04-05",
    time: "6:00 AM",
    location: "Rocky Mountain Trailhead",
    image: activityHiking,
    participants: 12,
    maxParticipants: 20,
    organizer: { name: "Alex Rivera", avatar: "AR" },
    isJoined: true,
    isOwner: false,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Park Yoga Flow",
    description: "Unwind and connect with your body through a peaceful outdoor yoga session. All levels welcome, mats provided.",
    category: "Wellness",
    date: "2026-04-03",
    time: "7:30 AM",
    location: "Central Park Meadow",
    image: activityYoga,
    participants: 18,
    maxParticipants: 25,
    organizer: { name: "Maya Chen", avatar: "MC" },
    isJoined: false,
    isOwner: false,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Street Basketball Showdown",
    description: "Competitive 3v3 basketball tournament at the urban courts. Bring your A-game and enjoy the thrill of street ball.",
    category: "Sports",
    date: "2026-04-06",
    time: "5:00 PM",
    location: "Downtown Courts",
    image: activityBasketball,
    participants: 8,
    maxParticipants: 12,
    organizer: { name: "Jordan Blake", avatar: "JB" },
    isJoined: false,
    isOwner: true,
    status: "upcoming",
  },
  {
    id: "4",
    title: "Italian Cooking Masterclass",
    description: "Learn authentic Italian pasta-making from scratch. Includes all ingredients, wine pairing, and a full dinner experience.",
    category: "Food & Drink",
    date: "2026-04-08",
    time: "6:30 PM",
    location: "Chef's Kitchen Studio",
    image: activityCooking,
    participants: 6,
    maxParticipants: 10,
    organizer: { name: "Sofia Romano", avatar: "SR" },
    isJoined: true,
    isOwner: false,
    status: "ongoing",
  },
  {
    id: "5",
    title: "Indie Music Night",
    description: "An intimate evening showcasing local indie bands and singer-songwriters. Great vibes, craft drinks, and new discoveries.",
    category: "Music",
    date: "2026-04-10",
    time: "8:00 PM",
    location: "The Velvet Room",
    image: activityMusic,
    participants: 45,
    maxParticipants: 80,
    organizer: { name: "Sam Torres", avatar: "ST" },
    isJoined: false,
    isOwner: false,
    status: "upcoming",
  },
  {
    id: "6",
    title: "Countryside Cycling Tour",
    description: "A scenic 30km ride through beautiful countryside roads. Moderate difficulty, refreshment stops included.",
    category: "Outdoor",
    date: "2026-04-12",
    time: "9:00 AM",
    location: "Greenfield Station",
    image: activityCycling,
    participants: 15,
    maxParticipants: 30,
    organizer: { name: "Alex Rivera", avatar: "AR" },
    isJoined: false,
    isOwner: false,
    status: "upcoming",
  },
];
