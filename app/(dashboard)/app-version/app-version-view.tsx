"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AppPlatform,
  AppVersionSetting,
  AppVersionStatus,
  useGetAppVersionsQuery,
  useSaveAppVersionsMutation,
} from "@/lib/redux/services/appVersionApis";
import { getErrorMessage } from "@/lib/utils";
import {
  AlertCircle,
  Apple,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Save,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type AppVersionForm = Omit<
  AppVersionSetting,
  "latestBuildNumber" | "minimumBuildNumber"
> & {
  latestBuildNumber: string;
  minimumBuildNumber: string;
};

type FormErrors = Partial<Record<keyof AppVersionForm, string>>;

const VERSION_PATTERN = /^\d+(?:\.\d+)*$/;

const DEFAULT_VERSIONS: Record<AppPlatform, AppVersionForm> = {
  android: {
    platform: "android",
    latestVersion: "1.0.2",
    minimumVersion: "1.0.2",
    latestBuildNumber: "27",
    minimumBuildNumber: "27",
    forceUpdate: false,
    updateAvailable: false,
    title: "Update Available",
    message: "A new version of MindShift Peer Connect is available.",
    updateButtonText: "Update now",
    laterButtonText: "Later",
    storeUrl:
      "https://play.google.com/store/apps/details?id=com.chirine.mindshiftpeerconnect",
    releaseNotes: "",
    status: "draft",
  },
  ios: {
    platform: "ios",
    latestVersion: "1.0.2",
    minimumVersion: "1.0.2",
    latestBuildNumber: "27",
    minimumBuildNumber: "27",
    forceUpdate: false,
    updateAvailable: false,
    title: "Update Available",
    message: "A new version of MindShift Peer Connect is available.",
    updateButtonText: "Update now",
    laterButtonText: "Later",
    storeUrl: "https://apps.apple.com/app/idYOUR_APP_ID",
    releaseNotes: "",
    status: "draft",
  },
};

function toFormValue(value: AppVersionSetting): AppVersionForm {
  return {
    ...DEFAULT_VERSIONS[value.platform],
    ...value,
    latestBuildNumber: String(value.latestBuildNumber),
    minimumBuildNumber: String(value.minimumBuildNumber),
    laterButtonText: value.laterButtonText ?? "",
  };
}

function compareVersions(left: string, right: string) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}

function validateVersion(form: AppVersionForm): FormErrors {
  const errors: FormErrors = {};

  if (form.platform !== "android" && form.platform !== "ios") {
    errors.platform = "Platform must be Android or iOS.";
  }

  if (!["draft", "published", "disabled"].includes(form.status)) {
    errors.status = "Select a valid status.";
  }

  if (!form.latestVersion.trim()) {
    errors.latestVersion = "Latest version is required.";
  } else if (!VERSION_PATTERN.test(form.latestVersion.trim())) {
    errors.latestVersion = "Use numbers and dots only, for example 1.0.3.";
  }

  if (!form.minimumVersion.trim()) {
    errors.minimumVersion = "Minimum version is required.";
  } else if (!VERSION_PATTERN.test(form.minimumVersion.trim())) {
    errors.minimumVersion = "Use numbers and dots only, for example 1.0.2.";
  }

  if (!/^\d+$/.test(form.latestBuildNumber)) {
    errors.latestBuildNumber = "Enter a whole number.";
  }

  if (!/^\d+$/.test(form.minimumBuildNumber)) {
    errors.minimumBuildNumber = "Enter a whole number.";
  }

  if (!form.storeUrl.trim()) {
    errors.storeUrl = "Store URL is required.";
  } else {
    try {
      new URL(form.storeUrl);
    } catch {
      errors.storeUrl = "Enter a valid store URL.";
    }
  }

  if (
    VERSION_PATTERN.test(form.latestVersion.trim()) &&
    VERSION_PATTERN.test(form.minimumVersion.trim()) &&
    compareVersions(form.minimumVersion, form.latestVersion) > 0
  ) {
    errors.minimumVersion = "Minimum version cannot exceed latest version.";
  }

  if (
    /^\d+$/.test(form.latestBuildNumber) &&
    /^\d+$/.test(form.minimumBuildNumber) &&
    Number(form.minimumBuildNumber) > Number(form.latestBuildNumber)
  ) {
    errors.minimumBuildNumber =
      "Minimum build cannot exceed latest build.";
  }

  return errors;
}

