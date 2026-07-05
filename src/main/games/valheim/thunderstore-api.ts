/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CyberstormCommunity {
  /**
   * Name
   * @minLength 1
   */
  name: string;
  /**
   * Identifier
   * @minLength 1
   */
  identifier: string;
  /** Short description */
  short_description?: string | null;
  /** Description */
  description?: string | null;
  /** Discord url */
  discord_url?: string | null;
  /** Wiki url */
  wiki_url?: string | null;
  /**
   * Datetime created
   * @format date-time
   */
  datetime_created: string;
  /** Background image url */
  background_image_url?: string | null;
  /** Hero image url */
  hero_image_url?: string | null;
  /** Cover image url */
  cover_image_url?: string | null;
  /** Icon url */
  icon_url?: string | null;
  /** Community icon url */
  community_icon_url?: string | null;
  /** Total download count */
  total_download_count?: number;
  /** Total package count */
  total_package_count?: number;
  /** Has mod manager support */
  has_mod_manager_support: boolean;
  /** Is listed */
  is_listed: boolean;
}

export interface RequestBody {
  /**
   * Authorization code received from the provider when authentication flow was initiated on the client
   * @minLength 1
   */
  code: string;
  /**
   * Redirect URI used when the authentication flow was initiated on client
   * @minLength 1
   */
  redirect_uri: string;
}

export interface ResponseBody {
  /**
   * Email
   * @minLength 1
   */
  email?: string | null;
  /**
   * Session id
   * @minLength 1
   */
  session_id: string;
  /**
   * Username
   * @minLength 1
   */
  username: string;
}

export interface OwLoginRequestBody {
  /**
   * Authorization token
   * @minLength 1
   */
  jwt: string;
}

export interface SocialAuthConnection {
  /**
   * Provider
   * @minLength 1
   */
  provider: string;
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Avatar
   * @minLength 1
   */
  avatar: string;
}

export interface SubscriptionStatus {
  /**
   * Expires
   * @format date-time
   */
  expires: string;
}

export interface UserTeam {
  /**
   * Name
   * @minLength 1
   */
  name: string;
  /**
   * Role
   * @minLength 1
   */
  role: string;
  /**
   * Member count
   * @min 0
   */
  member_count: number;
}

export interface UserProfile {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  capabilities: (string | null)[];
  connections: SocialAuthConnection[];
  subscription: SubscriptionStatus;
  rated_packages: (string | null)[];
  teams: (string | null)[];
  teams_full: UserTeam[];
  /** Is staff */
  is_staff: boolean;
}

export interface OwLoginResponseBody {
  /**
   * Session id
   * @minLength 1
   */
  session_id: string;
  profile: UserProfile;
}

export interface Community {
  /**
   * Identifier
   * @minLength 1
   * @maxLength 256
   */
  identifier: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 256
   */
  name: string;
  /**
   * Discord url
   * @maxLength 512
   */
  discord_url?: string | null;
  /**
   * Wiki url
   * @maxLength 512
   */
  wiki_url?: string | null;
  /** Require package listing approval */
  require_package_listing_approval?: boolean;
}

export interface PackageCategory {
  /**
   * Name
   * @minLength 1
   * @maxLength 512
   */
  name: string;
  /**
   * Slug
   * @format slug
   * @minLength 1
   * @maxLength 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string;
}

export interface CurrentUserTeamPermissions {
  /** Can disband team */
  can_disband_team: boolean;
  /** Can leave team */
  can_leave_team: boolean;
}

export interface PackageDependency {
  /**
   * Community identifier
   * @minLength 1
   * @maxLength 256
   */
  community_identifier?: string | null;
  /**
   * Community name
   * @minLength 1
   * @maxLength 256
   */
  community_name?: string | null;
  /**
   * Description
   * @minLength 1
   * @maxLength 256
   */
  description: string;
  /**
   * Image src
   * @minLength 1
   */
  image_src?: string | null;
  /**
   * Namespace
   * @minLength 1
   * @maxLength 64
   */
  namespace: string;
  /**
   * Package name
   * @minLength 1
   * @maxLength 128
   */
  package_name: string;
  /**
   * Version number
   * @minLength 1
   * @maxLength 16
   */
  version_number: string;
}

export interface PackageVersion {
  /**
   * Date created
   * @format date-time
   */
  date_created: string;
  /**
   * Download count
   * @min 0
   */
  download_count: number;
  /**
   * Download url
   * @minLength 1
   */
  download_url: string;
  /**
   * Install url
   * @minLength 1
   */
  install_url: string;
  /**
   * Version number
   * @minLength 1
   * @maxLength 16
   */
  version_number: string;
}

