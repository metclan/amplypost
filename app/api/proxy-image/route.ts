export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = decodeURIComponent(searchParams.get('url') || '');

    if (!imageUrl.includes('cdninstagram.com')) {
        return new Response('Invalid URL', { status: 403 });
    }

    const response = await fetch(imageUrl, {
        headers: {
            'Referer': 'https://www.instagram.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
    });

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
        headers: {
            'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
