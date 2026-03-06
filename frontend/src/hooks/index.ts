import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
    id: number;
    title: string;
    content: string;
    published: boolean;
    createdAt: string;
    authorId: number;
    author: {
        name: string;
    };
}

export interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    postCount: number;
}

// Fetch a single blog post by ID
export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.data.post);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }
}

// Fetch paginated blog feed
export const useBlogs = (page: number = 1) => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [pagination, setPagination] = useState<{
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    } | null>(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk?page=${page}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlogs(response.data.data.posts);
                setPagination(response.data.data.pagination);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [page])

    return {
        loading,
        blogs,
        pagination
    }
}

// Fetch the current logged-in user's profile
export const useUser = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get(`${BACKEND_URL}/api/v1/user/me`, {
            headers: {
                Authorization: token
            }
        })
            .then(response => {
                setUser(response.data.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            })
    }, [])

    return {
        loading,
        user
    }
}