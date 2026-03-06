import { Appbar } from "../components/Appbar"
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton"
import { useUser } from "../hooks"
import { useEffect, useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Blog } from "../hooks"

export const Profile = () => {
    const { loading: userLoading, user } = useUser();
    const [publishedPosts, setPublishedPosts] = useState<Blog[]>([]);
    const [drafts, setDrafts] = useState<Blog[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [draftsLoading, setDraftsLoading] = useState(true);
    
    // Pagination state
    const [publishedPage, setPublishedPage] = useState(1);
    const [draftsPage, setDraftsPage] = useState(1);
    const [publishedPagination, setPublishedPagination] = useState<{ currentPage: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; totalCount: number } | null>(null);
    const [draftsPagination, setDraftsPagination] = useState<{ currentPage: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; totalCount: number } | null>(null);

    // Tab state: 'published' or 'drafts'
    const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

    // Fetch both published posts and drafts on load
    useEffect(() => {
        if (!user) return;
        const headers = { Authorization: localStorage.getItem("token") };

        setPostsLoading(true);
        // Fetch published
        axios.get(`${BACKEND_URL}/api/v1/user/me/posts?page=${publishedPage}`, { headers })
            .then(response => {
                setPublishedPosts(response.data.data.posts);
                setPublishedPagination(response.data.data.pagination);
                setPostsLoading(false);
            })
            .catch(() => setPostsLoading(false));
    }, [user, publishedPage]);

    useEffect(() => {
        if (!user) return;
        const headers = { Authorization: localStorage.getItem("token") };

        setDraftsLoading(true);
        // Fetch drafts
        axios.get(`${BACKEND_URL}/api/v1/user/me/drafts?page=${draftsPage}`, { headers })
            .then(response => {
                setDrafts(response.data.data.posts);
                setDraftsPagination(response.data.data.pagination);
                setDraftsLoading(false);
            })
            .catch(() => setDraftsLoading(false));
    }, [user, draftsPage]);

    if (userLoading || postsLoading) {
        return <div>
            <Appbar />
            <div className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    const currentPosts = activeTab === 'published' ? publishedPosts : drafts;
    const isLoadingTab = activeTab === 'drafts' && draftsLoading;

    return <div>
        <Appbar />

        {/* Profile Header */}
        <div className="flex justify-center pt-8">
            <div className="max-w-screen-md w-full px-4">
                <div className="flex items-center gap-4 pb-6">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{user?.name || "Anonymous"}</div>
                        <div className="text-slate-500">{user?.email}</div>
                        <div className="text-slate-400 text-sm pt-1">
                            {publishedPagination?.totalCount ?? 0} published · {draftsPagination?.totalCount ?? 0} draft{(draftsPagination?.totalCount ?? 0) !== 1 ? "s" : ""} · Joined {new Date(user?.createdAt || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 mt-4 mb-6">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'published'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Published
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === 'published' ? 'bg-green-100' : 'bg-slate-100 text-slate-600'}`}>
                                {publishedPagination?.totalCount ?? publishedPosts.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('drafts')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'drafts'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Drafts
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === 'drafts' ? 'bg-green-100' : 'bg-slate-100 text-slate-600'}`}>
                                {draftsLoading && !draftsPagination ? "…" : (draftsPagination?.totalCount ?? drafts.length)}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Posts List */}
                <div>
                    {isLoadingTab ? (
                        <div className="py-8 text-center text-slate-400">Loading drafts...</div>
                    ) : currentPosts.length > 0 ? (
                        currentPosts.map(post => (
                            <div key={post.id} className="relative group">
                                <BlogCard
                                    id={post.id}
                                    authorName={post.author?.name || "Anonymous"}
                                    title={post.title}
                                    content={post.content}
                                    publishedDate={new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                />
                                {activeTab === 'drafts' && (
                                    <div className="absolute top-4 right-4 pointer-events-none">
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-200">
                                            Draft
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-slate-400 pt-8 text-center bg-slate-50 rounded-lg p-12 border border-slate-100">
                            <span className="text-4xl mb-3 block">📝</span>
                            {activeTab === 'published' 
                                ? "You haven't published any stories yet." 
                                : "You don't have any saved drafts."}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {activeTab === 'published' && publishedPagination && publishedPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-8 pb-16">
                        <button
                            onClick={() => setPublishedPage(p => Math.max(1, p - 1))}
                            disabled={!publishedPagination.hasPrevPage || postsLoading}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-slate-500 text-sm font-medium">
                            Page {publishedPagination.currentPage} of {publishedPagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPublishedPage(p => Math.min(publishedPagination.totalPages, p + 1))}
                            disabled={!publishedPagination.hasNextPage || postsLoading}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                {activeTab === 'drafts' && draftsPagination && draftsPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-8 pb-16">
                        <button
                            onClick={() => setDraftsPage(p => Math.max(1, p - 1))}
                            disabled={!draftsPagination.hasPrevPage || draftsLoading}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-slate-500 text-sm font-medium">
                            Page {draftsPagination.currentPage} of {draftsPagination.totalPages}
                        </span>
                        <button
                            onClick={() => setDraftsPage(p => Math.min(draftsPagination.totalPages, p + 1))}
                            disabled={!draftsPagination.hasNextPage || draftsLoading}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
}
