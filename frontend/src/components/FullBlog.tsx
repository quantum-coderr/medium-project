import { Blog, useUser } from "../hooks"
import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useState } from "react"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const isAuthor = !!user && !!blog.authorId && user.id === blog.authorId;
    const [published, setPublished] = useState(blog.published);
    const [toggling, setToggling] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${blog.id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            navigate("/blogs");
        } catch (e) {
            alert("Failed to delete post");
            console.error(e);
        }
    }

    async function handleTogglePublish() {
        setToggling(true);
        try {
            const res = await axios.put(`${BACKEND_URL}/api/v1/blog/${blog.id}/publish`, {}, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            setPublished(res.data.data.published);
        } catch (e) {
            alert("Failed to toggle publish status");
            console.error(e);
        } finally {
            setToggling(false);
        }
    }

    const formattedDate = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
        : "";

    const wordCount = blog.content.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return <div>
        <Appbar />
        <div className="flex justify-center">
            <div className="grid grid-cols-12 px-10 w-full max-w-screen-xl pt-12 gap-8">
                <div className="col-span-8">
                    <div className="text-5xl font-extrabold text-slate-900 leading-tight">
                        {blog.title}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 pt-3 text-sm">
                        {formattedDate && <span>{formattedDate}</span>}
                        <span>·</span>
                        <span>{readTime} min read</span>
                        {published !== undefined && (
                            <>
                                <span>·</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {published ? "Published" : "Draft"}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="pt-6 text-slate-700 leading-relaxed text-lg">
                        {blog.content}
                    </div>

                    {/* Author-only controls */}
                    {isAuthor && (
                        <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={handleTogglePublish}
                                disabled={toggling}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                    published
                                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100'
                                        : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                                }`}
                            >
                                {toggling ? "Updating..." : published ? "Unpublish" : "Publish"}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Author sidebar */}
                <div className="col-span-4">
                    <div className="bg-slate-50 rounded-xl p-6">
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">
                            Author
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar size="big" name={blog.author?.name || "U"} />
                            <div>
                                <div className="text-lg font-bold text-slate-800">
                                    {blog.author?.name || "Anonymous"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}