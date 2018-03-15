import './emoji-translate';

import { html, render } from 'lit-html';

customElements.define(
    'app-element',
    class extends HTMLElement {
        get template() {
            return html`
                <h1>Emoji Translator</h1>
                <emoji-translate></emoji-translate>
            `;
        }
        connectedCallback() {
            render(this.template, this);
        }
    }
);
