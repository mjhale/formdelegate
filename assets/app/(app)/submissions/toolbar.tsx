'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';

import { markSelectedAsSpam, markSelectedAsHam } from './actions';
import {
  clearSubmissionFormFilters,
  paginateSubmissionParams,
  searchSubmissionParams,
  setSubmissionFormFilters,
} from './filterParams';
import FormFilterPicker from './formFilterPicker';
import type { FormFilterMetadata } from './formFilterSummary';

export default function Toolbar({
  selectedSubmissionList,
  setSelectedSubmissionList,
  submissions,
  paginationMetadata,
  formFilterSummary,
  forms,
}) {
  const searchParams = useSearchParams();
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
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

  const resetSelection = () => {
    if (selectedSubmissionList.size > 0) {
      setSelectedSubmissionList(new Set());
    }

    if (isSelectAllChecked) {
      setIsSelectAllChecked(false);
    }
  };

  const handleMarkSelectedAsSpam = async (formData: FormData) => {
    await markSelectedAsSpam(formData);
    setIsSelectAllChecked(false);
    setSelectedSubmissionList(new Set());
  };

  const handleMarkSelectedAsHam = async (formData: FormData) => {
    await markSelectedAsHam(formData);
    setIsSelectAllChecked(false);
    setSelectedSubmissionList(new Set());
  };

  const handleSearch = (term?: string) => {
    const params = searchSubmissionParams(
      new URLSearchParams(searchParams),
      term
    );
    replaceWithParams(params);
    resetSelection();
  };

  const handleClearFormFilters = () => {
    const params = clearSubmissionFormFilters(
      new URLSearchParams(searchParams)
    );
    replaceWithParams(params);
    resetSelection();
  };

  const handleApplyFormFilters = (formIds: string[]) => {
    const params = setSubmissionFormFilters(
      new URLSearchParams(searchParams),
      formIds
    );
    replaceWithParams(params);
    resetSelection();
  };

  const handleSelectAllSubmissionsToggle = (
    evt: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setIsSelectAllChecked((prevIsSelectAllChecked) => !prevIsSelectAllChecked);
    setSelectedSubmissionList(() => {
      if (evt.target.checked) {
        return new Set<string>([
          ...submissions.map((submission) => submission.id),
        ]);
      } else {
        return new Set<string>();
      }
    });
  };

  const handlePageChange = (requestedPage: number) => {
    const params = paginateSubmissionParams(
      new URLSearchParams(searchParams),
      requestedPage
    );
    setIsSelectAllChecked(false);
    setSelectedSubmissionList(new Set());
    replaceWithParams(params);
  };

  return (
    <>
      <div className="mb-4 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div
          role="group"
          aria-label="Bulk submission actions"
          className="order-2 grid grid-cols-[44px_1fr_1fr] gap-2 md:order-1 md:flex md:w-auto"
        >
          <label className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-2 text-gray-600 shadow-sm">
            <span className="sr-only">Select all submissions</span>
            <input
              type="checkbox"
              name="selectAllSubmissions"
              className="h-5 w-5 transition-all duration-500 ease-in-out"
              onChange={handleSelectAllSubmissionsToggle}
              checked={isSelectAllChecked}
            />
          </label>
          <button
            className="inline-flex min-h-11 items-center justify-center whitespace-normal rounded-md border border-gray-200 bg-white px-2 text-sm font-medium leading-tight text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:whitespace-nowrap sm:px-3 sm:text-base sm:leading-6"
            formAction={handleMarkSelectedAsSpam}
            form="submissions_management"
            disabled={selectedSubmissionList.size === 0}
          >
            Mark as Junk
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center whitespace-normal rounded-md border border-gray-200 bg-white px-2 text-sm font-medium leading-tight text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:whitespace-nowrap sm:px-3 sm:text-base sm:leading-6"
            formAction={handleMarkSelectedAsHam}
            form="submissions_management"
            disabled={selectedSubmissionList.size === 0}
          >
            Mark as Not Junk
          </button>
        </div>

        <form
          className="order-1 w-full md:order-2 md:justify-self-end"
          id="submissions_search"
          action={(formData) => {
            const searchTerm = formData.get('search')?.toString();
            handleSearch(searchTerm);
          }}
        >
          <label className="sr-only" htmlFor="submissions-search-input">
            Search submissions
          </label>
          <input
            onChange={useDebouncedCallback((evt) => {
              handleSearch(evt.target.value);
            }, 400)}
            defaultValue={searchParams?.get('query')?.toString()}
            id="submissions-search-input"
            name="search"
            type="search"
            placeholder="Search..."
            className="min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-base font-medium leading-6 text-gray-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-60 md:w-72"
          />
        </form>

        <div className="order-3 flex min-h-11 items-center justify-end gap-3">
          <div className="font-bold">
            {itemIndexFloor}
            {'-'}
            {itemIndexCeiling} of {total}
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Previous page"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-base font-medium leading-6 text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={itemIndexFloor <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              type="button"
            >
              {'<'}
            </button>
            <button
              aria-label="Next page"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-base font-medium leading-6 text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={itemIndexCeiling >= total}
              onClick={() => handlePageChange(currentPage + 1)}
              type="button"
            >
              {'>'}
            </button>
          </div>
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
    </>
  );
}
