import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

export function sanitizeHtml(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "p", "br", "ul", "li"],
    ALLOWED_ATTR: [],
  });
}
