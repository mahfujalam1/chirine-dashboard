"use client";

import { WebContentEditor } from "@/components/dashboard/manage-web/web-content-editor";
import {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "@/lib/redux/services/manageWebApis";

export default function PrivacyPolicyPage() {
  const query = useGetPrivacyPolicyQuery();
  const [updatePrivacyPolicy, updateState] = useUpdatePrivacyPolicyMutation();

  return (
    <WebContentEditor
      title="Privacy Policy"
      description="Review and update the privacy policy displayed to users."
      documentLabel="Privacy Policy"
      content={query.data?.data.description}
      updatedAt={query.data?.data.updatedAt}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      isSaving={updateState.isLoading}
      refetch={query.refetch}
      onSave={(description) =>
        updatePrivacyPolicy({ description }).unwrap()
      }
    />
  );
}
