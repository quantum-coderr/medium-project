import { Avatar } from "./BlogCard"
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useUser } from "../hooks"
import { useState, useRef, useEffect } from "react"

export const Appbar = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLDivElement>(null);

    const isOnBlogsPage = location.pathname === "/blogs";
    const [searchParams] = useSearchParams();

    // Pre-fill search from URL if on blogs page
    useEffect(() => {
        if (isOnBlogsPage) {
            setSearch(searchParams.get("search") || "");
        }
    }, [isOnBlogsPage, searchParams]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) {
                setHamburgerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent body scroll when hamburger is open
    useEffect(() => {
        if (hamburgerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [hamburgerOpen]);

    return <div className="border-b border-slate-200 flex justify-between items-center px-6 md:px-10 py-4 bg-white">
        
        {/* Overlay for Hamburger Menu */}
        {hamburgerOpen && (
            <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" aria-hidden="true" />
        )}

        {/* Sliding Hamburger Drawer */}
        <div 
            ref={hamburgerRef}
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                hamburgerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xl font-bold text-slate-800">Menu</span>
                <button 
                    onClick={() => setHamburgerOpen(false)} 
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="py-4 flex flex-col gap-1">
                <Link
                    to="/blogs"
                    onClick={() => setHamburgerOpen(false)}
                    className={`block px-6 py-3 text-sm transition-colors ${location.pathname === '/blogs' ? 'text-green-600 bg-green-50 font-semibold border-r-4 border-green-500' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🏠</span> Home Feed
                    </div>
                </Link>
                <Link
                    to="/profile"
                    onClick={() => setHamburgerOpen(false)}
                    className={`block px-6 py-3 text-sm transition-colors ${location.pathname === '/profile' ? 'text-green-600 bg-green-50 font-semibold border-r-4 border-green-500' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">👤</span> My Profile
                    </div>
                </Link>
                <Link
                    to="/publish"
                    onClick={() => setHamburgerOpen(false)}
                    className={`block px-6 py-3 text-sm transition-colors ${location.pathname === '/publish' ? 'text-green-600 bg-green-50 font-semibold border-r-4 border-green-500' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✍️</span> Write Story
                    </div>
                </Link>
            </div>

            <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/signin");
                    }}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <span className="text-lg">🚪</span> Sign Out
                </button>
            </div>
        </div>

        {/* Left: Hamburger Button + Logo */}
        <div className="flex items-center gap-4">
            <button
                onClick={() => setHamburgerOpen(true)}
                className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Open Menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <Link to={'/blogs'} className="text-xl font-bold text-slate-800 hover:text-slate-600 transition-colors">
                ☁️ CloudQuill
            </Link>
        </div>

        {/* Center: Search Bar — only on /blogs */}
        {isOnBlogsPage && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && search.trim()) {
                                navigate(`/blogs?search=${encodeURIComponent(search.trim())}`);
                            } else if (e.key === "Enter" && !search.trim()) {
                                navigate("/blogs");
                            }
                        }}
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 focus:bg-white transition-all shadow-sm"
                    />
                </div>
            </div>
        )}

        {/* Right: Write + Avatar dropdown */}
        <div className="flex items-center gap-4">
            <Link to={`/publish`} className="hidden sm:block">
                <button type="button" className="text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 font-medium rounded-full text-sm px-5 py-2.5 transition-all shadow-sm flex items-center gap-2">
                    <span>Write</span>
                </button>
            </Link>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full transition-shadow">
                    <Avatar size={"big"} name={user?.name || "U"} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ""}</p>
                        </div>
                        
                        <div className="py-1">
                            <Link
                                to="/profile"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors font-medium"
                            >
                                <span className="text-base">👤</span>
                                User Profile
                            </Link>
                            <Link
                                to="/publish"
                                onClick={() => setDropdownOpen(false)}
                                className="sm:hidden flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors font-medium"
                            >
                                <span className="text-base">✍️</span>
                                Write Story
                            </Link>
                        </div>

                        <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate("/signin");
                                }}
                                className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <span className="text-base">🚪</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
}