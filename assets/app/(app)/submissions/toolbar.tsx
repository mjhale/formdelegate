'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';

import { markSelectedAsSpam, markSelectedAsHam } from './actions';
import {
  clearSubmissionFormFilters,
  paginateSubmissionParams,
  searchSubmissionParams,
} from './filterParams';

export default function Toolbar({
  selectedSubmissionList,
  setSelectedSubmissionList,
  submissions,
  paginationMetadata,
  formFilterSummary,
}) {
  const searchParams = useSearchParams();
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
  const pathname = usePathname();
  const { replace } = useRouter();

  const { total, limit } = paginationMetadata;
  const currentPage = Number(searchParams.get('page')) || 1;
  const itemIndexFloor = (currentPage - 1) * limit + 1;
  const itemIndexCeiling = Math.min(itemIndexFloor + limit - 1, total);
  const selectedFormFilterCount = searchParams.getAll('form[]').length;

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
      <div className="flex flex-wrap-reverse justify-between mb-4 gap-y-3 md:flex-wrap">
        <div
          role="group"
          className="flex justify-between lg:inline-flex gap-x-1.5 w-full md:w-auto"
        >
          <div className="inline-flex items-center text-gray-600 border border-gray-200 bg-white rounded-md leading-5 px-2">
            <input
              type="checkbox"
              name="selectAllSubmissions"
              className="transition-all duration-500 ease-in-out w-4 h-4"
              onChange={handleSelectAllSubmissionsToggle}
              checked={isSelectAllChecked}
            />
          </div>
          <div className="inline-flex gap-x-1.5">
            <button
              className="inline-flex items-center justify-center px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              formAction={handleMarkSelectedAsSpam}
              form="submissions_management"
              disabled={selectedSubmissionList.size === 0}
            >
              Mark as Junk
            </button>
            <button
              className="inline-flex items-center justify-center px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              formAction={handleMarkSelectedAsHam}
              form="submissions_management"
              disabled={selectedSubmissionList.size === 0}
            >
              Mark as Not Junk
            </button>
          </div>
        </div>
        <div className="flex gap-x-3 justify-between w-full md:w-auto">
          {selectedFormFilterCount > 0 && formFilterSummary ? (
            <div className="inline-flex items-center gap-x-2 text-gray-600">
              <span>{formFilterSummary}</span>
              <button
                className="inline-flex items-center justify-center px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none"
                type="button"
                onClick={handleClearFormFilters}
              >
                Clear Filter
              </button>
            </div>
          ) : null}
          <form
            id="submissions_search"
            action={(formData) => {
              const searchTerm = formData.get('search')?.toString();
              handleSearch(searchTerm);
            }}
          >
            <input
              onChange={useDebouncedCallback((evt) => {
                handleSearch(evt.target.value);
              }, 400)}
              defaultValue={searchParams?.get('query')?.toString()}
              name="search"
              type="text"
              placeholder="Search..."
              className="px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:pointer-events-none"
            />
          </form>
          <div className="flex gap-x-3 items-center justify-start">
            <div className="font-bold hidden md:block">
              {itemIndexFloor}
              {'-'}
              {itemIndexCeiling} of {total}
            </div>
            <div className="flex gap-x-1.5">
              <button
                className="inline-flex items-center justify-center px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={itemIndexFloor <= 1 ? true : false}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {'<'}
              </button>
              <button
                className="inline-flex items-center justify-center px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={itemIndexCeiling >= total ? true : false}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