export interface PackageDetailViewContent {
  /**
   * Bg image src
   * @minLength 1
   */
  bg_image_src?: string | null;
  categories: PackageCategory[];
  /**
   * Community identifier
   * @minLength 1
   * @maxLength 256
   */
  community_identifier: string;
  /**
   * Community name
   * @minLength 1
   * @maxLength 256
   */
  community_name: string;
  /**
   * Dependant count
   * @min 0
   */
  dependant_count: number;
  dependencies: PackageDependency[];
  /**
   * Dependency string
   * @minLength 1
   * @maxLength 210
   */
  dependency_string: string;
  /**
   * Description
   * @minLength 1
   * @maxLength 256
   */
  description: string;
  /**
   * Download count
   * @min 0
   */
  download_count: number;
  /**
   * Download url
   * @minLength 1
   */
  download_url: string;
  /**
   * Image src
   * @minLength 1
   */
  image_src?: string | null;
  /**
   * Install url
   * @minLength 1
   */
  install_url: string;
  /**
   * Last updated
   * @format date-time
   */
  last_updated: string;
  /**
   * Markdown
   * @minLength 1
   */
  markdown: string;
  /**
   * Namespace
   * @minLength 1
   * @maxLength 64
   */
  namespace: string;
  /**
   * Package name
   * @minLength 1
   * @maxLength 128
   */
  package_name: string;
  /**
   * Rating score
   * @min 0
   */
  rating_score: number;
  /**
   * Team name
   * @minLength 1
   * @maxLength 64
   */
  team_name: string;
  versions: PackageVersion[];
  /**
   * Website
   * @minLength 1
   * @maxLength 1024
   */
  website: string;
}

export interface PackageCard {
  categories: PackageCategory[];
  /**
   * Community identifier
   * @minLength 1
   * @maxLength 256
   */
  community_identifier: string;
  /**
   * Community name
   * @minLength 1
   * @maxLength 256
   */
  community_name: string;
  /**
   * Description
   * @minLength 1
   * @maxLength 256
   */
  description: string;
  /**
   * Download count
   * @min 0
   */
  download_count: number;
  /**
   * Image src
   * @minLength 1
   */
  image_src?: string | null;
  /** Is deprecated */
  is_deprecated: boolean;
  /** Is nsfw */
  is_nsfw: boolean;
  /** Is pinned */
  is_pinned: boolean;
  /**
   * Last updated
   * @format date-time
   */
  last_updated: string;
  /**
   * Namespace
   * @minLength 1
   * @maxLength 64
   */
  namespace: string;
  /**
   * Package name
   * @minLength 1
   * @maxLength 128
   */
  package_name: string;
  /**
   * Rating score
   * @min 0
   */
  rating_score: number;
  /**
   * Team name
   * @minLength 1
   * @maxLength 64
   */
  team_name: string;
}

export interface CommunityPackageList {
  /**
   * Bg image src
   * @minLength 1
   */
  bg_image_src?: string | null;
  categories: PackageCategory[];
  /**
   * Community name
   * @minLength 1
   * @maxLength 256
   */
  community_name: string;
  /** Has more pages */
  has_more_pages: boolean;
  packages: PackageCard[];
}

export interface CommunityCard {
  /**
   * Bg image src
   * @minLength 1
   */
  bg_image_src?: string | null;
  /**
   * Download count
   * @min 0
   */
  download_count: number;
  /**
   * Identifier
   * @minLength 1
   * @maxLength 256
   */
  identifier: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 256
   */
  name: string;
  /**
   * Package count
   * @min 0
   */
  package_count: number;
}

export interface FrontPageContent {
  communities: CommunityCard[];
  /**
   * Download count
   * @min 0
   */
  download_count: number;
  /**
   * Package count
   * @min 0
   */
  package_count: number;
}

export interface RenderMarkdownParams {
  /**
   * Markdown
   * @minLength 1
   * @maxLength 100000
   */
  markdown: string;
}

export interface RenderMarkdownResponse {
  /**
   * Html
   * @minLength 1
   */
  html: string;
}

export interface LegacyProfileCreateResponse {
  /**
   * Key
   * @minLength 1
   */
  key: string;
}

export interface PackageIndexEntry {
  /**
   * Namespace
   * @minLength 1
   */
  namespace: string;
  /**
   * Name
   * @minLength 1
   */
  name: string;
  /**
   * Version number
   * @minLength 1
   */
  version_number: string;
  /**
   * File format
   * @minLength 1
   */
  file_format: string;
  /** File size */
  file_size: number;
  /** Dependencies */
  dependencies?: string;
}

