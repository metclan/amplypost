export function renameFileWithTimestamp(file: File) {
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const r2Key = `media/${timestamp}-${sanitizedFilename}`;
    return r2Key;
}

function sanitizeFilename(filename: string): string {
    const ext = filename.split('.').pop();
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    const cleaned = nameWithoutExt
        .replace(/\s+/g, '-')           // spaces → hyphens
        .replace(/[()[\]{}]/g, '')      // remove brackets/parentheses
        .replace(/[^\w.-]/g, '_')       // special chars → underscore
        .toLowerCase();

    return `${cleaned}.${ext}`;
}