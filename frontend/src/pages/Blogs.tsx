import { Appbar } from "../components/Appbar"
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Blog } from "../hooks";

export const Blogs = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // Pagination state
    const [page, setPage] = useState(1);

    // Feed data (used when not searching)
    const { loading: feedLoading, blogs: feedBlogs, pagination } = useBlogs(page);

    // Search data (used when search query exists)
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchBlogs, setSearchBlogs] = useState<Blog[]>([]);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (searchQuery.trim()) {
            setSearchLoading(true);
            setSearched(true);
            axios.get(`${BACKEND_URL}/api/v1/blog/search`, {
                params: { q: searchQuery },
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })
                .then(response => {
                    setSearchBlogs(response.data.data.posts);
                    setSearchLoading(false);
                })
                .catch(() => {
                    setSearchBlogs([]);
                    setSearchLoading(false);
                });
        } else {
            setSearched(false);
            setSearchBlogs([]);
        }
    }, [searchQuery]);

    const loading = searchQuery ? searchLoading : feedLoading;
    const blogs = searchQuery ? searchBlogs : feedBlogs;

    if (loading) {
        return <div>
            <Appbar />
            <div className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />

        {searched && <div className="flex justify-center pt-6">
            <div className="max-w-screen-md w-full px-4">
                <div className="bg-slate-50 rounded-lg px-4 py-3 text-slate-600 text-sm">
                    {blogs.length} result{blogs.length !== 1 ? "s" : ""} for "<span className="font-semibold text-slate-800">{searchQuery}</span>"
                </div>
            </div>
        </div>}

        <div className="flex justify-center">
            <div>
                {Array.isArray(blogs) && blogs.length > 0 ? (
                    blogs.map(blog => <BlogCard
                        key={blog.id}
                        id={blog.id}
                        authorName={blog.author?.name || "Anonymous"}
                        title={blog.title}
                        content={blog.content}
                        publishedDate={formatDate(blog.createdAt)}
                    />)
                ) : (
                    !loading && <div className="text-center text-slate-400 pt-16 text-lg">
                        {searched ? "No posts matched your search." : "No published posts yet."}
                    </div>
                )}
            </div>
        </div>

        {/* Pagination Controls (Only show on normal feed, not search) */}
        {!searched && pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-8 pb-16">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage || loading}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <span className="text-slate-500 text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={!pagination.hasNextPage || loading}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        )}
    </div>
}

function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
