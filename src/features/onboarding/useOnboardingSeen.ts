import { useCallback, useEffect, useState } from "react";
import { getOnboardingSeen, setOnboardingSeen } from "./onboardingStorage";

export function useOnboardingSeen() {
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    getOnboardingSeen()
      .then((v) => setSeen(v))
      .finally(() => setLoading(false));
  }, []);

  const markSeen = useCallback(async () => {
    await setOnboardingSeen();
    setSeen(true);
  }, []);

  return { loading, seen, markSeen };
}
