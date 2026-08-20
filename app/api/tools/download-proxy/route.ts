import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const mediaUrl = searchParams.get('url')
    const filename = searchParams.get('filename')

    if (!mediaUrl) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    try {
        const response = await fetch(mediaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.instagram.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
        })

        if (!response.ok) {
            console.error(`[download-proxy] CDN returned ${response.status} for ${mediaUrl}`)
            return NextResponse.json({ error: `CDN error: ${response.status}` }, { status: response.status })
        }

        const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
        const buffer = await response.arrayBuffer()

        const headers: Record<string, string> = {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
        }

        if (filename) {
            headers['Content-Disposition'] = `attachment; filename="${filename}"`
        }

        return new NextResponse(buffer, {
            status: 200,
            headers,
        })
    } catch (err) {
        console.error('[download-proxy] fetch error:', err)
        return NextResponse.json({ error: 'Failed to proxy media' }, { status: 500 })
    }
}
