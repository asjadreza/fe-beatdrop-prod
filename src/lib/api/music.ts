import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Music {
  id: string;
  title: string;
  musicFile: string;
  musicPoster?: string;
  artistId: string;
  likes: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  artist?: {
    id: string;
    username: string;
    fullname: string;
    userProfilePic?: string;
  };
}

export interface UploadMusicData {
  title: string;
  musicFile: File;
  musicPoster?: File;
}

export interface EditMusicData {
  title: string;
  musicFile?: File;
  musicPoster?: File;
}

// Get all music
export const getAllMusic = async (): Promise<Music[]> => {
  const response = await axios.get<{ music: Music[] }>(`${API_URL}/music`);
  return response.data.music;
};

// Get music by ID
export const getMusicById = async (id: string): Promise<Music> => {
  const response = await axios.get<{ music: Music }>(`${API_URL}/music/${id}`);
  return response.data.music;
};

// Upload music
export const uploadMusic = async (data: UploadMusicData, token: string): Promise<Music> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('musicFile', data.musicFile);
  
  if (data.musicPoster) {
    formData.append('musicPoster', data.musicPoster);
  }

  const response = await axios.post<{ message: string; music: Music }>(
    `${API_URL}/music`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.music;
};

// Edit music
export const editMusic = async (id: string, data: EditMusicData, token: string): Promise<Music> => {
  const formData = new FormData();
  formData.append('title', data.title);
  
  if (data.musicFile) {
    formData.append('musicFile', data.musicFile);
  }
  
  if (data.musicPoster) {
    formData.append('musicPoster', data.musicPoster);
  }

  const response = await axios.put<{ message: string; music: Music }>(
    `${API_URL}/music/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.music;
};

// Like or unlike music
export const toggleLikeMusic = async (id: string, token: string): Promise<Music> => {
  const response = await axios.post<{ message: string; music: Music }>(
    `${API_URL}/music/${id}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.music;
};

// Delete music
export const deleteMusic = async (id: string, token: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/music/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

// Get music by artist ID (not directly in API, constructed as a filter client-side)
export const getMusicByArtist = async (artistId: string): Promise<Music[]> => {
  const allMusic = await getAllMusic();
  return allMusic.filter(music => music.artist?.id === artistId);
};

// Get user's uploaded music (client-side filter based on logged-in user)
export const getMyUploads = async (userId: string): Promise<Music[]> => {
  const allMusic = await getAllMusic();
  return allMusic.filter(music => music.artistId === userId);
}; 