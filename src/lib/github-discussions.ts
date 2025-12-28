import { graphql } from "@octokit/graphql";

const REPO_OWNER = "logsdb1";
const REPO_NAME = "logsdb";

// Discussion category IDs (will be set after creating categories on GitHub)
export const DISCUSSION_CATEGORIES = {
  SAMPLE_REQUESTS: "sample-requests",
  TROUBLESHOOTING: "troubleshooting",
  GENERAL: "general",
} as const;

export type DiscussionCategoryKey = keyof typeof DISCUSSION_CATEGORIES;

export interface DiscussionAuthor {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface DiscussionComment {
  id: string;
  body: string;
  createdAt: string;
  author: DiscussionAuthor | null;
  reactionGroups?: ReactionGroup[];
}

export interface ReactionGroups {
  THUMBS_UP: { totalCount: number; viewerHasReacted: boolean };
  THUMBS_DOWN: { totalCount: number; viewerHasReacted: boolean };
  LAUGH: { totalCount: number; viewerHasReacted: boolean };
  HOORAY: { totalCount: number; viewerHasReacted: boolean };
  CONFUSED: { totalCount: number; viewerHasReacted: boolean };
  HEART: { totalCount: number; viewerHasReacted: boolean };
  ROCKET: { totalCount: number; viewerHasReacted: boolean };
  EYES: { totalCount: number; viewerHasReacted: boolean };
}

export interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  author: DiscussionAuthor | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  comments: {
    totalCount: number;
    nodes: DiscussionComment[];
  };
  answerChosenAt?: string;
  answer?: DiscussionComment;
  reactionGroups?: ReactionGroup[];
}

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
}

// Create authenticated GraphQL client
function createGraphQLClient(token?: string) {
  return graphql.defaults({
    headers: {
      authorization: token ? `token ${token}` : `token ${process.env.GITHUB_TOKEN}`,
    },
  });
}

// Get repository ID (needed for mutations)
export async function getRepositoryId(token?: string): Promise<string> {
  const graphqlWithAuth = createGraphQLClient(token);

  const response = await graphqlWithAuth<{
    repository: { id: string };
  }>(`
    query {
      repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
        id
      }
    }
  `);

  return response.repository.id;
}

// Get all discussion categories
export async function getDiscussionCategories(token?: string): Promise<DiscussionCategory[]> {
  const graphqlWithAuth = createGraphQLClient(token);

  const response = await graphqlWithAuth<{
    repository: {
      discussionCategories: {
        nodes: DiscussionCategory[];
      };
    };
  }>(`
    query {
      repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
        discussionCategories(first: 20) {
          nodes {
            id
            name
            slug
            description
            emoji
          }
        }
      }
    }
  `);

  return response.repository.discussionCategories.nodes;
}

// List discussions with optional category filter
export async function listDiscussions(options: {
  categorySlug?: string;
  first?: number;
  after?: string;
  token?: string;
} = {}): Promise<{
  discussions: Discussion[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount: number;
}> {
  const { categorySlug, first = 20, after, token } = options;
  const graphqlWithAuth = createGraphQLClient(token);

  // Build category filter
  const categoryFilter = categorySlug
    ? `categoryId: $categoryId,`
    : "";

  // First get category ID if filtering
  let categoryId: string | undefined;
  if (categorySlug) {
    const categories = await getDiscussionCategories(token);
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
      categoryId = category.id;
    }
  }

  const query = `
    query($first: Int!, $after: String${categoryId ? ", $categoryId: ID" : ""}) {
      repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
        discussions(
          first: $first,
          after: $after,
          ${categoryId ? "categoryId: $categoryId," : ""}
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            number
            title
            body
            createdAt
            updatedAt
            url
            author {
              login
              avatarUrl
              url
            }
            category {
              id
              name
              slug
            }
            comments(first: 0) {
              totalCount
            }
          }
        }
      }
    }
  `;

  const variables: Record<string, unknown> = { first, after };
  if (categoryId) {
    variables.categoryId = categoryId;
  }

  const response = await graphqlWithAuth<{
    repository: {
      discussions: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Discussion[];
      };
    };
  }>(query, variables);

  return {
    discussions: response.repository.discussions.nodes,
    pageInfo: response.repository.discussions.pageInfo,
    totalCount: response.repository.discussions.totalCount,
  };
}

// Get a single discussion by number
export async function getDiscussion(
  discussionNumber: number,
  token?: string
): Promise<Discussion | null> {
  const graphqlWithAuth = createGraphQLClient(token);

  try {
    const response = await graphqlWithAuth<{
      repository: {
        discussion: Discussion;
      };
    }>(`
      query($number: Int!) {
        repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
          discussion(number: $number) {
            id
            number
            title
            body
            createdAt
            updatedAt
            url
            author {
              login
              avatarUrl
              url
            }
            category {
              id
              name
              slug
            }
            reactionGroups {
              content
              reactors {
                totalCount
              }
              viewerHasReacted
            }
            answerChosenAt
            answer {
              id
              body
              createdAt
              author {
                login
                avatarUrl
                url
              }
              reactionGroups {
                content
                reactors {
                  totalCount
                }
                viewerHasReacted
              }
            }
            comments(first: 100) {
              totalCount
              nodes {
                id
                body
                createdAt
                author {
                  login
                  avatarUrl
                  url
                }
                reactionGroups {
                  content
                  reactors {
                    totalCount
                  }
                  viewerHasReacted
                }
              }
            }
          }
        }
      }
    `, { number: discussionNumber });

    // Transform reactionGroups to have totalCount at the right level
    const discussion = response.repository.discussion;
    if (discussion?.reactionGroups) {
      /* eslint-disable */
      discussion.reactionGroups = (discussion.reactionGroups as any[]).map((rg) => ({
        content: rg.content,
        totalCount: rg.reactors?.totalCount || 0,
        viewerHasReacted: rg.viewerHasReacted,
      }));
      /* eslint-enable */
    }
    if (discussion?.comments?.nodes) {
      /* eslint-disable */
      discussion.comments.nodes = discussion.comments.nodes.map((c: any) => ({
        ...c,
        reactionGroups: c.reactionGroups?.map((rg: any) => ({
          content: rg.content,
          totalCount: rg.reactors?.totalCount || 0,
          viewerHasReacted: rg.viewerHasReacted,
        })),
      }));
      /* eslint-enable */
    }

    return discussion;
  } catch {
    return null;
  }
}

