export type EventType = 'Assignment' | 'Lecture' | 'Workshop' | 'Social' | 'Test' | string;

export interface AppEvent {
  _id: string;          // Mongoose automatically creates this
  name: string;         // Replaces 'title' from the earlier mock
  description: string;
  date: string;         // Backend Date comes as an ISO 8601 string in JSON
  location: string;
  type: EventType;
  owner: string;        // Assuming the populated User is not returned, just the ID
  createdAt: string;    // From timestamps: true
  updatedAt: string;    // From timestamps: true
}

export interface CreateEventPayload {
  name: string;
  description: string;
  date: string; // ISO 8601 string expected by your backend
  location: string;
  type: string;
}