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

export const useArticles = routeLoader$(async ({ query }) => {
  const articlesPerPage = 10;
  const offset =
    (isNaN(parseInt(query.get("offset") ?? ""))
      ? 0
      : parseInt(query.get("offset") ?? "0")) * articlesPerPage;

  const url = `http://api:3000/api/article?offset=${offset}&limit=${articlesPerPage}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }
  const articles: Article[] = await response.json();
  return articles;
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
    <main class="flex justify-center p-8">
      <Resource
        value={articlesResource}
        onResolved={(articles) => (
          <div class="flex max-w-5xl flex-col">
            {articles.map((article) => (
              <Article
                key={article.article_url}
                articleUrl={article.article_url}
                title={article.title}
                author={article.author}
                imageUrl={article.image_url}
                createdAt={new Date(Date.parse(article.created_at))}
              />
            ))}
          </div>
        )}
      />
    </main>
  );
});

export const head: DocumentHead = {
  title: "Home | Insomnia Blog",
};
