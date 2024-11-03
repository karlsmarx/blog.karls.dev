const showdown = require('showdown');

const conversor = new showdown.Converter({
    tables: true,
    metadata: true
});

const markdownRender = (text) => conversor.makeHtml(text);

module.exports = markdownRender
