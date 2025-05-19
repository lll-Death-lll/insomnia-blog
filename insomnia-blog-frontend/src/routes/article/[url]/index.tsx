import { component$, Resource } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface Article {
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_link: string;
  image_url: string;
  created_at: string;
}

export const useArticle = routeLoader$(async ({ params, redirect }) => {
  try {
    const url = `http://api:3000/api/article/${params.url}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    const article: Article = await response.json();

    const html = DOMPurify.sanitize(
      await marked.parse(
        article.content.replace(
          /^(?:\u200B|\u200C|\u200D|\u200E|\u200F|\uFEFF)+/,
          "",
        ),
      ),
    );

    article.content = html;

    return article;
  } catch (e) {
    throw redirect(300, "/");
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 600,
    maxAge: 5,
  });
};

export default component$(() => {
  const articleResource = useArticle();

  return (
    <div class="flex justify-center">
      <Resource
        value={articleResource}
        onPending={() => (
          <div class="w-full max-w-6xl animate-pulse space-y-4">
            <div class="h-64 w-full rounded bg-gray-700" />
            <div class="h-8 w-3/4 rounded bg-gray-700" />
            <div class="h-4 w-1/2 rounded bg-gray-700" />
          </div>
        )}
        onResolved={(article) => (
          <div class="w-full max-w-4xl space-y-4 rounded-xl bg-gray-800 p-6 shadow-md">
            <img
              class="h-auto w-full rounded"
              src={article.image_url}
              alt={article.title}
              width={0}
              height={0}
            />
            <h1 class="text-3xl font-semibold">{article.title}</h1>
            <div class="flex space-x-4 text-gray-400">
              <a
                class="transition-colors duration-200 hover:text-purple-500"
                href={article.author_link}
              >
                {article.author_name}
              </a>
              <a
                class="transition-colors duration-200 hover:text-purple-500"
                href={`mailto:${article.author_email}`}
              >
                {article.author_email}
              </a>
            </div>
            <div
              class="prose prose-invert leading-8"
              dangerouslySetInnerHTML={article.content}
            />
            <span class="block text-sm text-gray-500">
              {new Date(article.created_at).toLocaleString()}
            </span>
          </div>
        )}
        onRejected={() => (
          <div class="text-red-400">Failed to load article.</div>
        )}
      />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const article = resolveValue(useArticle);
  return {
    title: `${article.title} | Insomnia Blog`,
  };
};
