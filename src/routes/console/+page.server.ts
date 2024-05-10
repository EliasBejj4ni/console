import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    const environments = await prisma.environment.findMany();
    console.log(environments, "Loaded environments from DB");
    return {
        props: { environments },
    };
}

export const actions: Actions = {
    createEnvironment: async ({ request }) => {
        const formData = await request.formData();
        const environmentName = formData.get('environment_name');

        if (typeof environmentName !== 'string') {
            console.error('Invalid input for environment name');
            return fail(400, { message: "Invalid input for environment name." });
        }

        try {
            await prisma.environment.create({
                data: {
                    environment_name: environmentName,
                },
            });
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Could not create the environment." });
        }

        return {
            status: 303,
            headers: {
                location: '/'
            }
        };
    },
    deleteEnvironment: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get("id");

        if (!id || typeof id !== 'string') {
            return fail(400, { message: "Missing or invalid environment ID." });
        }

        try {
            await prisma.environment.delete({
                where: {
                    id: Number(id),
                },
            });
            return { status: 303, headers: { Location: '/' } }; // Redirect after successful deletion
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Could not delete the environment." });
        }
    },
    updateEnvironment: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const environmentName = formData.get('environment_name');

        if (typeof id !== 'string' || typeof environmentName !== 'string') {
            return fail(400, { message: "Invalid input for ID or environment name." });
        }

        try {
            await prisma.environment.update({
                where: { id: Number(id) },
                data: { environment_name: environmentName },
            });
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Could not update the environment." });
        }

        return {
            status: 200,
        };
    },
}