const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"]);

const IMAGE_CONTENT_TYPES_BY_EXTENSION: Record<string, string> = {
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"]);

export const ACCEPTED_IMAGE_INPUT_TYPES = "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif";

export function getFileExtension(filename: string) {
    return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function getMediaContentType(file: File) {
    if (file.type) {
        return file.type;
    }

    const extension = getFileExtension(file.name);

    return IMAGE_CONTENT_TYPES_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export function isAcceptedImageFile(file: File) {
    return IMAGE_CONTENT_TYPES.has(file.type) || IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}
