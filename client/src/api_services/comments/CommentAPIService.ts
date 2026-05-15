import axios from "axios";
import type { CommentDto, CreateCommentDto } from "../../models/comments/CommentDTO";
import type { ICommentsAPIService } from "./ICommentAPIService";

const API_URL: string = import.meta.env.VITE_API_URL + "comments";

export const CommentAPIService: ICommentsAPIService = {
  async getCommentsByPostId(postId: number, token: string): Promise<CommentDto[]> {
    try {
      const res = await axios.get(`${API_URL}/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  async addComment(postId: number, data: CreateCommentDto, token: string): Promise<CommentDto> {
    const res = await axios.post(`${API_URL}/posts/${postId}/comments`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || "Failed to add comment");
  },

  async updateComment(id: number, content: string, token: string): Promise<CommentDto> {
    const res = await axios.put(`${API_URL}/comments/${id}`, { content }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || "Failed to update comment");
  },

  async deleteComment(id: number, token: string): Promise<void> {
    const res = await axios.delete(`${API_URL}/comments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to delete comment");
    }
  },

  async likeComment(id: number, token: string): Promise<void> {
    const res = await axios.post(`${API_URL}/comments/${id}/like`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to like comment");
    }
  },

  async unlikeComment(id: number, token: string): Promise<void> {
    const res = await axios.post(`${API_URL}/comments/${id}/unlike`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to unlike comment");
    }
  },
};