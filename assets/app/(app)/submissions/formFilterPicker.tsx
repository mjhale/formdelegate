'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { FormFilterMetadata } from './formFilterSummary';

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
    const normalizedSearch = formSearch.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return forms || [];
    }

    return (forms || []).filter((form) =>
      form.name.toLocaleLowerCase().includes(normalizedSearch)
    );
  }, [formSearch, forms]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setFormSearch('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const closePicker = () => {
    setIsOpen(false);
    setFormSearch('');
  };

  const openPicker = () => {
    setDraftSelection(new Set(selectedFormIds));
    setFormSearch('');
    setIsOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const handleTriggerClick = () => {
    if (isOpen) {
      closePicker();
    } else {
      openPicker();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget &&
      !pickerRef.current?.contains(event.relatedTarget as Node)
    ) {
      closePicker();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePicker();
      triggerRef.current?.focus();
    }
  };

  const removeFilter = (formId: string) => {
    onApply(selectedFormIds.filter((selectedId) => selectedId !== formId));
  };

  const hasFormOptions = Boolean(forms?.length);
  const triggerLabel = forms
    ? hasFormOptions
      ? 'Add forms...'
      : 'No forms available'
    : 'Forms unavailable';

  return (
    <section
      aria-label={summary || 'Submission form filters'}
      className="relative mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 pr-0 md:flex-row md:items-start md:pr-20">
        <div className="flex min-h-11 shrink-0 items-center gap-2 pr-20 font-medium md:pr-0">
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4.5h18l-7 8v5.25l-4 2.25v-7.5l-7-8Z"
            />
          </svg>
          <span>Active filters</span>
        </div>

        {selectedFormIds.length > 0 ? (
          <div className="flex min-h-11 flex-wrap items-center gap-2">
            {selectedFormIds.map((formId) => {
              const formName = formNamesById.get(formId) || 'Unavailable form';

              return (
                <span
                  className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-950"
                  key={formId}
                >
                  <span className="truncate">Form: {formName}</span>
                  <button
                    aria-label={`Remove ${formName} filter`}
                    className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => removeFilter(formId)}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}

        <div
          className="relative w-full md:w-72"
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          ref={pickerRef}
        >
          <button
            aria-controls={panelId}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="flex min-h-11 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-left text-base font-medium text-gray-600 shadow-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasFormOptions}
            onClick={handleTriggerClick}
            ref={triggerRef}
            type="button"
          >
            <span>{triggerLabel}</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isOpen ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
              />
            </svg>
          </button>

          {isOpen ? (
            <div
              aria-label="Choose forms"
              className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg md:absolute md:left-0 md:top-full md:z-20 md:w-full"
              id={panelId}
              role="dialog"
            >
              <div className="p-4 pb-2">
                <label className="sr-only" htmlFor={`${panelId}-search`}>
                  Search forms
                </label>
                <input
                  className="min-h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-base text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id={`${panelId}-search`}
                  onChange={(event) => setFormSearch(event.target.value)}
                  placeholder="Search forms..."
                  ref={searchRef}
                  type="search"
                  value={formSearch}
                />
              </div>

              <fieldset className="max-h-60 overflow-y-auto px-4 pb-3">
                <legend className="sr-only">Forms</legend>
                {visibleForms.length > 0 ? (
                  visibleForms.map((form) => (
                    <label
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-1 text-sm text-gray-900 hover:bg-gray-50"
                      key={form.id}
                    >
                      <input
                        checked={draftSelection.has(form.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(event) => {
                          setDraftSelection((previousSelection) => {
                            const nextSelection = new Set(previousSelection);

                            if (event.target.checked) {
                              nextSelection.add(form.id);
                            } else {
                              nextSelection.delete(form.id);
                            }

                            return nextSelection;
                          });
                        }}
                        type="checkbox"
                      />
                      <span>{form.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="px-1 py-3 text-sm text-gray-500">
                    No forms match your search.
                  </p>
                )}
              </fieldset>

              <div className="border-t border-slate-200 p-2">
                <button
                  className="flex min-h-11 w-full items-center justify-center rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    onApply([...draftSelection]);
                    closePicker();
                  }}
                  type="button"
                >
                  Apply filters
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {selectedFormIds.length > 0 ? (
        <button
          className="absolute right-4 top-4 min-h-11 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
          onClick={onClear}
          type="button"
        >
          Clear all
        </button>
      ) : null}
    </section>
  );
}
