const fs = require('fs');
const crypto = require('crypto');

const mathRender = require('./renders/math');
const plantUmlRender = require('./renders/plantuml');
const markdownRender = require('./renders/markdown');
const feedRender = require('./feed/generate');

const control = require('./docs/control.json');

const ptFolder = `${__dirname}/pt`;
const enFolder = `${__dirname}/en`;

const publishFolder = `${__dirname}/docs`;

const ptFiles = fs.readdirSync(ptFolder);

const getRender = async (markdown) => {
  const html = markdownRender(markdown);
  const mathRendered = await mathRender(html);
  const graphRendered = await plantUmlRender(mathRendered);

  return graphRendered
}

const renderFiles = async (folder, template) => {
  const files = fs.readdirSync(folder);

  const pages = await Promise.all(files.map(async (file) => {
    const markdownData = fs.readFileSync(`${folder}/${file}`, 'utf-8');
    const rendered = await getRender(markdownData);

    const title = file.replace('.md', '');
    const urlParsed = title.replaceAll(' ', '-').toLowerCase();

    const content = template
      .replace('{{title}}', title)
      .replace('{{body}}', rendered);

    return { content, title, urlParsed, file };
  }))

  return pages;
}

const renderIndex = (template, pages) => {
  const body = pages
    .map((page) => `<a href='${page.url}.html'>${page.title}</a>`)
    .join();

  const content = template
    .replace('{{title}}', 'Posts')
    .replace('{{body}}', body);

  return content;
}

const main = async () => {
  const pageTemplate = fs.readFileSync(`${__dirname}/page-template.html`, 'utf-8');
  const pages = await renderFiles(ptFolder, pageTemplate);

  const index = [];
  const feed = [];

  await Promise.all(pages.map(async (page) => {
    index.push({ title: page.title, url: `./${page.urlParsed}` });

    const feedData = { title: page.title, id: `./${page.urlParsed}`, link: `./${page.urlParsed}` };

    const hash = crypto.createHash('sha1').update(page.content).digest('base64');
    const foundPublication = control.publications[page.file];

    if (foundPublication) {
      const lastVersion = foundPublication[foundPublication.length - 1];

      // Skip writes for published files without changes
      if (lastVersion.hash === hash) return;

      foundPublication.push({ hash, date: new Date() });
    } else {
      control.publications[page.file] = [{ hash, date: new Date() }];
    }

    feedData.date = control.publications[page.file][0].date;
    feed.push(feedData);

    fs.writeFileSync(`${publishFolder}/${page.urlParsed}.html`, page.content);
  }))

  const indexContent = renderIndex(pageTemplate, index);
  fs.writeFileSync('./docs/index.html', indexContent);

  const feedContent = feedRender(feed);
  fs.writeFileSync('./docs/feed/json', feedContent.json);
  fs.writeFileSync('./docs/feed/atom', feedContent.atom);
  fs.writeFileSync('./docs/feed/rss', feedContent.xml);

  fs.writeFileSync('./docs/control.json', JSON.stringify(control));
}

main().catch(err => console.log(err));
