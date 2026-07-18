export type FormFilterMetadata = {
  id: string;
  name: string;
};

export function formFilterSummary(
  formIds: string[],
  forms?: FormFilterMetadata[]
): string | undefined {
  if (formIds.length === 0) {
    return undefined;
  }

  if (!forms) {
    return formIds.length === 1
      ? 'Filtered by 1 form'
      : `Filtered by ${formIds.length} forms`;
  }

  const formNamesById = new Map(forms.map((form) => [form.id, form.name]));
  const names = formIds.map(
    (formId) => formNamesById.get(formId) || 'Unavailable form'
  );

  if (names.length === 1) {
    return `Filtered by ${names[0]}`;
  }

  if (names.length === 2) {
    return `Filtered by 2 forms: ${names[0]}, ${names[1]}`;
  }

  return `Filtered by ${names.length} forms: ${names[0]}, ${names[1]}, +${names.length - 2} more`;
}