// Create a new discussion
export async function createDiscussion(options: {
  title: string;
  body: string;
  categorySlug: string;
  token: string;
}): Promise<{ discussion: Discussion; url: string }> {
  const { title, body, categorySlug, token } = options;
  const graphqlWithAuth = createGraphQLClient(token);

  // Get repository ID and category ID
  const [repoId, categories] = await Promise.all([
    getRepositoryId(token),
    getDiscussionCategories(token),
  ]);

  const category = categories.find(c => c.slug === categorySlug);
  if (!category) {
    throw new Error(`Category "${categorySlug}" not found`);
  }

  const response = await graphqlWithAuth<{
    createDiscussion: {
      discussion: Discussion;
    };
  }>(`
    mutation($input: CreateDiscussionInput!) {
      createDiscussion(input: $input) {
        discussion {
          id
          number
          title
          body
          createdAt
          updatedAt
          url
          author {
            login
            avatarUrl
            url
          }
          category {
            id
            name
            slug
          }
          comments(first: 0) {
            totalCount
          }
        }
      }
    }
  `, {
    input: {
      repositoryId: repoId,
      categoryId: category.id,
      title,
      body,
    },
  });

  return {
    discussion: response.createDiscussion.discussion,
    url: response.createDiscussion.discussion.url,
  };
}

// Add a comment to a discussion
export async function addDiscussionComment(options: {
  discussionId: string;
  body: string;
  token: string;
}): Promise<DiscussionComment> {
  const { discussionId, body, token } = options;
  const graphqlWithAuth = createGraphQLClient(token);

  const response = await graphqlWithAuth<{
    addDiscussionComment: {
      comment: DiscussionComment;
    };
  }>(`
    mutation($input: AddDiscussionCommentInput!) {
      addDiscussionComment(input: $input) {
        comment {
          id
          body
          createdAt
          author {
            login
            avatarUrl
            url
          }
        }
      }
    }
  `, {
    input: {
      discussionId,
      body,
    },
  });

  return response.addDiscussionComment.comment;
}

// Reaction types supported by GitHub
export const REACTION_TYPES = {
  THUMBS_UP: "THUMBS_UP",
  THUMBS_DOWN: "THUMBS_DOWN",
  LAUGH: "LAUGH",
  HOORAY: "HOORAY",
  CONFUSED: "CONFUSED",
  HEART: "HEART",
  ROCKET: "ROCKET",
  EYES: "EYES",
} as const;

export type ReactionType = keyof typeof REACTION_TYPES;

export interface ReactionGroup {
  content: ReactionType;
  totalCount: number;
  viewerHasReacted: boolean;
}

// Add reaction to a discussion or comment
export async function addReaction(options: {
  subjectId: string;
  content: ReactionType;
  token: string;
}): Promise<{ success: boolean }> {
  const { subjectId, content, token } = options;
  const graphqlWithAuth = createGraphQLClient(token);

  await graphqlWithAuth(`
    mutation($input: AddReactionInput!) {
      addReaction(input: $input) {
        reaction {
          content
        }
      }
    }
  `, {
    input: {
      subjectId,
      content,
    },
  });

  return { success: true };
}

// Remove reaction from a discussion or comment
export async function removeReaction(options: {
  subjectId: string;
  content: ReactionType;
  token: string;
}): Promise<{ success: boolean }> {
  const { subjectId, content, token } = options;
  const graphqlWithAuth = createGraphQLClient(token);

  await graphqlWithAuth(`
    mutation($input: RemoveReactionInput!) {
      removeReaction(input: $input) {
        reaction {
          content
        }
      }
    }
  `, {
    input: {
      subjectId,
      content,
    },
  });

  return { success: true };
}

// Search discussions
export async function searchDiscussions(
  searchTerm: string,
  token?: string
): Promise<Discussion[]> {
  const graphqlWithAuth = createGraphQLClient(token);

  const searchQuery = `repo:${REPO_OWNER}/${REPO_NAME} ${searchTerm}`;

  const response = await graphqlWithAuth<{
    search: {
      nodes: Discussion[];
    };
  }>(`
    query($searchQuery: String!) {
      search(query: $searchQuery, type: DISCUSSION, first: 20) {
        nodes {
          ... on Discussion {
            id
            number
            title
            body
            createdAt
            updatedAt
            url
            author {
              login
              avatarUrl
              url
            }
            category {
              id
              name
              slug
            }
            comments(first: 0) {
              totalCount
            }
          }
        }
      }
    }
  `, { searchQuery });

  return response.search.nodes;
}
