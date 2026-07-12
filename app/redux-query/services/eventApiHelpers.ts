export interface CreateEventPayload {
  eventImage: File;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

export type UpdateEventPayload = Omit<CreateEventPayload, 'eventImage'> & {
  eventImage?: File;
};

export const buildEventFormData = (payload: CreateEventPayload) => {
  const { eventImage, ...eventData } = payload;
  const formData = new FormData();

  formData.append('event_image', eventImage);
  formData.append('data', JSON.stringify(eventData));

  return formData;
};

export const buildUpdateEventFormData = (payload: UpdateEventPayload) => {
  const { eventImage, ...eventData } = payload;
  const formData = new FormData();
  if (eventImage) formData.append('event_image', eventImage);
  formData.append('data', JSON.stringify(eventData));
  return formData;
};
