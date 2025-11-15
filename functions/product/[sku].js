export const onRequest= async ({ env, params }) => {
  const task = await env.product.get(params);
  return new Response(task);
};
