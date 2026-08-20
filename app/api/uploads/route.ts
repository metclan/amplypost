import { r2 } from "@/lib/r2";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { filename, contentType } = await request.json();
    const key = `media/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
        Bucket: 'amplypost',
        Key: key,
        ContentType: contentType,
    })
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
    return NextResponse.json({ uploadUrl, key, publicUrl: `https://media.amplypost.com/${key}` })
}

export async function DELETE(request: Request) {
    const { key, mediaUrl } = await request.json();
    const objectKey = key || (typeof mediaUrl === "string" ? new URL(mediaUrl).pathname.replace(/^\/+/, "") : "");

    if (!objectKey) {
        return NextResponse.json({ message: "Media key is required." }, { status: 400 });
    }

    await r2.send(new DeleteObjectCommand({
        Bucket: "amplypost",
        Key: objectKey,
    }));

    return NextResponse.json({ success: true });
}
