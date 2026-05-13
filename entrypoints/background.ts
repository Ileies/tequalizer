import { getState, setState, updateSettings } from '../src/storage/storageAdapter.ts';
import type { Message } from '../src/messaging/types.ts';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (msg: Message, _sender, sendResponse: (response: unknown) => void) => {
      handleMessage(msg, sendResponse);
      return true; // keep channel open for async response
    }
  );
});

async function handleMessage(
  msg: Message,
  sendResponse: (response: unknown) => void
): Promise<void> {
  switch (msg.type) {
    case 'GET_SETTINGS': {
      const state = await getState();
      sendResponse(state.settings);
      break;
    }
    case 'UPDATE_SETTINGS': {
      await updateSettings(msg.payload);
      sendResponse(undefined);
      break;
    }
    case 'SAVE_STYLE': {
      const state = await getState();
      const existing = state.styleLibrary.findIndex((s) => s.id === msg.payload.id);
      const library =
        existing >= 0
          ? state.styleLibrary.map((s) => (s.id === msg.payload.id ? msg.payload : s))
          : [...state.styleLibrary, msg.payload];
      await setState({ styleLibrary: library });
      sendResponse(undefined);
      break;
    }
    case 'DELETE_STYLE': {
      const state = await getState();
      await setState({
        styleLibrary: state.styleLibrary.filter(
          (s) => s.id !== msg.payload.id || s.builtIn
        ),
      });
      sendResponse(undefined);
      break;
    }
    default:
      sendResponse(undefined);
  }
}
