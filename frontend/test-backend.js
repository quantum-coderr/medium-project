import axios from 'axios';

async function testBackend() {
    const backendUrl = "https://backend.rohansingh.workers.dev";
    
    // 1. Sign in to get a token
    console.log("Signing in as user...");
    try {
        const signinRes = await axios.post(`${backendUrl}/api/v1/auth/signin`, {
            email: "test@domain.com", // You might need to change this if this user doesn't exist
            password: "password123"
        });
        const token = signinRes.data.data.jwt;
        console.log("Got token.");

        // 2. Fetch the logged-in user to see ID
        const userRes = await axios.get(`${backendUrl}/api/v1/user/me`, {
            headers: { Authorization: token }
        });
        const userId = userRes.data.data.id;
        console.log(`Logged in user ID: ${userId}`);

        // 3. Fetch blogs and grab the first one
        const bulkRes = await axios.get(`${backendUrl}/api/v1/blog/bulk`, {
            headers: { Authorization: token }
        });
        const posts = bulkRes.data.data.posts;
        if (posts.length === 0) {
            console.log("No posts found.");
            return;
        }
        
        const firstPostId = posts[0].id;
        console.log(`Fetching post ID: ${firstPostId}...`);

        // 4. Fetch the single post and check for authorId
        const postRes = await axios.get(`${backendUrl}/api/v1/blog/${firstPostId}`, {
            headers: { Authorization: token }
        });
        
        const post = postRes.data.data.post;
        console.log(JSON.stringify(post, null, 2));
        
        if (post.authorId !== undefined) {
             console.log("SUCCESS: authorId is present on the post!");
             console.log(`authorId: ${post.authorId}, Type: ${typeof post.authorId}`);
        } else {
             console.log("FAIL: authorId is missing from the post response.");
        }

    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
    }
}

testBackend();
