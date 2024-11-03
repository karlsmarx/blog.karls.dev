const katex = require('katex');
const { JSDOM } = require('jsdom');

const mathRender = async (text) => {
    const latexInlineExpression = /\<equation\>(.*)\<\/equation\>/g;
    const expResult = latexInlineExpression.exec(text);

    const newText = text.replace(latexInlineExpression, katex.renderToString(expResult[1]));

    const jsDom = new JSDOM();
    const parser = new jsDom.window.DOMParser();

    const wrapper = parser.parseFromString(newText, 'text/html').body;
    const blocks = wrapper.querySelectorAll('code.latex.language-latex');

    return new Promise((resolve, reject) => {
        blocks.forEach((element) => {
            const input = element.textContent;
            const html = katex.renderToString(input, { displayMode: true });
    
            element.parentNode.outerHTML = `<span title="${input.trim()}">${html}</span>`;
        });
    
        return resolve(wrapper.innerHTML);
    })
}

module.exports = mathRender;
