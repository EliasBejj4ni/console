import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const load: RequestHandler = async () => {
    throw redirect(302, '/login');
};
