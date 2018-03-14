import { html, render } from 'lit-html';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

enum EmojiTranslateMode {
    toEmoji = 'EMOJI',
    toText = 'TEXT'
}

customElements.define(
    'emoji-translate',
    class extends HTMLElement {
        translatedText: string = '';
        translateMode: EmojiTranslateMode = EmojiTranslateMode.toEmoji;

        __input$: Subscription;

        get template() {
            return html`
                <div class="container">
                    <input type="text" class="translate"/>
                    <div>${this.translatedText}</div>
                </div>
                
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
            if (this.translateMode == EmojiTranslateMode.toEmoji) {
                this.translateMode = EmojiTranslateMode.toText;
            } else {
                this.translateMode = EmojiTranslateMode.toEmoji;
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
            if (this.translateMode == EmojiTranslateMode.toEmoji) {
                this.translatedText = this.translateToEmoji(value);
            } else {
                this.translatedText = this.translateFromEmoji(value);
            }

            render(this.template, this.shadowRoot);
        }
    }
);
