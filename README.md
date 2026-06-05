# PulseNet

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Aiven%20Cloud-336791?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

A Reddit-inspired community platform where users can create communities, write posts with rich BBCode formatting, leave nested comments, like content, and follow each other - all backed by a clean-architecture Express API with full JWT authentication, role-based moderation, and a PostgreSQL database hosted on Aiven cloud.



# Check it out !

[Live Demo](https://odp-c3-s-tim-22.vercel.app/)


<img width="800" height="450" alt="2026-06-0522-29-08-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/6bfe707c-149c-481d-8d0e-2bc3da459705" />
<img width="800" height="450" alt="2026-06-05 22-30-04" src="https://github.com/user-attachments/assets/f921d3da-c918-4579-8d39-1cd89c27ca21" />



---

## What Is PulseNet?

PulseNet is a full-stack social forum platform. Users can:

- Sign up and maintain a profile
- Browse a personalized feed of posts from communities they belong to or users they follow
- Create and moderate their own communities (public or invite-only private)
- Write posts using BBCode markup (bold, italic, links, images, spoilers, code blocks)
- Comment on posts up to two levels deep, like both posts and comments
- Follow other users whose posts appear in their personal feed
- Admins get a dashboard with an audit trail of all significant platform events

The project was built as a university assignment for the Distributed Systems course at FTN, and became a genuine deep-dive into full-stack engineering : from database schema design all the way through REST API architecture to a polished React frontend.

---

## Team

PulseNet was built by a team of four. I served as **technical lead and full-stack developer** : responsible for the overall architecture, establishing the patterns every team member would follow, performing code reviews, and keeping the team unblocked, all while writing a significant portion of the code myself.

| Name | Role | Contributions |
|---|---|---|
| **Ignjat Radojicic** (me) | Lead / Full Stack | Architecture design, ServiceResult pattern, BaseRepository, input types, audit log system, public + personalized feed, code refactoring, code review, quality control |
| Pavle Stankovic | Backend / Frontend | Comment module (service, repositories, controller), admin panel, landing page |
| Kristijan Oros | Backend / Frontend | Community module (service, repository, controller), community frontend pages |
| Danijel Musli | Backend / Frontend | Post module (repository, service, controller), user profile page |

What it meant in practice: I defined the skeleton : the Clean Architecture layers, the repository interfaces, the ServiceResult pattern, the DTO shapes : and the rest of the team built their modules inside that skeleton. Every pull request came through me before it merged. More on what that experience actually taught me in the [What I Learned](#what-i-learned) section.

---

## Features

### Communities
- Create public or private communities with a name, description, avatar, and rules
- Private communities require an admin/moderator to approve join requests before the user gains access
- Community moderators can manage members, approve pending requests, ban users, and promote other members
- Community creator is automatically a moderator

### Posts
- Create posts within a community - title, body content, optional media URL, and tags
- Body content supports a subset of BBCode: `[b]`, `[i]`, `[u]`, `[s]`, `[code]`, `[quote]`, `[spoiler]`, `[url]`, `[img]`, `[color]`, `[size]`
- All URLs inside BBCode are sanitized on render - `javascript:`, `data:`, and `vbscript:` schemes are blocked entirely before any HTML is produced
- Posts can be edited and deleted by their author or a site admin
- Tags can be added to posts for discovery

### Comments
- Nested comments up to two levels deep (top-level + one reply level)
- The backend enforces the nesting limit - you cannot reply to a reply
- Soft deletion: deleted comments show `[comment deleted]` so thread structure stays intact
- Comments can be liked independently of posts
- Optimistic UI updates: the like count updates instantly in the UI, then rolls back if the server rejects it

### Likes
- Posts and comments can be liked by any authenticated user
- You cannot like your own content - the backend enforces this and returns a 400 Validation Error
- The `isLiked` flag is injected per-request: if the request carries a valid token, the API checks the `post_likes` table for that user and returns `isLiked: true/false` on every post object. Anonymous requests always get `isLiked: false`

### Feed
- Logged-in users see posts from communities they are a member of, plus posts from users they follow
- If a logged-in user has no communities and follows nobody, the feed gracefully falls back to showing the global public post feed instead of leaving them with a blank screen
- Guests always see the public feed

### Auth
- Register / login with hashed passwords (bcrypt)
- Short-lived JWT access tokens stored in localStorage under `authToken`
- Refresh tokens stored as hashed values in the database, sent via HttpOnly cookie - the server hashes the cookie value and compares to the stored hash
- Protected routes check the JWT signature and expiry; the token carries `id`, `username`, and `role`

### Admin
- Site-wide admin role (`role = 'admin'` on the users table)
- Admin dashboard page lists audit log events: logins, registrations, community creation, deletions, bans, etc.
- Admins can delete any post or comment regardless of authorship
- Admin can be granted by running `UPDATE users SET role = 'admin' WHERE username = '...'` directly in the database

### Audit Logging
- Every sensitive action (login, register, create/delete community, ban member, etc.) writes a row to the `audits` table
- Audit rows store: user ID, action label, entity type, entity ID, IP address, user-agent, and timestamp
- The audit middleware wraps all routes and captures this automatically

### Rate Limiting
- Authentication routes (login/register) are rate-limited more aggressively than general API routes
- Like endpoints have their own limiter to prevent rapid spam liking

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI component library |
| TypeScript | 5.9 | Static typing throughout the frontend |
| Vite | 7 | Dev server and production bundler |
| TailwindCSS | 4 | Utility-first styling |
| React Router | 7 | Client-side navigation with URL params |
| Axios | 1.x | HTTP client for API calls |
| jwt-decode | 4 | Decodes JWT claims on the client to extract user info |
| lucide-react | latest | Icon set used throughout the UI |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | JavaScript runtime |
| Express | 5 | HTTP server and routing |
| TypeScript | 5.9 | Static typing throughout the backend |
| pg | 8 | PostgreSQL client for Node.js |
| jsonwebtoken | 9 | JWT signing and verification |
| bcryptjs | 3 | Password hashing |
| express-rate-limit | 7 | Per-route rate limiting |
| cookie-parser | 1.4 | Reads the refresh token HttpOnly cookie |
| dotenv | 17 | Environment variable loading |

### Infrastructure

| Service | Purpose |
|---|---|
| PostgreSQL on Aiven | Cloud-hosted relational database |
| Render | API deployment (backend) |
| Vite preview / static host | Frontend deployment |

---

## Architecture

The backend follows **Clean Architecture**, a layered design philosophy where dependencies only point inward - outer layers depend on inner layers, never the reverse. This keeps business logic completely independent of the database, Express, or any specific technology. You can swap PostgreSQL for another database without touching a single service file.

```
server/src/
├── Domain/               ← innermost layer - pure business concepts
│   ├── models/           ← plain TypeScript classes (User, Post, Comment, etc.)
│   ├── DTOs/             ← Data Transfer Objects shaped for API responses
│   ├── enums/            ← UserRole, CommunityRole, CommunityType, ErrorCode
│   ├── types/            ← ServiceResult<T>, ValidationResult, all input shapes
│   ├── services/         ← service interfaces (IPostService, ICommentService, etc.)
│   └── repositories/     ← repository interfaces (IPostRepository, etc.)
│
├── Services/             ← business logic - implements service interfaces
│   ├── post/PostService.ts
│   ├── comments/CommentService.ts
│   ├── Communities/CommunityService.ts
│   ├── auth/AuthService.ts
│   └── ...
│
├── Database/             ← infrastructure - implements repository interfaces
│   ├── repositories/     ← raw SQL queries, returns domain models
│   └── mappers/          ← converts raw pg rows to domain models
│
├── WebAPI/               ← HTTP boundary - Express controllers, validators, middleware
│   ├── controllers/      ← one controller per domain area
│   ├── validators/       ← input validation functions
│   └── helpers/          ← responseHelper maps ServiceResult to HTTP responses
│
└── Middlewares/          ← cross-cutting concerns
    ├── authentification/ ← authenticate, optionalAuthenticate
    ├── authorization/    ← authorize(role) middleware
    ├── auditing/         ← AuditMiddleware
    └── rateLimit/        ← authLimiter, likeLimiter, generalLimiter
```

### Why This Matters

In a naive Express app you would write SQL directly inside a route handler. That makes testing hard (you need a real database), makes changing the database impossible (SQL is tangled into your logic), and makes the code hard to reason about (auth, validation, SQL, and business rules all in one function).

Clean Architecture solves this by forcing you to think about *what* your application does (the Domain and Service layers) completely separately from *how* it stores data (the Database layer) and *how* it is exposed over HTTP (the WebAPI layer).

The Services layer never imports from Express or pg. It only knows about interfaces - `IPostRepository`, `ICommentService`, etc. The actual implementations (`PostRepository`, `CommentService`) are constructed once in `app.ts` and injected in. This is called **Dependency Injection** - you wire things together at the top level, so every piece can be tested or swapped in isolation.

---

## Key Design Patterns

### ServiceResult - No Thrown Errors in Business Logic

Every service method returns a `ServiceResult<T>` object instead of throwing exceptions:

```typescript
type ServiceResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
    errorCode?: ErrorCode;
};
```

When something goes wrong - like a user trying to like their own post - the service returns:

```typescript
return {
    success: false,
    message: 'You cannot like your own post',
    errorCode: ErrorCode.VALIDATION_ERROR,
};
```

The `responseHelper` in the WebAPI layer then maps `ErrorCode` to an HTTP status:

```typescript
VALIDATION_ERROR → 400
ALREADY_EXISTS   → 409
NOT_FOUND        → 404
FORBIDDEN        → 403
INTERNAL_ERROR   → 500
```

This means the controller never needs to know business logic and the service never needs to know HTTP. They communicate through a structured result object. No `try/catch` chains around business decisions - only around genuine infrastructure failures.

---

### Repository Pattern - Database Behind an Interface

Every database operation is hidden behind an interface defined in the Domain layer. The service layer only ever calls the interface:

```typescript
// Domain/repositories/post_repository/IPostRepository.ts
export interface IPostRepository {
    findById(postId: number, requesterId: number | null): Promise<PostDto | null>;
    findByCommunity(input: GetCommunityPostsInput): Promise<PostDto[]>;
    getLikeCountBatch(postIds: number[]): Promise<Map<number, number>>;
    // ...
}
```

The actual SQL lives in `Database/repositories/posts/PostRepository.ts` and is injected at startup. The `PostService` only imports `IPostRepository` - it has no idea whether the data comes from PostgreSQL, MySQL, or a JSON file.

---

### Batch Queries for Performance

Instead of fetching like counts one post at a time (N+1 query problem), the repository fetches all counts for a list of post IDs in a single query:

```typescript
// getLikeCountBatch
SELECT post_id, COUNT(*) as like_count
FROM post_likes
WHERE post_id = ANY($1)
GROUP BY post_id
```

This is called with an array of all post IDs being rendered at once, then the service builds a `Map<postId, count>` and stamps each DTO. The same pattern exists for comment counts and community member counts. Without this, a feed of 50 posts would fire 150+ separate SQL queries.

---

### optionalAuthenticate - Public Routes That Are Auth-Aware

Many routes in this app are public (guests can read posts), but they need to behave differently for logged-in users - specifically, they need to tell the client whether the current user has already liked a given post.

A naive approach would have two versions of every route. Instead, the backend has an `optionalAuthenticate` middleware:

```typescript
export const optionalAuthenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return next(); // anonymous - just continue
    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, secret) as AuthPayload;
    } catch {
        // invalid token - treat as anonymous, don't reject
    }
    next();
};
```

Routes using `optionalAuthenticate` always proceed. If a valid token was present, `req.user` is populated and the service layer can use it to check `post_likes`. If not, `req.user` is undefined and `isLiked` returns `false`. No duplicate routes needed.

The contrast with `authenticate` (hard requirement) is intentional: `POST /posts/:id/like` requires authentication and will return 401 if no token is present. `GET /posts/:id` is always allowed, but is richer when authenticated.

---

### DTO Pattern - Separate Shape for Network vs Domain

The database stores posts as a `Post` model with raw column names and foreign keys. The API client needs a `PostDto` with additional fields like `authorUsername`, `communityName`, `likeCount`, `isLiked`, `tags`, etc. These are separate types:

```typescript
// Domain model - what the DB stores
class Post {
    id: number;
    authorId: number;
    communityId: number;
    content: string;
    // ...
}

// DTO - what the API client receives
interface PostDto {
    id: number;
    authorId: number;
    authorUsername: string;       // joined from users table
    authorProfileImage: string | null;
    communityName: string;        // joined from communities table
    likeCount: number;            // aggregated
    isLiked: boolean;             // per-requester
    commentCount: number;         // aggregated
    tags: string[];               // joined from tags
    // ...
}
```

The mapper (`PostMapper.ts`) converts a raw `pg` result row into the domain model. The service then enriches the domain model into a DTO. The controller sends only DTOs over the wire - the internal structure of your domain models stays private.

---

### Optimistic UI Updates

When a user clicks the like button, the UI updates immediately without waiting for the server response:

```typescript
// Update the state first
setLiked(!liked);
setLikeCount(prev => liked ? prev - 1 : prev + 1);

// Then fire the real request
const res = liked ? await postApi.unlike(postId) : await postApi.like(postId);

// If it failed, roll back
if (!res.success) {
    setLiked(liked);
    setLikeCount(prev => liked ? prev + 1 : prev - 1);
}
```

From the user's perspective, the like is instant. The network latency is invisible. If something actually goes wrong server-side (the user was banned, the post was deleted), the state rolls back. This pattern is common in production social platforms because the success rate is high enough that optimistic updates are correct the vast majority of the time.

---

### BBCode Rendering with XSS Protection

Posts are stored as raw BBCode strings in the database. On render, the client converts BBCode to HTML. The naive approach (just replace `[b]` with `<b>`) is dangerous - a user could inject `[url=javascript:alert(1)]click me[/url]` and cause script execution via `javascript:` in an `href` attribute.

PulseNet's BBCode renderer includes a `sanitizeUrl` function that fires before any URL is placed into the output HTML:

```typescript
function sanitizeUrl(url: string): string {
    const trimmed = url.trim();
    if (/^javascript:/i.test(trimmed)) return '#';
    if (/^data:/i.test(trimmed)) return '#';
    if (/^vbscript:/i.test(trimmed)) return '#';
    return trimmed;
}
```

Both `[url=...]` and `[img]...[/img]` are run through `sanitizeUrl` before the href or src is written. The renderer is extracted into a single shared utility (`client/src/utils/bbcode.ts`) so there is only one implementation across the entire app - `renderBBCode`, `stripBBCode`, `truncateContent`, and `wrapSelection` all live there and are imported by every component that needs them.

---

### Soft Deletes for Comments

Deleting a comment in a nested thread is tricky: if you remove the row, orphaned replies lose their parent and the thread structure breaks. PulseNet handles this with a soft delete flag:

```sql
is_deleted BOOLEAN NOT NULL DEFAULT FALSE
```

When a comment is deleted, the content is replaced with `'[comment deleted]'` and `is_deleted` is set to `true`. The row stays in the database. Replies keep their `parent_id` pointing to a valid row. The frontend renders deleted comments in a muted style so readers can still follow the thread.

---

### Role-Based Access Control

There are two independent role systems:

**Site-level roles** on the `users` table:
- `user` - standard access
- `admin` - can delete anything, access the audit dashboard

**Community-level roles** on the `community_members` table:
- `member` - can post and comment
- `moderator` - can manage members (approve/ban/promote)

And a membership **status**:
- `active` - full access to the community
- `pending` - submitted join request for a private community, waiting for moderator approval
- `banned` - removed from the community

These three axes (`site role`, `community role`, `membership status`) combine to cover all permission scenarios. The backend checks these on every relevant request - there is no way to bypass them from the frontend.

---

## Database Schema

The database is PostgreSQL and uses 11 tables. Key relationships:

```
users
 ├── communities (creator_id → users.id)
 ├── posts (author_id → users.id, community_id → communities.id)
 │    ├── post_likes (user_id, post_id - composite PK)
 │    └── post_tags (post_id, tag_id - composite PK)
 ├── comments (author_id → users.id, post_id → posts.id, parent_id → comments.id)
 │    └── comment_likes (user_id, comment_id - composite PK)
 ├── community_members (user_id, community_id - composite PK, role, status)
 ├── user_follows (follower_id, following_id - composite PK)
 ├── refresh_tokens (user_id → users.id, token_hash, expires_at)
 └── audits (user_id → users.id, action, entity_type, entity_id, ip, user_agent)
```

Notable schema decisions:
- **Composite primary keys** on junction tables (`post_likes`, `community_members`, `user_follows`) - no surrogate ID column needed, and uniqueness is enforced at the database level for free
- **`updated_at` trigger** on `posts` and `comments` - the database automatically updates this column on every `UPDATE` using a reusable trigger function, so application code never has to remember to set it
- **Cascade deletes** everywhere - deleting a user deletes all their posts, comments, likes, and memberships. Deleting a community deletes all its posts. This keeps the database clean without application-level cleanup code
- **Check constraints** enforce business rules at the database level: `role IN ('user', 'admin')`, username pattern `^[a-zA-Z0-9-]+$`, content length ranges, self-follow prevention (`follower_id != following_id`)

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | - | Create a new account |
| POST | `/auth/login` | - | Login, receive access token + refresh cookie |
| POST | `/auth/refresh` | Cookie | Exchange refresh token for new access token |
| POST | `/auth/logout` | JWT | Invalidate refresh token |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/:id` | Optional | Get user profile |
| PUT | `/users/:id` | JWT | Update own profile |
| DELETE | `/users/:id` | JWT | Delete own account |
| GET | `/users/:id/posts` | Optional | Get posts by user |
| POST | `/users/:id/follow` | JWT | Follow a user |
| DELETE | `/users/:id/follow` | JWT | Unfollow a user |
| GET | `/users/:id/followers` | Optional | List followers |
| GET | `/users/:id/following` | Optional | List following |

### Posts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/posts/public` | Optional | Get all public posts |
| GET | `/posts/feed` | JWT | Get personalized feed |
| GET | `/posts/:id` | Optional | Get single post (isLiked if authed) |
| GET | `/posts/community/:communityId` | Optional | Get posts for a community |
| GET | `/posts/user/:userId` | Optional | Get posts by a specific user |
| POST | `/posts` | JWT | Create a post |
| PUT | `/posts/:id` | JWT | Edit a post |
| DELETE | `/posts/:id` | JWT | Delete a post |
| POST | `/posts/:id/like` | JWT | Like a post |
| DELETE | `/posts/:id/like` | JWT | Unlike a post |
| POST | `/posts/:id/tags` | JWT | Add tag to post |
| DELETE | `/posts/:id/tags/:tagId` | JWT | Remove tag from post |

### Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/comments/post/:postId` | Optional | Get comments for a post |
| POST | `/comments` | JWT | Create a comment or reply |
| PUT | `/comments/:id` | JWT | Edit a comment |
| DELETE | `/comments/:id` | JWT | Soft-delete a comment |
| POST | `/comments/:id/like` | JWT | Like a comment |
| DELETE | `/comments/:id/like` | JWT | Unlike a comment |

### Communities
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/communities` | Optional | List all communities |
| GET | `/communities/:id` | Optional | Get community details |
| GET | `/communities/mine` | JWT | Get communities you belong to |
| POST | `/communities` | JWT | Create a community |
| PUT | `/communities/:id` | JWT | Update community info |
| DELETE | `/communities/:id` | JWT | Delete a community |

### Community Members
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/communities/:id/join` | JWT | Join or request to join |
| DELETE | `/communities/:id/leave` | JWT | Leave a community |
| GET | `/communities/:id/members` | Optional | List members |
| PUT | `/communities/:id/members/:userId` | JWT | Update member role/status |
| DELETE | `/communities/:id/members/:userId` | JWT | Remove a member |

### Admin & System
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/audits` | JWT (admin) | List audit log entries |
| GET | `/health` | - | Basic health check |
| POST | `/health/failover` | JWT (admin) | Promote DB replica to master |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- A running PostgreSQL database (local or cloud)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pulsenet.git
cd pulsenet
```

### 2. Set up the database

Run the schema SQL against your PostgreSQL database:

```bash
psql -U your_user -d your_database -f DB_Upiti.sql
```

Or if using Aiven (connection string approach):

```bash
psql "postgres://user:password@host:port/database?sslmode=require" -f DB_Upiti.sql
```

### 3. Configure the backend

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
JWT_SECRET=your-very-long-random-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-long-random-secret
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
DB_HEALTH_INTERVAL_MS=10000
```

### 4. Configure the frontend

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1/
```

### 5. Install and run

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend (separate terminal):**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Optional: Grant admin access

```bash
psql "your-connection-string" -c "UPDATE users SET role = 'admin' WHERE username = 'your_username';"
```

---

## Project Structure

```
pulsenet/
├── client/                        ← React frontend
│   └── src/
│       ├── api_services/          ← API call wrappers (postApi, communityApi, etc.)
│       ├── components/            ← Reusable UI components (PostCard, CommentSection, etc.)
│       ├── constants/             ← AUTH constants, route paths
│       ├── helpers/               ← Centralized fetch helper with auto-auth injection
│       ├── hooks/                 ← useAuth, useComments - custom React hooks
│       ├── models/                ← TypeScript interfaces matching backend DTOs
│       ├── pages/                 ← One folder per route (feed, post, communities, etc.)
│       └── utils/                 ← bbcode.ts (renderBBCode, stripBBCode, wrapSelection)
│
└── server/                        ← Express backend
    └── src/
        ├── Domain/                ← Models, DTOs, interfaces, enums, types
        ├── Services/              ← Business logic
        ├── Database/              ← PostgreSQL repositories and mappers
        ├── WebAPI/                ← Controllers, validators, response helpers
        └── Middlewares/           ← Auth, authorization, auditing, rate limiting
```

---

## What I Learned

This project was an end-to-end learning exercise in modern full-stack development. Here is a breakdown of the major things it forced me to understand deeply.

### React - How Component State Actually Works

Before this project, React was abstract. After building PulseNet, my mental model is concrete. **State** is a value that React tracks; when you call a setter, React schedules a re-render and the component function runs again with the new value. Hooks like `useState` and `useEffect` are just the API for plugging into that cycle.

The `useEffect` cleanup pattern was a key insight - when a component unmounts mid-request, you need to stop setting state on it or React logs a warning about memory leaks. The `ignore` flag pattern in PulseNet's data-loading hooks handles this:

```typescript
useEffect(() => {
    let ignore = false;
    async function load() {
        const data = await fetchSomething();
        if (!ignore) setState(data); // only update if still mounted
    }
    load();
    return () => { ignore = true; }; // cleanup on unmount
}, [dependency]);
```

### Custom Hooks - Extracting Logic from Components

React's rule is: components render UI, hooks manage behavior. Before learning this, all the API calls and state lived directly in the component. This bloated the component and made logic impossible to reuse.

`useComments.ts` is a good example - it encapsulates all the state for a comment thread (the list, loading state, the optimistic like updates, the debounce timer) and exposes a clean interface to the component. The component doesn't know or care about any of that internal complexity.

### TypeScript - Why Types Are Worth the Friction

TypeScript's type checker catches real bugs before they reach users. The biggest example in this project: the auth token key mismatch. The old code used `localStorage.getItem('token')` but the constant was `AUTH.TOKEN_KEY = 'authToken'`. If the token key had been typed as a specific literal type instead of a raw string, this would have been a compile error. That bug caused likes to silently fail for weeks.

Beyond catching bugs, TypeScript makes the codebase self-documenting. Looking at `PostDto` tells you exactly what shape every post response will have across the entire app. You never need to console.log a response to figure out what fields exist - the types tell you.

### Clean Architecture - Separation of Concerns at Scale

The biggest architectural takeaway is that mixing your business logic with your HTTP framework or your SQL client makes everything harder to change. When the requirement changed (add `optionalAuthenticate` to post routes), the change was one line in the controller. The service, the repository, and the database were not touched at all.

If the routes had contained SQL queries and JWT parsing all in one function (which is how most tutorials teach it), that same change would have required carefully untangling three different concerns.

### The Repository Pattern - Testing and Swapability

Defining `IPostRepository` as an interface and injecting the real `PostRepository` at startup means you could write a `MockPostRepository` for testing that returns hardcoded data without a real database. Every service can be unit-tested in complete isolation.

In practice for this project, the main benefit was clarity - reading the interface tells you exactly what operations the database supports, without reading any SQL.

### PostgreSQL - Relational Thinking

Writing the schema from scratch forced real understanding of:
- **Foreign keys**: enforce referential integrity at the database level - you cannot have a post pointing to a community that doesn't exist
- **Composite primary keys**: a user can only like a post once because `(user_id, post_id)` is the primary key - uniqueness is guaranteed by the schema, not application code
- **Check constraints**: business rules encoded directly in the schema. The database itself will reject a role value of `'superadmin'` because of the `CHECK (role IN ('user', 'admin'))` constraint
- **Indexes**: without `idx_posts_community`, every query for posts in a community would scan the entire posts table. With the index, PostgreSQL jumps straight to the relevant rows
- **Triggers**: `trg_posts_updated_at` fires automatically on every `UPDATE`, so `updated_at` is always accurate without any application code managing it
- **Cascade behavior**: `ON DELETE CASCADE` means the database handles cleanup automatically. Deleting a user also deletes all their posts, comments, and likes - no manual cleanup in application code required

### JWT Authentication - What a Token Actually Is

A JWT is not a session. It is a signed JSON payload. The server issues it at login and never stores it. On every request, the server verifies the signature using a secret key - if the signature is valid, the payload is trusted. This means the server is completely stateless for authentication; it does not need to look up the token in a database.

The tradeoff is that a JWT cannot be "cancelled" before it expires. If someone's token is stolen, you cannot revoke it server-side - you just wait for it to expire. PulseNet addresses this by keeping JWT access tokens short-lived (15 minutes) and using a refresh token system: the long-lived refresh token is stored in the database as a hash, so it can be revoked at any time by deleting the row.

### XSS Prevention - Never Trust User Content in HTML

Cross-Site Scripting (XSS) is when an attacker injects JavaScript into content that gets rendered in other users' browsers. Because PulseNet allows rich text input through BBCode and renders it as HTML, this was a real attack surface.

The lesson: whenever you take user-controlled content and place it inside HTML attributes - especially `href` and `src` - you must validate the scheme. The `javascript:` protocol in an href is a classic XSS vector. The `sanitizeUrl` function blocks this at the point of HTML generation, before any string ever reaches `dangerouslySetInnerHTML`.

### Rate Limiting - Protecting APIs from Abuse

Even a learning project needs basic rate limiting. Without it, an automated script could hammer the login endpoint with millions of password guesses, or spam the like endpoints to inflate engagement metrics.

`express-rate-limit` makes this easy - you define a window (e.g., 15 minutes) and a max request count, and the middleware handles the rest. The important design decision in PulseNet is using *different* limiters for different routes: auth gets a tighter limit than reading posts, and likes get their own specific limit.

### Audit Logging - Observability and Accountability

An audit log answers the question "who did what and when?" Without it, if a user reports that their account was banned unfairly, you have no record of who banned them, when, or with what IP address.

The PulseNet audit middleware automatically captures these events for any action it is configured to track. Writing a record to an `audits` table costs very little at runtime but provides enormous value for debugging and accountability.

### Git and Repository Management

Working on a full-stack project taught the discipline of meaningful commits, keeping frontend and backend in the same repository (monorepo approach), and the value of a `.gitignore` that excludes development artifacts (`.env`, `node_modules`, `.claude/`). It also surfaced why you should never commit secrets - the connection string in your `.env` must stay local.

### Leading a Team - Technical Leadership for the First Time

This was my first time being the person other developers depended on, and it was harder than I expected in ways that had nothing to do with writing code.

**Setting the standard before anyone writes a line.** The most important decision I made early was to define the architecture before anyone touched a feature. I wrote the `ServiceResult` type, the `BaseRepository`, the repository interfaces, and the folder structure, then explained why each existed before assigning tasks. If I had skipped that step and just said "build the community module," three different people would have built it three different ways, and reconciling that later would have been worse than doing it up front. The lesson: in a team, the architecture is a shared contract. If it only exists in your head, it doesn't exist.

**Code review is not about catching mistakes : it's about shared understanding.** Before this project, I thought code review meant reading a PR and flagging bugs. That is only a small part of it. What I actually learned is that code review is how the whole team develops the same instincts. When I left a comment explaining *why* the pattern should be done a certain way : not just that it should be : the next PR from that person usually had the improvement already applied. When I just said "change this," it was a transaction that didn't transfer knowledge. The difference between "this should return a ServiceResult, not throw" and "this should return a ServiceResult instead of throwing because the controller layer doesn't know which HTTP status code maps to a business rule : that translation happens here in the response helper" is whether the reviewer is doing gatekeeping or teaching.

**Keeping people unblocked is a full-time job inside the real job.** There were moments where a team member was stuck for hours on something I could have explained in five minutes : but they didn't ask because they didn't want to interrupt. I learned to check in proactively: not "is everything okay?" but "what are you working on right now, and what's the next thing you'll need?" The specific question surfaces the specific blocker before it costs a full afternoon.

**Debugging someone else's code is a different skill.** When a bug was in code I wrote, I had the context of every decision. When a bug was in code someone else wrote, I had to reconstruct their mental model first : understand what they were trying to do : before I could understand where it diverged from what actually happened. This forced me to get better at reading code cold: following the data flow from the request down through the controller, into the service, into the repository, and back up, without the shortcut of remembering what I wrote. It made me a better reader of my own code too, because I stopped assuming the reader (future me, or anyone else) shares any context.

**The gap between "it works on my machine" and "it works in the team" is real.** Multiple times, a feature would pass a team member's local test but fail for everyone else because of a missing environment variable, a hardcoded localhost URL, or a missing database migration. This is where documentation discipline pays off : a clear `.env.example`, explicit setup steps, and a shared understanding of what the database schema should look like at any point in time. These habits feel like overhead until the third time someone loses two hours to a missing env var.

**You cannot lead and also be heads-down in code at the same time : at first.** I tried to be writing features and reviewing PRs and answering questions simultaneously, and it didn't work well. I was always context-switching at the worst possible moment. What actually worked better was batching: do reviews in the morning, write code in long uninterrupted blocks during the day, answer questions at natural transition points. Protecting deep work time is not selfish : it is how you produce the quality that the team depends on.

---
