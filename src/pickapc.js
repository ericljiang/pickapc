import fetchPosts from './reddit'
import fetchParts from './pcpartpicker'

export default function fetchPostsAndParts(sort, limit, time, callback) {
    if (limit <= 0) {
        callback([]);
        return;
    }

    var cancellable = { cancelled : false };
    cancellable.cancel = function() {
        cancellable.cancelled = true;
    }

    var batchSize = limit * 5;
    var posts = [];
    var after = "";

    function accumulateBatches() {
        fetchBatchPostsAndParts(sort, batchSize, time, after, function(batch) {
            if (cancellable.cancelled) {
                return;
            }
            Array.prototype.push.apply(posts, batch.filter(p => p.partsList));
            if (posts.length >= limit || batch.length === 0) {
                callback(posts.slice(0, limit));
            } else {
                after = batch[batch.length - 1].name;
                accumulateBatches();
            }
        })
    }

    accumulateBatches();
    return cancellable;
}

/**
 * Fetches posts from /r/buildapc and appends their PCPartPicker builds to them.
 * @param {number} limit number of posts to fetch
 * @param {function} callback function to call that takes the resulting list of posts
 */
function fetchBatchPostsAndParts(sort, limit, time, after, callback) {
    console.log("Fetching %d posts with parts...", limit);
    fetchBatchPostsWithList(sort, limit, time, after, function (posts) {
        var postsWithList = posts.filter(p => p.listId);
        if (postsWithList.length === 0) {
            callback(posts);
            return;
        }
        var processed = 0;
        postsWithList.forEach(function (post) {
            fetchParts(post.listId, function (err, partsList) {
                processed++;
                if (err) {
                    console.error("Post causing error:", post);
                } else {
                    post.partsList = partsList;
                }
                if (processed >= postsWithList.length) {
                    console.log("Got", processed, "posts with parts:", posts);
                    callback(posts);
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
function fetchBatchPostsWithList(sort, limit, time, after, callback) {
    fetchPosts("buildapc", sort, limit, time, after, function (posts) {
        posts.filter(p => p.selftext.includes("pcpartpicker.com/list/"))
            .forEach(p => {
                p.listId = p.selftext.split("pcpartpicker.com/list/")[1].split(/[^0-9a-zA-Z-_]/)[0];
            });
        callback(posts);
    });
}
