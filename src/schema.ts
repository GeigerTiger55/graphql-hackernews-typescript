import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from "./graphql";

export const schema = makeSchema({
    types,
    outputs: {
        schema: join(process.cwd(), "schema.graphql"),
        typegen: join(process.cwd(), "nexus-typegen.ts"),
    },
    //configure Nexus to know the type of the GraphQL context
    contextType: {
        module: join(process.cwd(), "./src/context.ts"), // path to file (aka module)
        export: "Context", // name of the exported interface in the module
    },
});