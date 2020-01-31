const {env} = process;

module.exports = {
  COMMENTS_PATH: env.COMMENTS_STORE_PATH || 'data/comments.json'
};
