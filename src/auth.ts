import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { jwtDecode } from 'jwt-decode';
import { env } from '$env/dynamic/private';
 
export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Keycloak({
      clientId: env.AUTH_KEYCLOAK_ID,
      clientSecret: env.AUTH_KEYCLOAK_SECRET,
      issuer: env.AUTH_KEYCLOAK_ISSUER,
      authorization: { params: { scope: 'openid profile offline_access email' } },
    }),
  ],
  callbacks:{
    async jwt({token, account}){
        if(account){
            token.accessToken = account.access_token
            token.refreshToken = account.refresh_token;
            // @ts-ignore
            const decodedToken = jwtDecode(account.access_token);
            // @ts-ignore
            token.roles = decodedToken.realm_access?.roles;
        }
        return token
    },
    async session({ session, token, user}){
      if (token) {
        // @ts-ignore
        session.access_token = token.accessToken;
        // @ts-ignore
        session.refreshToken = token.refreshToken;
        // @ts-ignore
        session.roles = token.roles; 
      }
      return session;
    },
  }
}) 