'use client';

import type { FormFilterMetadata } from './formFilterSummary';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { markSelectedAsHam, markSelectedAsSpam } from './actions';
import {
  clearSubmissionFormFilters,
  paginateSubmissionParams,
  searchSubmissionParams,
  setSubmissionFormFilters,
} from './filterParams';

import { Button as ActionButton } from '../_components/button';
import { Card } from '../_components/card';
import { Input } from '../_components/input';
import FormFilterPicker from './formFilterPicker';

export default function Toolbar({
  selectedSubmissionList,
  setSelectedSubmissionList,
  paginationMetadata,
  formFilterSummary,
  forms,
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { total, limit } = paginationMetadata;
  const currentPage = Number(searchParams.get('page')) || 1;
  const itemIndexFloor = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const itemIndexCeiling =
    total === 0 ? 0 : Math.min(itemIndexFloor + limit - 1, total);
  const selectedFormIds = searchParams.getAll('form[]');

  const replaceWithParams = (params: URLSearchParams) => {
    const paramsString = params.toString();
    replace(paramsString ? `${pathname}?${paramsString}` : pathname);
  };
  const resetSelection = () => setSelectedSubmissionList(new Set<string>());
  const handleMarkSelectedAsSpam = async (formData: FormData) => {
    await markSelectedAsSpam(formData);
    resetSelection();
  };
  const handleMarkSelectedAsHam = async (formData: FormData) => {
    await markSelectedAsHam(formData);
    resetSelection();
  };
  const handleSearch = (term?: string) => {
    replaceWithParams(
      searchSubmissionParams(new URLSearchParams(searchParams), term)
    );
    resetSelection();
  };
  const handleClearFormFilters = () => {
    replaceWithParams(
      clearSubmissionFormFilters(new URLSearchParams(searchParams))
    );
    resetSelection();
  };
  const handleApplyFormFilters = (formIds: string[]) => {
    replaceWithParams(
      setSubmissionFormFilters(new URLSearchParams(searchParams), formIds)
    );
    resetSelection();
  };
  const handlePageChange = (requestedPage: number) => {
    replaceWithParams(
      paginateSubmissionParams(new URLSearchParams(searchParams), requestedPage)
    );
    resetSelection();
  };

  return (
    <Card className="mb-3.5">
      <div className="grid grid-cols-[minmax(250px,_1fr)_auto_auto] items-center gap-3 p-3.5 max-lg:grid-cols-[1fr_auto] max-[520px]:grid-cols-1">
        <form
          className="relative"
          id="submissions_search"
          action={(formData) =>
            handleSearch(formData.get('search')?.toString())
          }
        >
          <label className="sr-only" htmlFor="submissions-search-input">
            Search submissions
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 z-[1] size-[17px] -translate-y-1/2 text-[#8a8b91]"
          />
          <Input
            onChange={useDebouncedCallback(
              (evt) => handleSearch(evt.target.value),
              400
            )}
            defaultValue={searchParams?.get('query')?.toString()}
            id="submissions-search-input"
            name="search"
            type="search"
            placeholder="Search sender, message, or field value…"
            search
          />
        </form>

        <div
          className="flex items-center gap-2 max-lg:col-span-full max-lg:row-start-2 max-[520px]:col-start-1 max-[520px]:row-start-3 max-[520px]:overflow-x-auto max-[520px]:[&>button]:min-w-max"
          role="group"
          aria-label="Bulk submission actions"
        >
          <ActionButton
            size="small"
            formAction={handleMarkSelectedAsSpam}
            form="submissions_management"
            disabled={selectedSubmissionList.size === 0}
          >
            Mark as junk
          </ActionButton>
          <ActionButton
            size="small"
            formAction={handleMarkSelectedAsHam}
            form="submissions_management"
            disabled={selectedSubmissionList.size === 0}
          >
            Mark as not junk
          </ActionButton>
        </div>

        <div className="flex items-center gap-2 max-lg:col-start-2 max-lg:row-start-1 max-[520px]:col-start-1 max-[520px]:row-start-2 max-[520px]:justify-between">
          <span className="mr-[3px] whitespace-nowrap text-[11px] font-[650] text-muted">
            {itemIndexFloor}–{itemIndexCeiling} of {total}
          </span>
          <ActionButton
            aria-label="Previous page"
            size="icon"
            disabled={itemIndexFloor <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" />
          </ActionButton>
          <ActionButton
            aria-label="Next page"
            size="icon"
            disabled={itemIndexCeiling >= total}
            onClick={() => handlePageChange(currentPage + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" />
          </ActionButton>
        </div>
      </div>

      <FormFilterPicker
        forms={forms as FormFilterMetadata[] | undefined}
        key={selectedFormIds.join(':')}
        onApply={handleApplyFormFilters}
        onClear={handleClearFormFilters}
        selectedFormIds={selectedFormIds}
        summary={formFilterSummary}
      />
    </Card>
  );
}
