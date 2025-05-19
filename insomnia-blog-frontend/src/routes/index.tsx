import { Resource, component$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import Article from "~/components/article/article";

interface Article {
  title: string;
  author: string;
  article_url: string;
  image_url: string;
  created_at: string;
}

export const useArticles = routeLoader$(async ({ query, error }) => {
  const articlesPerPage = 10;
  const offset =
    (isNaN(parseInt(query.get("offset") ?? ""))
      ? 0
      : parseInt(query.get("offset") ?? "0")) * articlesPerPage;

  const url = `http://api:3000/api/article?offset=${offset}&limit=${articlesPerPage}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    const articles: Article[] = await response.json();
    return articles;
  } catch (e) {
    throw error(500, e);
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 600,
    maxAge: 5,
  });
};

export default component$(() => {
  const articlesResource = useArticles();

  return (
    <div class="flex justify-center">
      <Resource
        value={articlesResource}
        onPending={() => (
          <div class="w-full max-w-4xl space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} class="flex animate-pulse space-x-4">
                <div class="h-24 w-24 rounded bg-gray-700" />
                <div class="flex-1 space-y-2 py-1">
                  <div class="h-6 w-3/4 rounded bg-gray-700" />
                  <div class="h-4 w-1/2 rounded bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}
        onResolved={(articles) => (
          <div class="flex w-full max-w-4xl flex-col space-y-4">
            {articles.map((article) => (
              <Article
                key={article.article_url}
                articleUrl={article.article_url}
                title={article.title}
                author={article.author}
                imageUrl={article.image_url}
                createdAt={new Date(article.created_at)}
              />
            ))}
          </div>
        )}
        onRejected={() => (
          <div class="text-red-400">Failed to load articles.</div>
        )}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Home | Insomnia Blog",
};
