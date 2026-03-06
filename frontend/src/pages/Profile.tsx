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
    const [draftsLoading, setDraftsLoading] = useState(false);
    
    // Tab state: 'published' or 'drafts'
    const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
    const [draftsFetched, setDraftsFetched] = useState(false);

    // Fetch published posts initially
    useEffect(() => {
        if (!user) return;

        axios.get(`${BACKEND_URL}/api/v1/user/me/posts`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setPublishedPosts(response.data.data.posts);
                setPostsLoading(false);
            })
            .catch(() => {
                setPostsLoading(false);
            });
    }, [user]);

    // Fetch drafts when tab is clicked (lazy load)
    useEffect(() => {
        if (activeTab === 'drafts' && !draftsFetched && user) {
            setDraftsLoading(true);
            axios.get(`${BACKEND_URL}/api/v1/user/me/drafts`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })
                .then(response => {
                    setDrafts(response.data.data.posts);
                    setDraftsFetched(true);
                    setDraftsLoading(false);
                })
                .catch(() => {
                    setDraftsLoading(false);
                });
        }
    }, [activeTab, draftsFetched, user]);

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
                            {user?.postCount} published post{user?.postCount !== 1 ? "s" : ""} · Joined {new Date(user?.createdAt || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 mt-4 mb-6 relative">
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
                                {user?.postCount || 0}
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
                            {draftsFetched || activeTab === 'drafts' ? (
                                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === 'drafts' ? 'bg-green-100' : 'bg-slate-100 text-slate-600'}`}>
                                    {drafts.length}
                                </span>
                            ) : null}
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
            </div>
        </div>
    </div>
}
