export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type PostsResponse = Post[];