import {baseSchema} from "./index";
import {z} from "zod";

export const userSchema = baseSchema.extend({
    email: z.string().email(),
    name: z.string(),
    profileImageSrc: z.string().optional(),
    dockerHubAccessToken: z.string().optional(),
})