export async function onRequest(context) {
  const task = await context.env.product.get("00001");
  return new Response(task);
}
