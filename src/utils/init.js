import {
  init,
} from "@telegram-apps/sdk";

/**
 * Initializes the application and configures its dependencies.
 */
export function initApp(debug = false) {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  try {
    init();

    // Add Eruda if needed.
    debug &&
      import("eruda")
        .then((lib) => lib.default.init())
        .catch(console.error);
  } catch (error) {
    console.warn('Telegram SDK initialization failed:', error);
    // In development, we might want to continue even if initialization fails
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }

//   // Check if all required components are supported.
//   if (!backButton.isSupported() || !miniApp.isSupported()) {
//     throw new Error("ERR_NOT_SUPPORTED");
//   }

//   // Mount all components used in the project.
//   backButton.mount();
//   miniApp.mount();
//   themeParams.mount();
//   initData.restore();
//   void viewport
//     .mount()
//     .catch((e) => {
//       console.error("Something went wrong mounting the viewport", e);
//     })
//     .then(() => {
//       viewport.bindCssVars();
//     });

//   // Define components-related CSS variables.
//   miniApp.bindCssVars();
//   themeParams.bindCssVars();
}
