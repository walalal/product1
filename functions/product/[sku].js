export const onRequest= async ({ env, params }) => {
  const task = await env.product.get(params.sku);
  return new Response(task);
};
