import { Assertions, Chain, Log, Pipeline, Guard } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { document, Range } from '@ephox/dom-globals';
import { findInlinePattern } from '../../../main/ts/core/FindPatterns';

UnitTest.asynctest('Browser Test: .FormatterTest', (success, failure) => {

  const inlinePatterns = Settings.getPatternSet({}).inlinePatterns;

  const createRng = function (text, startOffset, endOffset) {

    const textNode = document.createTextNode(text);
    const rng = document.createRange();
    rng.setStart(textNode, startOffset);
    rng.setEnd(textNode, endOffset);

    return rng;
  };

  const createParagraphElementRng = function (text, startOffset, endOffset) {
    const p = document.createElement('p');
    const textNode = document.createTextNode(text);
    p.appendChild(textNode);
    const rng = document.createRange();
    rng.setStart(p, startOffset);
    rng.setEnd(p, endOffset);

    return rng;
  };

  const cGetInlinePattern = function (patterns, space) {
    return Chain.control(
      Chain.mapper(function (input) {
        const x = findInlinePattern(patterns, input as Range, space);

        return x === undefined ? 'undefined' : x;
      }),
      Guard.addLogging(`Get inline ${patterns}`)
    );
  };

  Pipeline.async({}, [
    Log.step('TBA', 'TextPattern: run on text without pattern returns undefined', Chain.asStep(createRng('text', 4, 4), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is undefined', 'undefined')
    ])),
    Log.step('TBA', 'TextPattern: run on range that is not on a text node without pattern returns undefined', Chain.asStep(
      createParagraphElementRng('text', 1, 1),
      [
        cGetInlinePattern(inlinePatterns, false),
        Assertions.cAssertEq('is undefined', 'undefined')
      ]
    )),
    Log.step('TBA', 'TextPattern: inline *** pattern end with no matching pattern start returns undefined', Chain.asStep(createRng('*x***', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Log.step('TBA', 'TextPattern: inline * with uncollapsed range returns undefined', Chain.asStep(createRng('*x* ', 3, 4), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Log.step('TBA', 'TextPattern: inline ** pattern end without start pattern returns undefined', Chain.asStep(createRng('**', 2, 2), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Log.step('TBA', 'TextPattern: inline *** end pattern without start pattern returns undefined', Chain.asStep(createRng('***', 3, 3), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Log.step('TBA', 'TextPattern: cursor in middle of pattern returns undefined', Chain.asStep(createRng('*** x***', 4, 4), [
      cGetInlinePattern(inlinePatterns, true),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),

    Log.step('TBA', 'TextPattern: inline * without content before or after', Chain.asStep(createRng('*x*', 3, 3), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 0, endOffset: 2 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline * with content before', Chain.asStep(createRng('a *x*', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline * with content before and after', Chain.asStep(createRng('a *x* b', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline * with content before and after, with space', Chain.asStep(createRng('***x* **', 6, 6), [
      cGetInlinePattern(inlinePatterns, true),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline ** without content before or after', Chain.asStep(createRng('**x**', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 0, endOffset: 3 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline ** with content before', Chain.asStep(createRng('a **x**', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 2, endOffset: 5 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline ** with content before and after', Chain.asStep(createRng('a **x** b', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 2, endOffset: 5 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline *** without content before or after', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 0, endOffset: 4 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline *** with content before', Chain.asStep(createRng('a ***x***', 9, 9), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 2, endOffset: 6 }
      )
    ])),
    Log.step('TBA', 'TextPattern: inline *** with content before and after', Chain.asStep(createRng('a ***x*** b', 9, 9), [
      cGetInlinePattern(inlinePatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 2, endOffset: 6 }
      )
    ])),
    Log.step('TBA', 'TextPattern: force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 1, endOffset: 4 }
      )
    ])),
    Log.step('TBA', 'TextPattern: force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x***', 9, 9), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 3, endOffset: 6 }
      )
    ])),
    Log.step('TBA', 'TextPattern: force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x*** **', 9, 9), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 3, endOffset: 6 }
      )
    ]))
  ], function () {
    success();
  }, failure);
});
