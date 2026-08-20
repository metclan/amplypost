import Tiktok from '@tobyg74/tiktok-api-dl';
import { instagramGetUrl } from 'instagram-url-direct';
import ytdl from '@distube/ytdl-core'


export async function resolveTikTokUrl(tiktokUrl: string) {
    const result = await Tiktok.Downloader(tiktokUrl, {
        version: 'v1',
        showOriginalResponse: true,
        proxy: process.env.TIKTOK_PROXY,
    });
    const video = result.resultNotParsed?.content?.video;
    if (!video) throw new Error('No video data found');

    // No watermark - use play_addr
    const noWatermark = video.play_addr?.url_list?.[0];

    // With watermark - use download_addr
    const withWatermark = video.download_addr?.url_list?.[0];

    return {
        noWatermark,
        withWatermark,
        cover: video.cover?.url_list?.[0],
        duration: video.duration,
        width: video.width,
        height: video.height,
    };
}

export async function resolveInstagramUrl(instagramUrl: string) {
    const result = await instagramGetUrl(instagramUrl);
    if (!result) throw new Error('No video data found');
    return result;
}

export async function resolveYoutubeUrl(youtubeUrl: string) {
    const info = await ytdl.getInfo(youtubeUrl);
    const format = ytdl.chooseFormat(info.formats, {
        quality: 'highest',
        filter: 'videoandaudio'
    });
    if (!format) throw new Error('No video data found');
    return {
        downloadUrl: format.url,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails.at(-1)?.url, // highest res thumbnail
        duration: info.videoDetails.lengthSeconds,
        author: info.videoDetails.author.name,
    };
}