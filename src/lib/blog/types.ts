/** Publication lifecycle — tweak status labels in settings.copy if needed. */
export type BlogPostStatus = "draft" | "published" | "archived";

export type BlogBodyFormat = "plain" | "markdown";

export type BlogLayoutWidth = "narrow" | "default" | "wide";

export type BlogTheme = "dark" | "light";

export type BlogCoverImage = {
  src: string;
  alt: string;
  /** CSS object-position, e.g. "center top" */
  position?: string;
};

export type BlogPostSeo = {
  /** @deprecated Derived from post title — not stored. */
  title?: string;
  /** @deprecated Derived from excerpt — not stored. */
  description?: string;
  /** @deprecated Derived from cover or site logo — not stored. */
  ogImage?: string;
  noIndex?: boolean;
  /** @deprecated Derived from `/blog/{slug}/{uid}` — not stored. */
  canonical?: string;
};

export type BlogPostDisplay = {
  showDate?: boolean;
  showAuthor?: boolean;
  showTags?: boolean;
  showCover?: boolean;
  theme?: BlogTheme;
  maxWidth?: BlogLayoutWidth;
  /** Extra CSS class names on article wrapper */
  className?: string;
};

/** Full post record — every field optional except uid, slug, title, status. */
export type BlogPost = {
  uid: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  bodyFormat?: BlogBodyFormat;
  /** Display date DD.MM.YYYY */
  date?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  status: BlogPostStatus;
  author?: string;
  coverImage?: BlogCoverImage;
  tags?: string[];
  seo?: BlogPostSeo;
  display?: BlogPostDisplay;
  featured?: boolean;
  /** @deprecated Ignored — list order is by date (newest first). */
  sortOrder?: number;
};

export type BlogPostSummary = Pick<
  BlogPost,
  | "uid"
  | "slug"
  | "title"
  | "excerpt"
  | "date"
  | "status"
  | "featured"
  | "coverImage"
  | "tags"
  | "author"
  | "publishedAt"
>;

export type BlogListPage = {
  items: BlogPostSummary[];
  total: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
};

export type BlogIndexCopy = {
  title: string;
  description: string;
  emptyMessage: string;
  itemLabel: string;
};

export type BlogSettings = {
  enabled: boolean;
  pageSize: number;
  index: BlogIndexCopy;
  /** Default display for new posts */
  defaultDisplay: BlogPostDisplay;
  /** Default SEO suffix: " | Site name" handled in metadata helper */
  defaultAuthor?: string;
  dashboardTitle: string;
};

export type BlogStore = {
  version: 1;
  posts: BlogPost[];
  settings: BlogSettings;
  updatedAt: string;
};

export type BlogPostInput = Omit<
  BlogPost,
  "uid" | "createdAt" | "updatedAt" | "publishedAt"
> & {
  uid?: string;
};
