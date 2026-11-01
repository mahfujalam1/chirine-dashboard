export interface CreateEventPayload {
  event_image: File;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  entryRequirements?: string[];
  speakerName?: string;
}

export type UpdateEventPayload = Omit<CreateEventPayload, 'event_image'> & {
  event_image?: File;
};

export const buildEventFormData = (payload: CreateEventPayload) => {
  const { event_image, ...eventData } = payload;
  const formData = new FormData();

  formData.append('event_image', event_image);
  formData.append('data', JSON.stringify(eventData));

  return formData;
};

export const buildUpdateEventFormData = (payload: UpdateEventPayload) => {
  const { event_image, ...eventData } = payload;
  const formData = new FormData();
  if (event_image) formData.append('event_image', event_image);
  formData.append('data', JSON.stringify(eventData));
  return formData;
};
