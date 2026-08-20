import sharp, { type Sharp } from 'sharp'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif' | 'heif'
type RawChannels = 1 | 2 | 3 | 4

const OUTPUT_MIME: Record<OutputFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    tiff: 'image/tiff',
    gif: 'image/gif',
    heif: 'image/heif',
}

const FORMAT_EXTENSION: Record<OutputFormat, string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
    avif: 'avif',
    tiff: 'tiff',
    gif: 'gif',
    heif: 'heif',
}

const SUPPORTED_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif', 'heif']
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

function asPositiveInt(value: string | null): number | null {
    if (!value) return null
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return parsed
}

function asRawChannels(value: string | null): RawChannels | null {
    const parsed = asPositiveInt(value)
    if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) return parsed
    return null
}

function createSharpInstance(
    inputBuffer: Buffer,
    rawWidth: number | null,
    rawHeight: number | null,
    rawChannels: RawChannels | null
) {
    if (rawWidth && rawHeight && rawChannels) {
        return sharp(inputBuffer, {
            raw: {
                width: rawWidth,
                height: rawHeight,
                channels: rawChannels,
            },
        })
    }
    return sharp(inputBuffer)
}

function convertToFormat(pipeline: Sharp, format: OutputFormat) {
    switch (format) {
        case 'jpeg':
            return pipeline.jpeg({ quality: 80 })
        case 'png':
            return pipeline.png({ compressionLevel: 9 })
        case 'webp':
            return pipeline.webp({ quality: 80 })
        case 'avif':
            return pipeline.avif({ quality: 50 })
        case 'tiff':
            return pipeline.tiff()
        case 'gif':
            return pipeline.gif()
        case 'heif':
            return pipeline.heif()
        default:
            return pipeline
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const formatRaw = formData.get('format')
        const file = formData.get('file')
        const urlRaw = formData.get('url')
        const filenameRaw = formData.get('filename')
        const inputUrl = typeof urlRaw === 'string' ? urlRaw : null

        const format = typeof formatRaw === 'string' ? (formatRaw.toLowerCase() as OutputFormat) : null
        if (!format || !SUPPORTED_FORMATS.includes(format)) {
            return NextResponse.json(
                {
                    error: `Invalid "format". Use one of: ${SUPPORTED_FORMATS.join(', ')}`,
                },
                { status: 400 }
            )
        }

        if (!(file instanceof File) && !inputUrl) {
            return NextResponse.json(
                {
                    error: 'No input provided. Send multipart/form-data with either "file" or "url".',
                },
                { status: 400 }
            )
        }

        let inputArrayBuffer: ArrayBuffer
        let originalFilename = 'converted-image'

        if (file instanceof File) {
            inputArrayBuffer = await file.arrayBuffer()
            originalFilename = file.name || originalFilename
        } else if (inputUrl) {
            const url = inputUrl.trim()
            if (!url) {
                return NextResponse.json({ error: 'Input "url" cannot be empty.' }, { status: 400 })
            }

            const sourceResponse = await fetch(url)
            if (!sourceResponse.ok) {
                return NextResponse.json(
                    { error: `Could not fetch source image. Upstream status: ${sourceResponse.status}` },
                    { status: 400 }
                )
            }

            inputArrayBuffer = await sourceResponse.arrayBuffer()
        } else {
            return NextResponse.json(
                {
                    error: 'No input provided. Send multipart/form-data with either "file" or "url".',
                },
                { status: 400 }
            )
        }

        if (inputArrayBuffer.byteLength > MAX_UPLOAD_BYTES) {
            return NextResponse.json(
                {
                    error: `File is too large. Max upload size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`,
                },
                { status: 413 }
            )
        }

        const rawWidth = asPositiveInt(formData.get('rawWidth')?.toString() ?? null)
        const rawHeight = asPositiveInt(formData.get('rawHeight')?.toString() ?? null)
        const rawChannels = asRawChannels(formData.get('rawChannels')?.toString() ?? null)

        const inputBuffer = Buffer.from(inputArrayBuffer)
        const sharpInput = createSharpInstance(inputBuffer, rawWidth, rawHeight, rawChannels)

        const convertedBuffer = await convertToFormat(sharpInput, format).toBuffer()

        const fallbackName = originalFilename.replace(/\.[^./\\]+$/, '') || 'converted-image'
        const outputNameStem = typeof filenameRaw === 'string' && filenameRaw.trim() ? filenameRaw.trim() : fallbackName
        const outputFilename = `${outputNameStem}.${FORMAT_EXTENSION[format]}`

        return new NextResponse(new Uint8Array(convertedBuffer), {
            status: 200,
            headers: {
                'Content-Type': OUTPUT_MIME[format],
                'Content-Length': convertedBuffer.byteLength.toString(),
                'Content-Disposition': `attachment; filename="${outputFilename}"`,
                'Cache-Control': 'no-store',
            },
        })
    } catch (error) {
        console.error('[convert-image] Failed:', error)
        return NextResponse.json(
            {
                error: 'Failed to convert image. Ensure the input format is readable by Sharp.',
                supportedInputFormats: [
                    'jpeg/jpg',
                    'png',
                    'webp',
                    'avif',
                    'tiff',
                    'gif (first frame only)',
                    'svg (rasterized)',
                    'heif/heic',
                    'raw pixel data (buffer + rawWidth/rawHeight/rawChannels)',
                ],
                supportedOutputFormats: SUPPORTED_FORMATS,
            },
            { status: 500 }
        )
    }
}
