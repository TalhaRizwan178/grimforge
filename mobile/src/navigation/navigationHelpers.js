/**
 * Leave the reader screen without stacking routes (prevents Reader ↔ Detail loops).
 */
export function leaveReader(navigation, novelId) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  // Replace — do not push Detail on top of Reader
  navigation.replace('NovelDetail', { id: novelId });
}

/**
 * Leave novel detail — skip Reader if it is directly under this screen.
 */
export function leaveNovelDetail(navigation) {
  const state = navigation.getState();
  const index = state?.index ?? 0;
  const previous = state?.routes?.[index - 1];

  if (previous?.name === 'Reader') {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
    return;
  }

  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.navigate('MainTabs');
}

/** After forging a novel: MainTabs underneath, Reader on top — back returns to tabs. */
export function openReaderAfterForge(navigation, novelId) {
  navigation.reset({
    index: 1,
    routes: [
      { name: 'MainTabs' },
      { name: 'Reader', params: { id: novelId } },
    ],
  });
}