function ToggleField({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border p-4">
      <div>
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ACA7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-[#00ACA7]" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function PopupPreview({ form }: { form: AppVersionForm }) {
  const showsPopup = form.status === "published" && form.updateAvailable;
  const updateType = !showsPopup
    ? "none"
    : form.forceUpdate
      ? "force"
      : "optional";

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Popup Preview</CardTitle>
          <Badge variant={showsPopup ? "default" : "secondary"}>
            {updateType}
          </Badge>
        </div>
        <CardDescription>
          Preview of the update prompt shown in the mobile app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showsPopup && (
          <div className="mb-4 flex gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            This configuration will not show a popup. Publish it and enable
            Update Available to activate the prompt.
          </div>
        )}
        <div className="mx-auto max-w-sm rounded-[2rem] border-8 border-slate-900 bg-background p-5 shadow-xl">
          <div className="mb-5 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#00ACA7]/10 text-[#00ACA7]">
              {form.platform === "ios" ? (
                <Apple className="size-7" />
              ) : (
                <Smartphone className="size-7" />
              )}
            </div>
          </div>
          <h3 className="text-center text-lg font-semibold">
            {form.title || "Update Available"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-center text-sm text-muted-foreground">
            {form.message || "A new version is available."}
          </p>
          {form.releaseNotes && (
            <div className="mt-4 rounded bg-muted/60 p-3">
              <p className="mb-1 text-xs font-medium">What&apos;s new</p>
              <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                {form.releaseNotes}
              </p>
            </div>
          )}
          <div className="mt-5 space-y-2">
            <div className="rounded bg-[#00ACA7] px-4 py-2.5 text-center text-sm font-medium text-white">
              {form.updateButtonText || "Update"}
            </div>
            {!form.forceUpdate && form.laterButtonText && (
              <div className="rounded border px-4 py-2.5 text-center text-sm font-medium">
                {form.laterButtonText}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppVersionClientView() {
  const [activePlatform, setActivePlatform] =
    useState<AppPlatform>("android");
  const [forms, setForms] =
    useState<Record<AppPlatform, AppVersionForm>>(DEFAULT_VERSIONS);
  const [errors, setErrors] = useState<
    Record<AppPlatform, FormErrors>
  >({ android: {}, ios: {} });
  const hasInitializedForms = useRef(false);

  const query = useGetAppVersionsQuery();
  const [saveAppVersions, saveState] = useSaveAppVersionsMutation();

  useEffect(() => {
    if (!query.data || hasInitializedForms.current) return;

    const nextForms = { ...DEFAULT_VERSIONS };
    for (const setting of query.data.data.appVersions ?? []) {
      if (setting.platform === "android" || setting.platform === "ios") {
        nextForms[setting.platform] = toFormValue(setting);
      }
    }
    setForms(nextForms);
    hasInitializedForms.current = true;
  }, [query.data]);

  const activeForm = forms[activePlatform];
  const activeErrors = errors[activePlatform];

  function updateField<K extends keyof AppVersionForm>(
    field: K,
    value: AppVersionForm[K],
  ) {
    setForms((current) => ({
      ...current,
      [activePlatform]: {
        ...current[activePlatform],
        [field]: value,
      },
    }));
    setErrors((current) => ({
      ...current,
      [activePlatform]: { ...current[activePlatform], [field]: undefined },
    }));
  }

  async function handleSave() {
    const nextErrors = {
      android: validateVersion(forms.android),
      ios: validateVersion(forms.ios),
    };
    setErrors(nextErrors);

    const invalidPlatform = (["android", "ios"] as const).find(
      (platform) => Object.keys(nextErrors[platform]).length > 0,
    );
    if (invalidPlatform) {
      setActivePlatform(invalidPlatform);
      toast.error(`Please fix the ${invalidPlatform} version settings.`);
      return;
    }

    const appVersions: AppVersionSetting[] = (
      ["android", "ios"] as const
    ).map((platform) => {
      const form = forms[platform];
      return {
        ...form,
        latestVersion: form.latestVersion.trim(),
        minimumVersion: form.minimumVersion.trim(),
        latestBuildNumber: Number(form.latestBuildNumber),
        minimumBuildNumber: Number(form.minimumBuildNumber),
        title: form.title.trim(),
        message: form.message.trim(),
        updateButtonText: form.updateButtonText.trim(),
        laterButtonText: form.forceUpdate
          ? null
          : form.laterButtonText?.trim() || null,
        storeUrl: form.storeUrl.trim(),
        releaseNotes: form.releaseNotes.trim(),
      };
    });

    try {
      const response = await saveAppVersions({ appVersions }).unwrap();
      toast.success(response.message || "App version settings saved.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save app version settings."));
    }
  }

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="App Version"
          description="Manage Android and iOS mobile update prompts."
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Skeleton className="h-[800px]" />
          <Skeleton className="h-[520px]" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="App Version"
          description="Manage Android and iOS mobile update prompts."
        />
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="size-9 text-destructive" />
            <div>
              <p className="font-medium">Unable to load app version settings</p>
              <p className="text-sm text-muted-foreground">
                Check the API connection and try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => query.refetch()}>
              <RefreshCw className="size-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Version"
        description="Control mobile update prompts independently for Android and iOS."
      >
        <Button
          className="bg-[#00ACA7] text-white hover:bg-[#009b97]"
          disabled={saveState.isLoading}
          onClick={handleSave}
        >
          {saveState.isLoading ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saveState.isLoading ? "Saving..." : "Save all settings"}
        </Button>
      </PageHeader>

      <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">How update prompts work</p>
            <p>
              Only Published settings affect the mobile app. Force Update blocks
              users until they update; optional updates let them continue with
              the Later button.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["android", "ios"] as const).map((platform) => (
          <Button
            key={platform}
            variant={activePlatform === platform ? "default" : "outline"}
            className={
              activePlatform === platform ? "bg-[#00ACA7] text-white" : ""
            }
            onClick={() => setActivePlatform(platform)}
          >
            {platform === "android" ? (
              <Smartphone className="size-4" />
            ) : (
              <Apple className="size-4" />
            )}
            {platform === "android" ? "Android" : "iOS"}
            {Object.keys(errors[platform]).length > 0 && (
              <span className="size-2 rounded-full bg-destructive" />
            )}
          </Button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activePlatform === "android" ? (
                <Smartphone className="size-5 text-[#00ACA7]" />
              ) : (
                <Apple className="size-5 text-[#00ACA7]" />
              )}
              {activePlatform === "android" ? "Android" : "iOS"} Settings
            </CardTitle>
            <CardDescription>
              Configure version requirements and the update popup content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Input
                  value={
                    activePlatform === "android" ? "Android" : "iOS"
                  }
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={activeForm.status}
                  onValueChange={(value) =>
                    updateField("status", value as AppVersionStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={activeErrors.status} />
                <p className="text-xs text-muted-foreground">
                  Draft and Disabled settings do not show a popup.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-latest-version`}>
                  Latest Version <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${activePlatform}-latest-version`}
                  value={activeForm.latestVersion}
                  placeholder="1.0.3"
                  aria-invalid={!!activeErrors.latestVersion}
                  onChange={(event) =>
                    updateField("latestVersion", event.target.value)
                  }
                />
                <FieldError message={activeErrors.latestVersion} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-latest-build`}>
                  Latest Build Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${activePlatform}-latest-build`}
                  type="number"
                  min="0"
                  step="1"
                  value={activeForm.latestBuildNumber}
                  aria-invalid={!!activeErrors.latestBuildNumber}
                  onChange={(event) =>
                    updateField("latestBuildNumber", event.target.value)
                  }
                />
                <FieldError message={activeErrors.latestBuildNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-minimum-version`}>
                  Minimum Version <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${activePlatform}-minimum-version`}
                  value={activeForm.minimumVersion}
                  placeholder="1.0.2"
                  aria-invalid={!!activeErrors.minimumVersion}
                  onChange={(event) =>
                    updateField("minimumVersion", event.target.value)
                  }
                />
                <FieldError message={activeErrors.minimumVersion} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-minimum-build`}>
                  Minimum Build Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${activePlatform}-minimum-build`}
                  type="number"
                  min="0"
                  step="1"
                  value={activeForm.minimumBuildNumber}
                  aria-invalid={!!activeErrors.minimumBuildNumber}
                  onChange={(event) =>
                    updateField("minimumBuildNumber", event.target.value)
                  }
                />
                <FieldError message={activeErrors.minimumBuildNumber} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${activePlatform}-store-url`}>
                Store URL <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`${activePlatform}-store-url`}
                  type="url"
                  value={activeForm.storeUrl}
                  aria-invalid={!!activeErrors.storeUrl}
                  onChange={(event) =>
                    updateField("storeUrl", event.target.value)
                  }
                />
                {activeForm.storeUrl && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={activeForm.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open store URL"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
              </div>
              <FieldError message={activeErrors.storeUrl} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleField
                id={`${activePlatform}-update-available`}
                label="Update Available"
                description="Allow the mobile app to show an update prompt."
                checked={activeForm.updateAvailable}
                onChange={(checked) =>
                  updateField("updateAvailable", checked)
                }
              />
              <ToggleField
                id={`${activePlatform}-force-update`}
                label="Force Update"
                description="Block users until they install the update."
                checked={activeForm.forceUpdate}
                onChange={(checked) => updateField("forceUpdate", checked)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-title`}>Popup Title</Label>
                <Input
                  id={`${activePlatform}-title`}
                  value={activeForm.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activePlatform}-update-button`}>
                  Update Button Text
                </Label>
                <Input
                  id={`${activePlatform}-update-button`}
                  value={activeForm.updateButtonText}
                  onChange={(event) =>
                    updateField("updateButtonText", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${activePlatform}-message`}>
                  Popup Message
                </Label>
                <Textarea
                  id={`${activePlatform}-message`}
                  rows={3}
                  value={activeForm.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${activePlatform}-later-button`}>
                  Later Button Text
                </Label>
                <Input
                  id={`${activePlatform}-later-button`}
                  value={activeForm.laterButtonText ?? ""}
                  disabled={activeForm.forceUpdate}
                  placeholder={
                    activeForm.forceUpdate
                      ? "Unavailable for forced updates"
                      : "Leave empty to hide the button"
                  }
                  onChange={(event) =>
                    updateField("laterButtonText", event.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {activeForm.forceUpdate
                    ? "Forced updates cannot be skipped, so this value is sent as null."
                    : "Leave empty to hide the Later button."}
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${activePlatform}-release-notes`}>
                  Release Notes
                </Label>
                <Textarea
                  id={`${activePlatform}-release-notes`}
                  rows={5}
                  placeholder={"• Improved chat experience\n• Bug fixes"}
                  value={activeForm.releaseNotes}
                  onChange={(event) =>
                    updateField("releaseNotes", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end border-t pt-5 sm:hidden">
              <Button
                className="w-full bg-[#00ACA7] text-white"
                disabled={saveState.isLoading}
                onClick={handleSave}
              >
                <Save className="size-4" /> Save all settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <PopupPreview form={activeForm} />
      </div>
    </div>
  );
}
