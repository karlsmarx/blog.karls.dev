const fs = require('fs');
const crypto = require('crypto');

const mathRender = require('./renders/math');
const plantUmlRender = require('./renders/plantuml');
const markdownRender = require('./renders/markdown');

const control = require('./docs/control.json');

const ptFolder = `${__dirname}/pt`;
const enFolder = `${__dirname}/en`;

const publishFolder = `${__dirname}/docs`;

const ptFiles = fs.readdirSync(ptFolder);

const pageDefaults = `
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossorigin="anonymous">
  </head>
  <body>
  <h1>{{title}}</h1>
  {{body}}
  </body>
</html>`

const main = async () => {
    for (let file of ptFiles) {
        const markdownData = fs.readFileSync(`${ptFolder}/${file}`, 'utf-8');

        const htmlData = markdownRender(markdownData);
    
        const page = pageDefaults
            .replace('{{title}}', file.replace('.md', ''))
            .replace('{{body}}', htmlData);

        const mathRendered = await mathRender(page);
        const graphRendered = await plantUmlRender(mathRendered);

        const hash = crypto.createHash('sha1').update(graphRendered).digest('base64');
        
        const foundPublication = control.publications[file];

        if (foundPublication) {
          const lastVersion = foundPublication[foundPublication.length - 1];

          if (lastVersion.hash === hash) continue;

          foundPublication.push({ hash, date: new Date() });
        } else {
          control.publications[file] = [{ hash, date: new Date() }];
        }

        fs.writeFileSync(`${publishFolder}/${file}.html`, graphRendered);
    }

    fs.writeFileSync('./docs/control.json', JSON.stringify(control));
}

main().catch(err => console.log(err));
