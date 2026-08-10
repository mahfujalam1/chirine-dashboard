"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CallType,
  useCallSettingsQuery,
  useUpdateCallSettingsMutation,
} from "@/lib/redux/services/settingApis";
import { getErrorMessage } from "@/lib/utils";
import { Headphones, RefreshCw, Video } from "lucide-react";
import { toast } from "sonner";

interface CallSettingItemProps {
  callType: CallType;
  title: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  onChange: (callType: CallType, status: boolean) => void;
}

function CallSettingItem({
  callType,
  title,
  description,
  enabled,
  disabled,
  icon,
  onChange,
}: CallSettingItemProps) {
  const inputId = `${callType}-call-setting`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-[#00ACA7]">
          {icon}
        </div>
        <div className="min-w-0">
          <label htmlFor={inputId} className="cursor-pointer text-sm font-semibold text-foreground">
            {title}
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <label className={`switch shrink-0 ${disabled ? "switch-disabled" : ""}`}>
        <input
          id={inputId}
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          aria-label={`Enable ${title.toLowerCase()}`}
          onChange={(event) => onChange(callType, event.target.checked)}
        />
        <span className="slider round" />
      </label>
    </div>
  );
}

export function CallSettingsCard() {
  const { data, isLoading, isFetching, isError, refetch } =
    useCallSettingsQuery();
  const [updateCallSettings, { isLoading: isUpdating }] =
    useUpdateCallSettingsMutation();

  async function handleSettingChange(callType: CallType, status: boolean) {
    try {
      const response = await updateCallSettings({ callType, status }).unwrap();
      toast.success(
        response.message ||
          `${callType === "audio" ? "Audio" : "Video"} calls ${status ? "enabled" : "disabled"}.`,
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update call settings."));
    }
  }

  return (
    <Card className="mb-6 border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Call Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Control which calling options are available in chat channels.
        </p>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">Unable to load call settings.</p>
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <CallSettingItem
              callType="audio"
              title="Audio Calls"
              description="Allow participants to start voice calls."
              enabled={data?.data.audio ?? false}
              disabled={isLoading || isUpdating}
              icon={<Headphones className="size-5" />}
              onChange={handleSettingChange}
            />
            <CallSettingItem
              callType="video"
              title="Video Calls"
              description="Allow participants to start video calls."
              enabled={data?.data.video ?? false}
              disabled={isLoading || isUpdating}
              icon={<Video className="size-5" />}
              onChange={handleSettingChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
