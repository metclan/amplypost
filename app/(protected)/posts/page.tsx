import type { Metadata } from "next";

import PostsClient from "./posts-client";

export const metadata: Metadata = {
    title: "Posts | Amplypost",
    description: "View and filter posts across connected social platforms.",
};

export default function PostsPage() {
    return <PostsClient />;
}
