import React from 'react';

// https://stackoverflow.com/a/58618716
export default function DeferredRender({ children }) {
  const [render, setRender] = React.useState(false);

  React.useEffect(() => {
    // requestIdleCallback is an experimental feature and is currently not supported in Safari:
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
    if (!window.requestIdleCallback) {
      setRender(true);
      return;
    }

    const taskHandle = requestIdleCallback(() => setRender(true));
    const cleanup = () => cancelIdleCallback(taskHandle);
    return cleanup;
  }, []);

  return render ? children : null;
}
