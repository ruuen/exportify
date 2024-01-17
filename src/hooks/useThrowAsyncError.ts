import { useState } from "react";

// Use this to throw errors to the nearest ErrorBoundary from async code (like useTimeout() or fetch())
// Returned func updates internal state to a func which throws error when React calls it during render
// Since the error is thrown in React lifecycle and not in async scope, it can be passed to an ErrorBoundary
function useThrowAsyncError() {
  const [_state, setState] = useState();

  return (error: unknown) => {
    setState(() => {
      throw error;
    });
  };
}

export default useThrowAsyncError;
