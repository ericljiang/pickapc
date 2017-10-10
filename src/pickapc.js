import fetchPosts from './reddit'
import fetchParts from './pcpartpicker'

export default function fetchPostsAndParts(limit, callback) {
    function accumulateBatches(posts, batchSize, after, callback) {
        fetchBatchPostsAndParts(batchSize, after, function(batch) {
            Array.prototype.push.apply(posts, batch);
            if (posts.length >= limit) {
                callback(posts.slice(0, limit));
            } else {
                after = batch[batch.length - 1].name;
                accumulateBatches(posts, batchSize, after, callback);
            }
        })
    }
    accumulateBatches([], limit * 5, "", callback);
}

/**
 * Fetches posts from /r/buildapc and appends their PCPartPicker builds to them.
 * @param {number} limit number of posts to fetch
 * @param {function} callback function to call that takes the resulting list of posts
 */
function fetchBatchPostsAndParts(limit, after, callback) {
    console.log("Fetching %d posts with parts...", limit);
    fetchBatchPostsWithList(limit, after, function (posts) {
        var processed = 0;
        posts.forEach(function (post) {
            fetchParts(post.listId, function (err, partsList) {
                processed++;
                if (err) {
                    console.error("Post causing error:", post);
                } else {
                    post.partsList = partsList;
                }
                if (processed >= posts.length) {
                    console.log("Got", processed, "posts with parts:", posts);
                    callback(posts.filter(p => p.partsList));
                }
            });
        });
    });
}

/**
 * Fetches posts from /r/buildapc that contain PCPartPicker lists.
 * @param {number} limit number of posts to attempt to fetch
 * @param {function} callback function to call that takes the resulting list of posts
 */
function fetchBatchPostsWithList(limit, after, callback) {
    fetchPosts("buildapc", limit, after, function (data) {
        var posts = data.filter(p => p.selftext.includes("pcpartpicker.com/list/"));
        posts.forEach(p => {
            p.listId = p.selftext.split("pcpartpicker.com/list/")[1].split(/[^0-9a-zA-Z-_]/)[0];
        });
        posts = posts.filter(p => p.listId.length > 1);
        callback(posts);
    });
}
