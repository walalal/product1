export const onRequest = async ({ env, params }) => {
  const sku = params.sku;

  const p = await env.product.get(sku, { type: "json" });

  if (!p) {
    return new Response("Product Not Found", { status: 404 });
  }

  // 大图区域初始显示第一张图片或视频封面
  const firstMedia = p.images?.[0] || (p.video ? "video" : "");

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${p.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
      .thumb-active {
        border: 2px solid #6366f1;
        opacity: 1 !important;
      }
      .thumb img, .thumb video {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #ddd;
        opacity: 0.8;
      }
      .thumb img:hover, .thumb video:hover { opacity: 1; }
      .main-container { position: relative; }
      .main-img, .main-video { width: 100%; border-radius: 12px; }
    </style>

    <script>
      function showMedia(src, type) {
        const container = document.getElementById("main-media-container");
        container.innerHTML = '';
        if(type === 'video') {
          const v = document.createElement('video');
          v.src = src;
          v.controls = true;
          v.autoplay = true;
          v.className = 'main-video';
          container.appendChild(v);
        } else {
          const i = document.createElement('img');
          i.src = src;
          i.className = 'main-img';
          container.appendChild(i);
        }

        document.querySelectorAll('.thumb').forEach((el) => {
          el.classList.remove('thumb-active');
        });
        document.getElementById('thumb-' + type + '-' + src).classList.add('thumb-active');
      }
    </script>
  </head>

  <body class="bg-gray-50 text-gray-900">
    <div class="max-w-6xl mx-auto p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">

      <!-- Left: Gallery -->
      <div class="space-y-4">

        <!-- Main media -->
        <div id="main-media-container" class="main-container">
          ${
            firstMedia === "video"
              ? `<video src="${p.video}" controls autoplay class="main-video"></video>`
              : `<img src="${firstMedia}" class="main-img"/>`
          }
        </div>

        <!-- Thumbnails -->
        <div class="flex gap-3 overflow-x-auto">
          ${
            p.images
              ?.map(
                (img) => `
            <div id="thumb-img-${img}" class="thumb thumb-active" onclick="showMedia('${img}','image')">
              <img src="${img}">
            </div>`
              )
              .join("") || ""
          }

          ${
            p.video
              ? `
            <div id="thumb-video-${p.video}" class="thumb" onclick="showMedia('${p.video}','video')">
              <video src="${p.video}" muted></video>
            </div>
          `
              : ""
          }
        </div>

      </div>

      <!-- Right: Product Info -->
      <div class="space-y-6">

        <!-- Title -->
        <h1 class="text-3xl font-bold leading-tight">${p.title}</h1>

        <!-- Price -->
        <div class="text-4xl font-bold text-indigo-600">$${p.price}</div>

        <!-- Attributes -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Product Details</h3>
          <table class="w-full text-sm">
            <tbody>
              ${Object.entries(p.attributes || {})
                .map(
                  ([k, v]) => `
              <tr class="border-b">
                <td class="py-2 font-medium text-gray-600 w-32">${k}</td>
                <td class="py-2">${v}</td>
              </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Description</h3>
          <div class="prose max-w-none">
            ${p.description}
          </div>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

