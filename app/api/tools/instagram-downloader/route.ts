import { resolveInstagramUrl } from '@/util/tools'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(request: NextRequest) {
    const { url } = await request.json();
    try {
        if (!url) {
            return NextResponse.json({ error: 'Video url not provided' }, { status: 400 })
        }
        const videoUrl = await resolveInstagramUrl(url);
        return NextResponse.json({ data: videoUrl })
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'Failed to resolve video' }, { status: 500 })
    }
}