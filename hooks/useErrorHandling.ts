import { useState } from "react";

export const useErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: Error) => {
    console.error(err);
    setError(err);
  };

  const resetError = () => setError(null);

  return { error, handleError, resetError };
};
