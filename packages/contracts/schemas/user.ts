import {baseSchema} from "./index";
import {z} from "zod";

export const userSchema = baseSchema.extend({
    email: z.string().email(),
    name: z.string(),
    profileImageSrc: z.string().nullable(),
    dockerHubAccessToken: z.string().nullable(),
})