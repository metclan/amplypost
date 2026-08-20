import { resolveYoutubeUrl } from '@/util/tools'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(request: NextRequest) {
    const { url } = await request.json();
    try {
        if (!url) {
            return NextResponse.json({ error: 'Video url not provided' }, { status: 400 })
        }
        const videoUrl = await resolveYoutubeUrl(url);
        return NextResponse.json({ videoUrl })
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'Failed to resolve video' }, { status: 500 })
    }
}