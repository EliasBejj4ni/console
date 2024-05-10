import { json, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

 
export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth()
 
  if (!session?.user) {
    throw redirect(302, '/?message=Please+sign+in+first');
  }
 
  return {
    session,
  }
};

