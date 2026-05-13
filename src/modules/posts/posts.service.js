const postsRepository = require(
  "./posts.repository"
);

const createPostService = async (
  postData,
  userId
) => {
  const { title, content } = postData;

  const post =
    await postsRepository.createPost(
      title,
      content,
      userId
    );

  return post;
};

const getAllPostsService = async () => {
  return await postsRepository.getAllPosts();
};

const getPostByIdService = async (
  id
) => {
  const post =
    await postsRepository.getPostById(id);

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
};


const updatePostService = async (postId,postData,userId) => {
    
    const existingPost = await postsRepository.getPostById(postId);

    if(!existingPost){
        throw new Error("Post not found");
    }
    if(existingPost.author_id !== userId){
        throw new Error(
      "You are not allowed to update this post"
       );
    }

    const updatedPost = await postsRepository.updatepost(postId,postData.title,postData.content);
    return updatedPost;
}

const deletePostService = async (
  postId,
  userId
) => {
  // Find existing post
  const existingPost =
    await postsRepository.getPostById(
      postId
    );

  // Check post exists
  if (!existingPost) {
    throw new Error("Post not found");
  }

  // Ownership check
  if (
    existingPost.author_id !== userId
  ) {
    throw new Error(
      "You are not allowed to delete this post"
    );
  }

  // Delete post
  const deletedPost =
    await postsRepository.deletePost(
      postId
    );

  return deletedPost;
};

module.exports = {
  createPostService,
  getAllPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
};