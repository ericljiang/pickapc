import $ from "jquery";

export default function fetchParts(partlist, callback) {
    fetchMarkup(partlist, function(markup) {
        try {
            var build = parseMarkup(markup);
            callback(null, build);
        } catch (e) {
            console.error("Could not parse markup for " + partlist);
            console.error(markup)
            callback(e, null);
        }
    });
}

function fetchMarkup(partlist, callback) {
    var url = "https://whateverorigin.herokuapp.com/get?url="
            + encodeURIComponent("https://pcpartpicker.com/qapi/partlist/markup/?mode=markdown&partlist=" + partlist)
            + "&callback=?";
    $.getJSON(url, function(data) {
        var content = JSON.parse(data.contents).content;
        callback(content);
    });
}

function parseMarkup(markup) {
    return markup.replace(/\*/g, "")
            .split(":----|:----|:----\n")[1]
            .split("\n")
            .map(line => line.split(" | "))
            .filter(line => line.length === 3)
            .reduce(function(build, row) {
                if (row[0] === "") { // rows like "Total"
                    build[row[1]] = row[2];
                } else {
                    var part = {
                        type: row[0],
                        item: extractString(row[1], "[", "]"),
                        link: extractString(row[1], "(", ")"),
                        price: row[2].split(" @ ")[0],
                    };
                    try { // in case of manually entered price
                        part.merchant = row[2].split(" @ ")[1].trim()
                    } catch (e) {}
                    build.parts.push(part);
                }
                return build;
            }, { parts: [] });
}

function extractString(string, left, right) {
    return string.slice(string.indexOf(left) + 1, string.indexOf(right));
}
