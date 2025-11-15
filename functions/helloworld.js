export function onRequest(context) {
  const task = context.env.product.get("00001");
  return new Response(task);
}
