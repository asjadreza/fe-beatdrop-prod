import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  userId: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    music: number;
  };
  music?: PlaylistMusic[];
  user?: {
    id: string;
    username: string;
    fullname: string;
    userProfilePic?: string;
  };
}

export interface PlaylistMusic {
  music: {
    id: string;
    title: string;
    musicFile: string;
    musicPoster?: string;
    duration?: number;
    artist: {
      id: string;
      username: string;
      fullname: string;
    };
  };
}

export interface CreatePlaylistData {
  title: string;
  description?: string;
}

// Create a new playlist
export const createPlaylist = async (data: CreatePlaylistData, token: string): Promise<Playlist> => {
  const response = await axios.post<{ message: string; playlist: Playlist }>(
    `${API_URL}/playlists`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.playlist;
};

// Get all playlists for the logged-in user
export const getMyPlaylists = async (token: string): Promise<Playlist[]> => {
  const response = await axios.get<{ playlists: Playlist[] }>(
    `${API_URL}/playlists/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.playlists;
};

// Get a playlist by ID
export const getPlaylistById = async (id: string): Promise<Playlist> => {
  const response = await axios.get<{ playlist: Playlist }>(
    `${API_URL}/playlists/${id}`
  );
  
  return response.data.playlist;
};

// Add a music track to a playlist
export const addMusicToPlaylist = async (
  playlistId: string,
  musicId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/playlists/add-music`,
    { playlistId, musicId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
}; 