export interface PackageListingApproveRequest {
  /** Internal notes */
  internal_notes?: string | null;
}

export interface PackageListingRejectRequest {
  /**
   * Rejection reason
   * @minLength 1
   */
  rejection_reason: string;
  /** Internal notes */
  internal_notes?: string | null;
}

export interface PackageListingReportRequest {
  /** Version */
  version?: number | null;
  /** Reason */
  reason:
    | "Spam"
    | "Malware"
    | "Reupload"
    | "CopyrightOrLicense"
    | "WrongCommunity"
    | "WrongCategories"
    | "Other";
  /**
   * Description
   * @maxLength 12288
   */
  description?: string | null;
}

export interface PackageListingUpdateRequest {
  categories: string[];
}

export interface PackageCategoryExperimental {
  /**
   * Name
   * @minLength 1
   */
  name: string;
  /**
   * Slug
   * @format slug
   * @minLength 1
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string;
}

export interface PackageListingUpdateResponse {
  categories: PackageCategoryExperimental[];
}

export interface PackageVersionExperimental {
  /** Namespace */
  namespace?: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 128
   */
  name: string;
  /**
   * Version number
   * @minLength 1
   * @maxLength 16
   */
  version_number: string;
  /** Full name */
  full_name?: string;
  /**
   * Description
   * @minLength 1
   * @maxLength 256
   */
  description: string;
  /**
   * Icon
   * @format uri
   */
  icon?: string;
  /** Dependencies */
  dependencies?: string;
  /** Download url */
  download_url?: string;
  /**
   * Downloads
   * @min 0
   * @max 2147483647
   */
  downloads?: number;
  /**
   * Date created
   * @format date-time
   */
  date_created?: string;
  /**
   * Website url
   * @minLength 1
   * @maxLength 1024
   */
  website_url: string;
  /** Is active */
  is_active?: boolean;
}

export interface PackageListingExperimental {
  /** Has nsfw content */
  has_nsfw_content?: boolean;
  /** Categories */
  categories?: string;
  /** Community */
  community?: string;
  /** Review status */
  review_status?: "unreviewed" | "approved" | "rejected";
}

export interface PackageExperimental {
  /** Namespace */
  namespace?: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 128
   */
  name: string;
  /** Full name */
  full_name?: string;
  /** Owner */
  owner?: string;
  /** Package url */
  package_url?: string;
  /**
   * Date created
   * @format date-time
   */
  date_created?: string;
  /**
   * Date updated
   * @format date-time
   */
  date_updated?: string;
  /** Rating score */
  rating_score?: string;
  /** Is pinned */
  is_pinned?: boolean;
  /** Is deprecated */
  is_deprecated?: boolean;
  /** Total downloads */
  total_downloads?: string;
  latest: PackageVersionExperimental;
  community_listings: PackageListingExperimental[];
}

export interface WikiPageIndex {
  /**
   * Id
   * @minLength 1
   */
  id: string;
  /**
   * Title
   * @minLength 1
   * @maxLength 512
   */
  title: string;
  /**
   * Slug
   * @minLength 1
   */
  slug: string;
  /**
   * Datetime created
   * @format date-time
   */
  datetime_created: string;
  /**
   * Datetime updated
   * @format date-time
   */
  datetime_updated: string;
}

export interface Wiki {
  /**
   * Id
   * @minLength 1
   */
  id: string;
  /**
   * Title
   * @minLength 1
   */
  title: string;
  /**
   * Slug
   * @minLength 1
   */
  slug: string;
  /**
   * Datetime created
   * @format date-time
   */
  datetime_created: string;
  /**
   * Datetime updated
   * @format date-time
   */
  datetime_updated: string;
  pages: WikiPageIndex[];
}

export interface PackageWiki {
  /**
   * Namespace
   * @minLength 1
   */
  namespace: string;
  /**
   * Name
   * @minLength 1
   */
  name: string;
  wiki: Wiki;
}

export interface PackageWikiListResponse {
  results: PackageWiki[];
  /**
   * Cursor
   * @format date-time
   */
  cursor: string;
  /** Has more */
  has_more: boolean;
}

export interface WikiPageUpsert {
  /**
   * Id
   * @minLength 1
   */
  id?: string;
  /**
   * Title
   * @minLength 1
   * @maxLength 512
   */
  title: string;
  /**
   * Markdown content
   * @minLength 1
   * @maxLength 100000
   */
  markdown_content: string;
}

