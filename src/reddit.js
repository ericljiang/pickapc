import $ from "jquery";

export default function fetchPosts(subreddit, limit, after, callback) {
    var url = "https://whateverorigin.herokuapp.com/get?url="
            + encodeURIComponent("http://reddit.com/r/" + subreddit + ".json"
                    + "?limit=" + limit + "&after=" + after)
            + "&callback=?";
    $.getJSON(url, function(data) {
        var posts = JSON.parse(data.contents).data.children
                .filter(thing => thing.kind === "t3")
                .filter(thing => !thing.data.stickied)
                .map(thing => thing.data);
        callback(posts);
    });
};
