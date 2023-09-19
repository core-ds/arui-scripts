export function normalizeUrlSegment(segment: string) {
    if (!segment) {
        return '/';
    }

    let innerSegment = segment;

    if (segment[segment.length - 1] !== '/') {
        innerSegment = `${innerSegment}/`;
    }

    if (innerSegment.indexOf('http') === 0) {
        return innerSegment;
    }

    if (innerSegment[0] !== '/') {
        innerSegment = `/${innerSegment}`;
    }

    return innerSegment;
}

export function urlSegmentWithoutEndSlash(segment: string) {
    const normalized = normalizeUrlSegment(segment);

    return normalized.substring(0, normalized.length - 1);
}
