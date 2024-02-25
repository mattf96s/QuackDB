export type EditorSettingsState = {
  shouldFormat: boolean;
};

export type EditorSettingsContextValue = EditorSettingsState & {
  toggleShouldFormat: (shouldFormat: boolean) => void;
};
