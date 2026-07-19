export type SubmissionsSearchParams = {
  query?: string;
  page?: string;
  'form[]'?: string | string[];
};

export function parseSubmissionFormIds(
  searchParams?: SubmissionsSearchParams
): string[] {
  const formParam = searchParams?.['form[]'];
  const formIds = Array.isArray(formParam)
    ? formParam
    : formParam === undefined
      ? []
      : [formParam];

  return [...new Set(formIds)];
}

export function buildSubmissionApiSearchParams({
  page,
  query,
  formIds,
}: {
  page: number;
  query: string;
  formIds: string[];
}): URLSearchParams {
  const params = new URLSearchParams({ page: page.toString() });

  if (query) {
    params.set('query', query);
  }

  for (const formId of formIds) {
    params.append('form[]', formId);
  }

  return params;
}

export function searchSubmissionParams(
  currentParams: URLSearchParams,
  term?: string
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }

  params.delete('page');
  return params;
}

export function paginateSubmissionParams(
  currentParams: URLSearchParams,
  requestedPage: number
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  if (requestedPage > 1) {
    params.set('page', requestedPage.toString());
  } else {
    params.delete('page');
  }

  return params;
}

export function clearSubmissionFormFilters(
  currentParams: URLSearchParams
): URLSearchParams {
  return setSubmissionFormFilters(currentParams, []);
}

export function setSubmissionFormFilters(
  currentParams: URLSearchParams,
  formIds: string[]
): URLSearchParams {
  const params = new URLSearchParams(currentParams);
  params.delete('form[]');

  for (const formId of new Set(formIds)) {
    params.append('form[]', formId);
  }

  params.delete('page');
  return params;
}
