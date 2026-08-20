import { Metadata } from "next";
import CreatePost from "./create-post";

export const metadata: Metadata = {
    title: "Create Post | Amplypost",
    description: "Create and schedule posts for your social media accounts",
};

export default function CreatePostPage() {
    return <CreatePost />;
}
