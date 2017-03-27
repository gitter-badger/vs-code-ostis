'use strict';

import * as vs from 'vscode-languageserver';
import { getCurrentPrefix } from './scsUtils';
import { scsKeywords, scsDetails } from './scsData';
import { SCsParsedData } from './scsParsedData';

enum CompletionItemType {
    Keyword,

};

export class SCsCompletionItemProvider
{
    private parsedData: SCsParsedData;

    constructor(inParsedData: SCsParsedData) {
        this.parsedData = inParsedData;
    }

    protected isKeyword(symbol: string) : boolean {
        for (let i = 0; i < scsKeywords.length; ++i) {
            const item = scsKeywords[i];

            if (item.values.indexOf(symbol) > -1)
                return true;
        }

        return false;
    }

    protected getToken(document: vs.TextDocument,
                       position: vs.Position) : string
    {
        // get current word
        return getCurrentPrefix(document, document.offsetAt(position));
    }

    public provide(document: vs.TextDocument,
                   position: vs.Position) : vs.CompletionItem[]
    {
        let suggestions: vs.CompletionItem[] = [];
        let currentWord: string = this.getToken(document, position);

        this.provideKeywords(currentWord, suggestions);
        this.provideSymbols(this.parsedData.provideAutoComplete(document.uri, currentWord), suggestions);

        return suggestions;
    }

    public resolve(item: vs.CompletionItem) : vs.CompletionItem
    {
        let detail = scsDetails[item.label];
        if (detail) {
            item.detail = detail;
        }

        // TODO: item.documentaion
        return item;
    }

    private provideSymbols(symbols: string[],
                           items: vs.CompletionItem[])
    {
        symbols.forEach((s: string) => {
            if (!this.isKeyword(s))
                items.push(vs.CompletionItem.create(s));
        });
    }

    private provideKeywords(prefix: string,
                            items: vs.CompletionItem[])
    {
        if (prefix.length == 0)
            return;
            
        scsKeywords.forEach(key => {
            key.values.forEach(v => {
                if (v.startsWith(prefix)) {
                    let d = vs.CompletionItem.create(v);
                    d.kind = key.type;
                    items.push(d);
                }
            });
        });
    }
}
