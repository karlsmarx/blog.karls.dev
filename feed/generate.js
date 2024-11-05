const { Feed } = require('feed');

const defaults = require('./defaults.json');

const generate = (data) => {
    const feed = new Feed(defaults.feed);

    for (let post of data) {
        feed.addItem({
            ...defaults.post,
            title: post.title,
            id: post.url,
            link: post.url,
            description: post.description,
            date: post.date,
        });
    }

    return { xml: feed.rss2(), json: feed.json1(), atom: feed.atom1() };
}

module.exports = generate;
