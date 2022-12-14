import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { schema } from "./schema"; 
import { context } from "./context"; // import context

export const server = new ApolloServer({
    schema,
    context, // add context to ApolloServer instance
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

const port = 3000;

server.listen({ port }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});