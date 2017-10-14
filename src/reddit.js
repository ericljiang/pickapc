import $ from "jquery";

/**
 * Fetches user posts from a subreddit.
 * See https://www.reddit.com/dev/api#section_listings
 * @param {string} subreddit The subreddit to scan
 * @param {string} sort Reddit sorting e.g. hot, top, new
 * @param {number} limit The page size to fetch
 * @param {string} after The name of the last post of the previous page
 * @param {function} callback The function to call with response
 */
export default function fetchPosts(subreddit, sort, limit, time, after, callback) {
    var url = "https://www.reddit.com/r/" + subreddit + "/" + sort + ".json?"
            + "limit=" + limit + "&t=" + time + "&after=" + after + "&jsonp=?";
    console.log("Fetching %d posts after '%s' from /r/%s/%s...", limit, after, subreddit, sort);
    console.debug(url);
    $.getJSON(url, function(data) {
        var posts = data.data.children
                .filter(child => child.kind === "t3")
                .filter(child => !child.data.stickied)
                .map(child => child.data);
        console.log("Got %d posts from /r/%s.", posts.length, subreddit);
        callback(posts);
    });
}
