export interface Title {
  id: string;
  title: string;
  year: number;
  type: "movie" | "series" | "short";
  duration?: number; // in minutes, for movies/shorts
  rating: number; // 0-10
  ratingCount: number;
  viewCount: number;
  genres: string[];
  moods: string[];
  description: string;
  logline: string;
  posterUrl: string;
  youtubeUrl?: string;
  status: "pending" | "processing" | "completed";
  directorIds: string[];
  producerIds: string[];
  writerIds: string[];
  castIds: string[];
  productionCompany: string;
  aiModel: string;
  aiPrompt?: string;
  generationDate: string;
  tags: string[];
  dominantColor?: string;
  trendingScore?: number;
  releaseDate: string;
  photoIds: string[];
  seasons?: number;
  totalEpisodes?: number;
  episodes?: Episode[];
}

export interface Episode {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  duration: number;
  description: string;
  airDate: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface Director {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  shortBio: string;
  role: "director";
  movieIds: string[];
  totalTitles: number;
  avgRating: number;
  totalViews: number;
  followerCount: number;
  genres: string[];
  frequentCollaborators: string[];
  socialLinks?: {
    website?: string;
    twitter?: string;
  };
  achievements: string[];
}

export interface Person {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  primaryRole: "actor" | "producer" | "writer" | "composer" | "cinematographer";
  credits: {
    titleId: string;
    role: string;
    characterName?: string;
  }[];
  totalCredits: number;
  followerCount: number;
  socialLinks?: {
    website?: string;
    twitter?: string;
  };
}

export interface Photo {
  id: string;
  imageUrl: string;
  titleId: string;
  type: "poster" | "still" | "behind-the-scenes";
  dominantColor: string;
  tags: string[];
  viewCount: number;
  uploadDate: string;
  photographerCredit?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  role: "user" | "moderator" | "admin";
  joinDate: string;
  watchlist: string[];
  ratings: UserRating[];
  lists: UserList[];
  following: { type: "user" | "creator"; id: string }[];
  followers: string[];
  watchProgress: WatchProgress[];
  preferences: {
    notifications: boolean;
    autoplay: boolean;
    quality: string;
  };
}

export interface UserRating {
  titleId: string;
  rating: number;
  review?: string;
  date: string;
}

export interface UserList {
  id: string;
  name: string;
  description: string;
  titleIds: string[];
  isPublic: boolean;
  createdDate: string;
}

export interface WatchProgress {
  titleId: string;
  timestamp: number;
  percentage: number;
  lastWatched: string;
}

export interface Review {
  id: string;
  titleId: string;
  userId: string;
  username: string;
  userAvatarUrl: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  date: string;
  helpfulCount: number;
  reportCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "new_episode" | "new_upload" | "review_like" | "follow" | "trending";
  message: string;
  relatedId?: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

export interface AdminReport {
  id: string;
  contentType: "title" | "review" | "photo" | "user";
  contentId: string;
  reporterId: string;
  reporterUsername: string;
  reason: string;
  reasonCategory: "inappropriate" | "copyright" | "spam" | "other";
  description: string;
  date: string;
  status: "pending" | "dismissed" | "resolved";
  moderatorNotes?: string;
}

export interface ProductionCompany {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  titleIds: string[];
  foundedYear?: number;
}
