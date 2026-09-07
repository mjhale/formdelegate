import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import MessageForm from '../../_components/messageForm';
import { Button, ButtonAnchor, buttonClasses } from './button';
import { Input } from './input';

describe('shared Tailwind button variants', () => {
  it('selects one appearance without legacy marker classes', () => {
    const primary = buttonClasses({ variant: 'primary' }).split(' ');
    const danger = buttonClasses({ variant: 'danger' }).split(' ');

    assert.ok(primary.includes('bg-brand'));
    assert.ok(!primary.includes('bg-surface'));
    assert.ok(!primary.includes('bg-brand-soft'));
    assert.ok(danger.includes('bg-brand-soft'));
    assert.ok(!danger.includes('bg-brand'));
    assert.ok(!danger.some((token) => token.includes('fd-')));
  });

  it('does not mix default padding into small or icon buttons', () => {
    const small = buttonClasses({ size: 'small' }).split(' ');
    const icon = buttonClasses({ size: 'icon' }).split(' ');

    assert.ok(small.includes('px-2.5'));
    assert.ok(!small.includes('px-[13px]'));
    assert.ok(icon.includes('p-0'));
    assert.ok(!icon.includes('px-2.5'));
    assert.ok(!icon.includes('px-[13px]'));
  });

  it('forwards native form and accessibility props', () => {
    const markup = renderToStaticMarkup(
      Button({
        'aria-label': 'Save profile',
        children: 'Save',
        disabled: true,
        form: 'profile',
        name: 'intent',
        type: 'submit',
        value: 'save',
        variant: 'primary',
      })
    );

    for (const attribute of [
      'aria-label="Save profile"',
      'disabled=""',
      'form="profile"',
      'name="intent"',
      'type="submit"',
      'value="save"',
    ]) {
      assert.ok(markup.includes(attribute), attribute);
    }
    assert.ok(!markup.includes('variant='));
  });

  it('preserves external link attributes', () => {
    const markup = renderToStaticMarkup(
      ButtonAnchor({
        children: 'Repository',
        href: 'https://github.com/mjhale/formdelegate',
        rel: 'noopener noreferrer',
        target: '_blank',
      })
    );

    assert.ok(markup.includes('rel="noopener noreferrer"'));
    assert.ok(markup.includes('target="_blank"'));
    assert.ok(markup.includes('href="https://github.com/mjhale/formdelegate"'));
  });
});

describe('shared Tailwind input variants', () => {
  it('keeps stacked textarea classes separate and avoids conflicting heights', () => {
    const markup = renderToStaticMarkup(
      createElement(MessageForm, {
        formLabel: 'Support form',
        layout: 'stacked',
      })
    );
    const textarea = markup.match(/<textarea\b[^>]*class="([^"]*)"/);
    assert.ok(textarea);
    const classes = textarea[1].split(' ');
    assert.ok(classes.includes('min-h-[132px]'));
    assert.ok(classes.includes('resize-y'));
    assert.ok(!classes.includes('min-h-10'));
    assert.ok(classes.includes('focus:ring-brand/[0.14]'));
  });

  it('uses explicit search padding and compact height', () => {
    const markup = renderToStaticMarkup(
      Input({
        'aria-label': 'Search forms',
        compact: true,
        defaultValue: 'Contact',
        name: 'search',
        search: true,
        type: 'search',
      })
    );

    assert.ok(markup.includes('pl-[38px]'));
    assert.ok(markup.includes('min-h-9'));
    assert.ok(!markup.includes('min-h-10'));
    assert.ok(!markup.includes('px-3'));
    assert.ok(markup.includes('aria-label="Search forms"'));
    assert.ok(markup.includes('value="Contact"'));
    assert.ok(!markup.includes('compact='));
    assert.ok(!markup.includes('search="true"'));
  });
});
