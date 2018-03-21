import './emoji-translate';

import { html, render } from 'lit-html/lib/lit-extended';

customElements.define(
    'app-element',
    class extends HTMLElement {
        get template() {
            return html`
                <h1>Emoji Translator</h1>
                <button on-click="${() => this.toggleTranslation()}">Toggle Modes</button>
                <emoji-translate></emoji-translate>
            `;
        }
        connectedCallback() {
            render(this.template, this);
        }

        toggleTranslation() {
            const translate: any = this.querySelector('emoji-translate');
            translate.toggleTranslateMode()
        }
    }
);
