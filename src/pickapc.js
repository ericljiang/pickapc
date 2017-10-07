import fetchPosts from './reddit'
import fetchParts from './pcpartpicker'

/**
 * Fetches posts from /r/buildapc and appends their PCPartPicker builds to them.
 * @param {number} limit number of posts to fetch
 * @param {function} callback function to call that takes the resulting list of posts
 */
export default function fetchPostsAndParts(limit, callback) {
    fetchPostsWithList(limit, function (posts) {
        var count = 0;
        posts.forEach(function (post) {
            fetchParts(post.listId, function (err, partsList) {
                if (err) {
                    console.error("Post causing error:");
                    console.error(post);
                }
                post.partsList = partsList;
                count++;
                if (count >= posts.length) {
                    callback(posts);
                }
            });
        });
    });
}

/**
 * Fetches posts from /r/buildapc that contain PCPartPicker lists.
 * @param {number} limit number of posts to fetch
 * @param {function} callback function to call that takes the resulting list of posts
 */
function fetchPostsWithList(limit, callback) {
    var posts = [];
    function fetchBatch(batchSize, after) {
        fetchPosts("buildapc", batchSize, after, function(data) {
            var postsWithLists = data.filter(p => {
                return p.selftext.includes("pcpartpicker.com/list/");
            });
            postsWithLists.forEach(p => {
                p.listId = p.selftext.split("pcpartpicker.com/list/")[1].split(/[\s)\]]/)[0];
            });
            postsWithLists = postsWithLists.filter(p => {
                return p.listId.length > 1;
            });
            Array.prototype.push.apply(posts, postsWithLists);
            if (posts.length < limit) {
                fetchBatch(batchSize, posts[posts.length - 1].name);
            } else {
                callback(posts.slice(0, limit));
            }
        });
    }
    fetchBatch(limit * 4);
}