export interface WikiPage {
  /**
   * Id
   * @minLength 1
   */
  id: string;
  /**
   * Title
   * @minLength 1
   * @maxLength 512
   */
  title: string;
  /**
   * Slug
   * @minLength 1
   */
  slug: string;
  /**
   * Datetime created
   * @format date-time
   */
  datetime_created: string;
  /**
   * Datetime updated
   * @format date-time
   */
  datetime_updated: string;
  /**
   * Markdown content
   * @minLength 1
   */
  markdown_content: string;
}

export interface WikiPageDelete {
  /**
   * Id
   * @minLength 1
   */
  id: string;
}

export interface MarkdownResponse {
  /**
   * Markdown
   * @minLength 1
   */
  markdown?: string | null;
}

export interface SchemaChannelUpdateResponse {
  /**
   * Channel identifier
   * @minLength 1
   */
  channel_identifier: string;
  /**
   * Checksum sha256
   * @minLength 1
   */
  checksum_sha256: string;
}

export interface AvailableCommunity {
  community: Community;
  categories: PackageCategory[];
  /**
   * Url
   * @minLength 1
   */
  url: string;
}

export interface PackageSubmissionResult {
  package_version: PackageVersionExperimental;
  available_communities: AvailableCommunity[];
}

export interface PackageSubmissionMetadata {
  /** Author name */
  author_name: string;
  categories?: string[];
  communities: string[];
  /** Has nsfw content */
  has_nsfw_content: boolean;
  /**
   * Upload uuid
   * @format uuid
   */
  upload_uuid: string;
  /** Community categories */
  community_categories?: Record<string, string[]>;
}

export interface PackageSubmissionStatus {
  /**
   * Id
   * @minLength 1
   */
  id: string;
  /**
   * Status
   * @minLength 1
   */
  status: string;
  /** Form errors */
  form_errors?: object;
  /** Task error */
  task_error: boolean;
  /** Result */
  result?: string;
}

export interface IconValidatorParams {
  /**
   * Icon data
   * @minLength 1
   */
  icon_data: string;
}

export interface ValidatorResponse {
  /** Success */
  success: boolean;
}

export interface ManifestV1ValidatorParams {
  /** Namespace */
  namespace: string;
  /**
   * Manifest data
   * @minLength 1
   */
  manifest_data: string;
}

export interface ReadmeValidatorParams {
  /**
   * Readme data
   * @minLength 1
   */
  readme_data: string;
}

export interface UserMediaInitiateUploadParams {
  /**
   * Filename
   * @minLength 1
   */
  filename: string;
  /**
   * File size bytes
   * @min 1
   */
  file_size_bytes: number;
}

export interface UserMedia {
  /**
   * Uuid
   * @format uuid
   */
  uuid?: string;
  /**
   * Filename
   * @minLength 1
   * @maxLength 1024
   */
  filename: string;
  /**
   * Size
   * @min 0
   * @max 9223372036854776000
   */
  size: number;
  /**
   * Datetime created
   * @format date-time
   */
  datetime_created?: string;
  /**
   * Expiry
   * @format date-time
   */
  expiry?: string | null;
  /** Status */
  status?:
    | "initial"
    | "upload_created"
    | "upload_error"
    | "upload_complete"
    | "upload_aborted";
}

export interface UploadPartUrl {
  /** Part number */
  part_number: number;
  /**
   * Url
   * @format uri
   * @minLength 1
   */
  url: string;
  /** Offset */
  offset: number;
  /** Length */
  length: number;
}

export interface UserMediaInitiateUploadResponse {
  user_media: UserMedia;
  upload_urls: UploadPartUrl[];
}

export interface CompletedPart {
  /**
   * Etag
   * @minLength 1
   */
  ETag: string;
  /** Partnumber */
  PartNumber: number;
}

export interface UserMediaFinishUploadParams {
  parts: CompletedPart[];
}

export interface PackageMetrics {
  /** Downloads */
  downloads: number;
  /** Rating score */
  rating_score: number;
  /**
   * Latest version
   * @minLength 1
   */
  latest_version: string;
}

export interface PackageVersionMetrics {
  /** Downloads */
  downloads: number;
}

export interface PackageListing {
  /** Name */
  name?: string;
  /** Full name */
  full_name?: string;
  /** Owner */
  owner?: string;
  /** Package url */
  package_url?: string;
  /** Donation link */
  donation_link?: string;
  /** Date created */
  date_created?: string;
  /** Date updated */
  date_updated?: string;
  /** Uuid4 */
  uuid4?: string;
  /** Rating score */
  rating_score?: string;
  /** Is pinned */
  is_pinned?: string;
  /** Is deprecated */
  is_deprecated?: string;
  /** Has nsfw content */
  has_nsfw_content?: boolean;
  /** Categories */
  categories?: string;
  /** Versions */
  versions?: string;
}
