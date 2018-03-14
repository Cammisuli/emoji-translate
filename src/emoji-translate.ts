import { html, render } from 'lit-html';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

enum EmojiTranslateMode {
    emoji = 'EMOJI',
    text = 'TEXT'
}

customElements.define(
    'emoji-translate',
    class extends HTMLElement {
        translatedText: string = '';
        translateMode: EmojiTranslateMode = EmojiTranslateMode.emoji;

        __input$: Subscription;

        get template() {
            return html`
                <style>
                    :host {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        position: relative;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    input.translate {
                        padding: 0.85em 1.5em;
                        flex: 1;
                        align-self: normal;
                        border-radius: 2em;
                        background: #fff;
                        color: #535d92;
                        outline: none;
                        border: 1px solid #e3e3e3;
                        line-height: var(--emoji-translate-input-size, 10px);
                        font-size: var(--emoji-translate-input-size, 10px);
                    }
                    .translated {
                        font-size: var(--emoji-translate-input-size, 10px);
                    }
                </style>
                <input type="text" class="translate"/>
                <div class="translated">${this.translatedText}</div>
            `;
        }
        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            render(this.template, this.shadowRoot);

            // create fromEvent observable
            this.__input$ = fromEvent<KeyboardEvent>(
                this.shadowRoot.querySelector('.translate'),
                'keyup'
            )
                .pipe(
                    map((ev) => (ev.srcElement as HTMLInputElement).value),
                    debounceTime(200)
                )
                .subscribe((value) => this.__translate(value));
        }

        disconnectedCallback() {
            console.log('bye!');
            this.__input$.unsubscribe();
        }

        toggleTranslateMode() {
            if (this.translateMode == EmojiTranslateMode.emoji) {
                this.translateMode = EmojiTranslateMode.text;
            } else {
                this.translateMode = EmojiTranslateMode.emoji;
            }
        }

        translateToEmoji(value: string) {
            return [...value]
                .map((char) =>
                    String.fromCodePoint(char.charCodeAt(0) + 0x1f400)
                )
                .join('');
        }

        translateFromEmoji(value: string): string {
            return unescape(escape(value).replace(/u.{8}/g, ''));
        }

        private __translate(value: string) {
            if (this.translateMode == EmojiTranslateMode.emoji) {
                this.translatedText = this.translateToEmoji(value);
            } else {
                this.translatedText = this.translateFromEmoji(value);
            }

            render(this.template, this.shadowRoot);
        }
    }
);
