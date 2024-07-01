import { useEffect } from "react";
import { useAtom } from "jotai";

import supabaseClient from "../lib/gotrue";
import client from "../lib/graphql";
import { appLoadedAtom, isLoggedInAtom } from "../store";
import segmentClient from "../lib/segment";

const useAuthListener = () => {
  const [_, setLoggedIn] = useAtom(isLoggedInAtom);
  const [_s, setLoaded] = useAtom(appLoadedAtom);

  const getUserSession = async () => {
    const supabase = await supabaseClient();
    const user = await supabase.auth.getUser();

    if (user.data.user) {
      await supabase.auth.refreshSession();
      segmentClient.identify(user.data.user.id);
    }

    setLoaded(true);
  };

  useEffect(() => {
    getUserSession();
    let listener: any;
    const fetchData = async () => {
      const supabase = await supabaseClient();
      listener = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          client.setHeader("authorization", `Bearer ${session?.access_token}`);
          setLoggedIn(true);
        }

        if (event === "SIGNED_OUT") {
          client.setHeader("authorization", "");
          setLoggedIn(false);
        }
      });
    };
    fetchData();

    return () => {
      listener.data?.subscription?.unsubscribe();
    };
  }, []);
};

export default useAuthListener;
