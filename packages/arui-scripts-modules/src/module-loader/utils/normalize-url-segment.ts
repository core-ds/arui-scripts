export function normalizeUrlSegment(segment: string) {
    if (!segment) {
        return '/';
    }

    if (segment[segment.length - 1] !== '/') {
        segment = `${segment}/`;
    }

    if (segment.indexOf('http') === 0) {
        return segment;
    }

    if (segment[0] !== '/') {
        segment = `/${segment}`;
    }

    return segment;
}

export function urlSegmentWithoutEndSlash(segment: string) {
    const normalized = normalizeUrlSegment(segment);

    return normalized.substring(0, normalized.length - 1);
}
