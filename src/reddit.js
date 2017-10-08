import $ from "jquery";

export default function fetchPosts(subreddit, limit, after, callback) {
    var url = "https://www.reddit.com/r/" + subreddit + ".json?limit=" + limit + "&jsonp=?";
    console.log("Fetching %d posts from /r/%s...", limit, subreddit);
    $.getJSON(url, function(data) {
        var posts = data.data.children
                .filter(child => child.kind === "t3")
                .filter(child => !child.data.stickied)
                .map(child => child.data);
        console.log("Got %d posts from /r/%s.", posts.length, subreddit);
        callback(posts);
    });
};
