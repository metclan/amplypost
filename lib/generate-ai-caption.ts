export type CaptionPostType = "image" | "short-video" | "long-video" | "text";

interface GenerateAICaptionParams {
    prompt: string;
    postType: CaptionPostType;
    existingCaption?: string;
}

interface GenerateAICaptionResponse {
    text?: string;
    error?: string;
}

export async function generateAICaption({
    prompt,
    postType,
    existingCaption,
}: GenerateAICaptionParams): Promise<string> {
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            postType,
            existingCaption,
        }),
    });

    const data = (await response.json()) as GenerateAICaptionResponse;

    if (!response.ok) {
        throw new Error(data.error || "Failed to generate caption.");
    }

    if (!data.text?.trim()) {
        throw new Error("No caption was generated.");
    }

    return data.text.trim();
}
