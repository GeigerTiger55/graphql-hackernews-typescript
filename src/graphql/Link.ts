import { Prisma } from "@prisma/client";
import { extendSchema } from "graphql";
import { extendType, intArg, nonNull, objectType, stringArg, inputObjectType, enumType, arg, list } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            },
        });
    },
});

// No longer using because connecting to database

// let links: NexusGenObjects["Link"][] = [
//     {
//         id: 1,
//         url: "www.howtographql.com",
//         description: "Fullstack tutorial for GraphQL",
//     },
//     {
//         id: 2,
//         url: "graphql.org",
//         description: "GraphQL official website",
//     },
// ]

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(), //offset/starting index
                take: intArg(), //limit/# of items to be retrieved
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }), //order by value 
                        // is a list that can contain the various fields in the LinkOrderByInput object
            },
            async resolve(parent, args, context) {
                //return links;  --- no longer valid because connected to database
                const where = args.filter
                    ?   {
                            OR: [
                                { description: { contains: args.filter } },
                                { url: { contains: args.filter } },
                            ],
                        }
                    :   {};

                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined, // must typecast because Prisma interprets null has a value, and undefined to mean "do nothing"
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as 
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> 
                        | undefined,
                }); // find and return all Links in the db (that contain the filter argument if included)

                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id,
                }
            },
        });

        // FIXME:
        t.field("singleLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },

            resolve(parent, args, context, info) {

                // -- no longer valid because connecting to a database
                // const link = links.find( l => { return l.id === id; });
                // return link ? link : null;

                const link = context.prisma.link.findUnique({ where: { id: args.id } }); // FIXME
                return { link } 
                    ?   link
                    :   null;
            },
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;
                const { userId } = context;

                // --- no longer valid because using database
                // let idCount = links.length + 1;
                // const link = {
                //     id: idCount,
                //     description: description,
                //     url: url,
                // };
                // links.push(link);
                // return link;

                if (!userId) {
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({ // calling create method on the Link model from Prisma Client API
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } },
                    },
                });

                return newLink;
            },
        });
    },
 });

 export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort }); // the type of this field is "Sort" and the values must be in the enum list
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
 });

 export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
 });

 export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link });
        t.nonNull.int("count");
        t.id("id");
    },
 });