import $ from "jquery";

/**
 * Fetches user posts from a subreddit.
 * @param {string} subreddit The subreddit to scan
 * @param {string} sort Reddit sorting e.g. hot, top, new
 * @param {number} limit The page size to fetch
 * @param {string} after The name of the last post of the previous page
 * @param {function} callback The function to call with response
 */
export default function fetchPosts(subreddit, sort, limit, after, callback) {
    var url = "https://www.reddit.com/r/" + subreddit + "/" + sort + ".json?"
            + "limit=" + limit + "&after=" + after + "&jsonp=?";
    console.log("Fetching %d posts from /r/%s...", limit, subreddit);
    console.debug(url);
    $.getJSON(url, function(data) {
        var posts = data.data.children
                .filter(child => child.kind === "t3")
                .filter(child => !child.data.stickied)
                .map(child => child.data);
        console.log("Got %d posts from /r/%s.", posts.length, subreddit);
        callback(posts);
    });
};
