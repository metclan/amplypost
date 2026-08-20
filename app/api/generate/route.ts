import { GoogleGenerativeAI } from "@google/generative-ai";

type PostType = "image" | "short-video" | "long-video" | "text";

const postTypeLabels: Record<PostType, string> = {
    image: "image post",
    "short-video": "short video post",
    "long-video": "long video post",
    text: "text post",
};

function isValidPostType(value: string): value is PostType {
    return Object.hasOwn(postTypeLabels, value);
}

function buildPrompt(userPrompt: string, postType: PostType, existingCaption?: string) {
    const existingContentSection = existingCaption?.trim()
        ? `Current draft to improve:\n${existingCaption.trim()}\n\n`
        : "";

    if (postType === "text") {
        return [
            "You are an expert social media writer.",
            "Write one text-only social media post.",
            "Rules:",
            "- Return only the post text.",
            "- Do not write a caption.",
            "- Do not include labels like 'Caption:' or 'Post:'.",
            "- Keep it clear, engaging, and natural.",
            "- Maximum length: 2200 characters.",
            "- Do not include markdown formatting.",
            "",
            existingContentSection,
            "User prompt:",
            userPrompt.trim(),
        ].join("\n");
    }

    return [
        "You are an expert social media caption writer.",
        `Write one caption for a ${postTypeLabels[postType]}.`,
        "Rules:",
        "- Return only the caption text.",
        "- Keep it clear, engaging, and natural.",
        "- Maximum length: 2200 characters.",
        "- Do not include markdown formatting.",
        "",
        existingContentSection,
        "User prompt:",
        userPrompt.trim(),
    ].join("\n");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
        const postTypeRaw = typeof body?.postType === "string" ? body.postType : "text";
        const existingCaption =
            typeof body?.existingCaption === "string" ? body.existingCaption : undefined;

        if (!prompt) {
            return Response.json({ error: "Prompt is required." }, { status: 400 });
        }

        if (!isValidPostType(postTypeRaw)) {
            return Response.json({ error: "Invalid post type." }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return Response.json({ error: "AI generation is not configured." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const instruction = buildPrompt(prompt, postTypeRaw, existingCaption);

        const result = await model.generateContent(instruction);
        const text = result.response.text().trim();

        if (!text) {
            return Response.json({ error: "No text was generated." }, { status: 502 });
        }

        return Response.json({ text });
    } catch (error) {
        console.error("Generation failed:", error);
        return Response.json({ error: "Failed to generate text." }, { status: 500 });
    }
}
