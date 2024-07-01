import { useAtom } from "jotai";
import * as Linking from "expo-linking";

import supabaseClient from "../lib/gotrue";
import { isLoggedInAtom, resettingPasswordAtom } from "../store";
import segmentClient from "../lib/segment";

type Tokens = {
  access_token: string;
  refresh_token: string;
};

const useAuth = () => {
  const [loggedIn] = useAtom(isLoggedInAtom);
  const [resettingPassword, setResettingPassword] = useAtom(
    resettingPasswordAtom
  );

  const login = async (email: string, password: string) => {
    const supabase = await supabaseClient();
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result?.data.user) segmentClient.identify(result?.data.user.id);

    return result;
  };
  const loginWithToken = async ({ access_token, refresh_token }: Tokens) => {
    const supabase = await supabaseClient();
    await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    await supabase.auth.refreshSession();
    setResettingPassword(true);
  };

  const resetPassword = async (email: string) => {
    const resetPasswordURL = Linking.createURL("ResetPassword");
    const supabase = await supabaseClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetPasswordURL,
    });

    return { data, error };
  };

  const logout = async () => {
    const supabase = await supabaseClient();
    await supabase.auth.signOut();
  };

  return {
    login,
    loginWithToken,
    logout,
    loggedIn,
    resetPassword,
    resettingPassword,
  };
};

export default useAuth;
