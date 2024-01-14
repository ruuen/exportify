import { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const responseData = {
    message: "Big up the function test",
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};
