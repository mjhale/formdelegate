'use client';

import type { FormFilterMetadata } from './formFilterSummary';

import { ChevronDown, Filter, Search, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Input } from '../_components/input';

export default function FormFilterPicker({
  forms,
  selectedFormIds,
  summary,
  onApply,
  onClear,
}: {
  forms?: FormFilterMetadata[];
  selectedFormIds: string[];
  summary?: string;
  onApply: (formIds: string[]) => void;
  onClear: () => void;
}) {
  const panelId = useId();
  const pickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formSearch, setFormSearch] = useState('');
  const [draftSelection, setDraftSelection] = useState(
    () => new Set(selectedFormIds)
  );
  const formNamesById = useMemo(
    () => new Map(forms?.map((form) => [form.id, form.name]) || []),
    [forms]
  );
  const visibleForms = useMemo(() => {
    const s = formSearch.trim().toLocaleLowerCase();
    return s
      ? (forms || []).filter((form) =>
          form.name.toLocaleLowerCase().includes(s)
        )
      : forms || [];
  }, [formSearch, forms]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        !pickerRef.current?.contains(event.target as Node) &&
        !panelRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFormSearch('');
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const positionPanel = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 12;
      const width = Math.min(288, window.innerWidth - margin * 2);
      const below = window.innerHeight - rect.bottom - margin - 8;
      const above = rect.top - margin - 8;
      const openAbove = below < 280 && above > below;
      panel.style.width = `${width}px`;
      panel.style.maxHeight = `${Math.max(0, openAbove ? above : below)}px`;
      panel.style.left = `${Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))}px`;
      panel.style.top = `${openAbove ? Math.max(margin, rect.top - panel.getBoundingClientRect().height - 8) : rect.bottom + 8}px`;
    };
    positionPanel();
    searchRef.current?.focus({ preventScroll: true });
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [isOpen]);

  const closePicker = () => {
    setIsOpen(false);
    setFormSearch('');
  };
  const openPicker = () => {
    setDraftSelection(new Set(selectedFormIds));
    setFormSearch('');
    setIsOpen(true);
  };
  const hasFormOptions = Boolean(forms?.length);
  const triggerLabel = forms
    ? hasFormOptions
      ? 'Form name'
      : 'No forms available'
    : 'Forms unavailable';

  return (
    <section
      aria-label={summary || 'Submission form filters'}
      className="relative flex min-h-14 items-center gap-2.5 border-t border-t-[#e5ded3] bg-[rgba(247,_240,_226,_0.38)] px-3.5 py-[9px] max-[820px]:flex-wrap max-[820px]:items-center max-[520px]:p-3"
    >
      <div className="mr-0.5 flex flex-[0_0_auto] items-center gap-[7px] text-xs font-[650] text-[#4a4b50] max-[520px]:min-h-[34px] [&_svg]:h-[15px] [&_svg]:w-[15px]">
        <Filter aria-hidden="true" />
        Filters
      </div>

      {selectedFormIds.map((formId) => {
        const formName = formNamesById.get(formId) || 'Unavailable form';
        return (
          <span
            className="inline-flex min-h-8 min-w-0 items-center gap-[7px] rounded-[999px] border border-[#efc9c4] bg-brand-soft pb-1.5 pl-2.5 pr-[7px] pt-1.5 text-[11px] font-[650] text-brand-dark [&_button:hover]:bg-[rgba(191,_69,_61,_0.1)] [&_button]:grid [&_button]:h-[18px] [&_button]:w-[18px] [&_button]:flex-[0_0_18px] [&_button]:place-items-center [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-inherit [&_svg]:h-3 [&_svg]:w-3"
            key={formId}
          >
            <span className="truncate">Form: {formName}</span>
            <button
              aria-label={`Remove ${formName} filter`}
              onClick={() =>
                onApply(
                  selectedFormIds.filter((selectedId) => selectedId !== formId)
                )
              }
              type="button"
            >
              <X aria-hidden="true" />
            </button>
          </span>
        );
      })}

      <div
        className="relative w-[190px] max-[520px]:min-w-0 max-[520px]:max-w-[240px] max-[520px]:flex-[1_1_140px]"
        onBlur={(event) => {
          if (
            event.relatedTarget &&
            !pickerRef.current?.contains(event.relatedTarget as Node) &&
            !panelRef.current?.contains(event.relatedTarget as Node)
          )
            closePicker();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            closePicker();
            triggerRef.current?.focus();
          }
        }}
        ref={pickerRef}
      >
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex min-h-[34px] w-full items-center justify-between gap-2.5 rounded-[7px] border border-[#d7cfc2] bg-white pb-1.5 pl-2.5 pr-[9px] pt-1.5 text-left text-xs text-[#56575d] hover:border-[#c8bdae] hover:bg-white focus-visible:outline-offset-1 focus-visible:[outline:3px_solid_rgba(191,_69,_61,_0.16)] disabled:cursor-not-allowed disabled:opacity-[0.55] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:flex-[0_0_15px]"
          disabled={!hasFormOptions}
          onClick={() => (isOpen ? closePicker() : openPicker())}
          ref={triggerRef}
          type="button"
        >
          <span>{triggerLabel}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        {isOpen &&
          createPortal(
            <div
              aria-label="Choose forms"
              className="absolute left-0 top-[calc(100%_+_8px)] z-20 w-[288px] overflow-hidden rounded-[9px] border border-[#ded8cb] bg-white shadow-[0_18px_42px_rgba(61,_38,_26,_0.16)]"
              id={panelId}
              role="dialog"
              ref={panelRef}
              style={{ position: 'fixed', zIndex: 100, overflowY: 'auto' }}
            >
              <div className="p-3 pb-2">
                <label className="sr-only" htmlFor={`${panelId}-search`}>
                  Search forms
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 z-[1] size-[17px] -translate-y-1/2 text-[#8a8b91]"
                  />
                  <Input
                    search
                    compact
                    id={`${panelId}-search`}
                    onChange={(event) => setFormSearch(event.target.value)}
                    placeholder="Search forms"
                    ref={searchRef}
                    type="search"
                    value={formSearch}
                  />
                </div>
              </div>
              <fieldset className="max-h-60 overflow-y-auto px-3 pb-3">
                <legend className="sr-only">Forms</legend>
                {visibleForms.length > 0 ? (
                  visibleForms.map((form) => (
                    <label
                      className="flex min-h-9 cursor-pointer items-center gap-2 rounded px-2 text-sm text-slate-800 hover:bg-[#f8f5ef]"
                      key={form.id}
                    >
                      <input
                        checked={draftSelection.has(form.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#b83f38] focus:ring-[#b83f38]"
                        onChange={(event) =>
                          setDraftSelection((previousSelection) => {
                            const nextSelection = new Set(previousSelection);
                            event.target.checked
                              ? nextSelection.add(form.id)
                              : nextSelection.delete(form.id);
                            return nextSelection;
                          })
                        }
                        type="checkbox"
                      />
                      <span>{form.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    No forms match your search.
                  </p>
                )}
              </fieldset>
              <div className="border-t border-[#e7e1d6] p-2">
                <button
                  className="flex h-9 w-full items-center justify-center rounded-md text-sm font-semibold text-[#a93631] hover:bg-red-50"
                  onClick={() => {
                    onApply([...draftSelection]);
                    closePicker();
                  }}
                  type="button"
                >
                  Apply filters
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>
      {selectedFormIds.length > 0 && (
        <button
          className="ml-auto border-0 bg-[none] text-[11px] font-[650] text-muted hover:text-brand-deep max-[820px]:ml-0"
          onClick={onClear}
          type="button"
        >
          Clear all
        </button>
      )}
    </section>
  );
}
