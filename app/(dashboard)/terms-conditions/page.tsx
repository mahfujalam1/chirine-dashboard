"use client";

import { WebContentEditor } from "@/components/dashboard/manage-web/web-content-editor";
import {
  useGetTermsConditionsQuery,
  useUpdateTermsConditionsMutation,
} from "@/lib/redux/services/manageWebApis";

export default function TermsConditionsPage() {
  const query = useGetTermsConditionsQuery();
  const [updateTermsConditions, updateState] =
    useUpdateTermsConditionsMutation();

  return (
    <WebContentEditor
      title="Terms & Conditions"
      description="Review and update the terms and conditions displayed to users."
      documentLabel="Terms & Conditions"
      content={query.data?.data.description}
      updatedAt={query.data?.data.updatedAt}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      isSaving={updateState.isLoading}
      refetch={query.refetch}
      onSave={(description) =>
        updateTermsConditions({ description }).unwrap()
      }
    />
  );
}
